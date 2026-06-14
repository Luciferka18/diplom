<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\TrainerService;
use App\Services\DiscountService;
use App\Services\PaymentService;
use App\Services\ActivityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::query()->with(['user:id,name,email,phone', 'trainer', 'location', 'service', 'payment'])->latest('starts_at');
        if ($request->user()->isTrainer() && $request->user()->trainerProfile) {
            $query->where('trainer_id', $request->user()->trainerProfile->id);
        } elseif (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }
        return BookingResource::collection($query->paginate((int) $request->integer('per_page', 10)));
    }

    public function next(Request $request)
    {
        $query = Booking::query()->with(['user:id,name,email,phone', 'trainer', 'location', 'service', 'payment'])
            ->where('starts_at', '>=', now())->where('status', 'booked')->orderBy('starts_at');
        if ($request->user()->isTrainer() && $request->user()->trainerProfile) {
            $query->where('trainer_id', $request->user()->trainerProfile->id);
        } elseif (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }
        $booking = $query->first();
        return response()->json(['booking' => $booking ? new BookingResource($booking) : null]);
    }

    public function store(Request $request, DiscountService $discounts, PaymentService $payments)
    {
        $data = $request->validate([
            'trainer_id' => ['required', 'integer', 'exists:trainers,id'],
            'trainer_service_id' => ['required', 'integer', 'exists:trainer_services,id'],
            'location_id' => ['nullable', 'integer', 'exists:gym_locations,id'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_phone' => ['required', 'string', 'max:255'],
            'client_comment' => ['nullable', 'string', 'max:2000'],
            'date' => ['required_without:starts_at', 'date'],
            'time' => ['required_without:starts_at', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'starts_at' => ['nullable', 'date'],
            'promo_code' => ['nullable', 'string', 'max:64'],
        ]);

        $trainer = Trainer::findOrFail($data['trainer_id']);
        $service = TrainerService::query()->where('is_active', true)->findOrFail($data['trainer_service_id']);
        abort_if($service->trainer_id && (int) $service->trainer_id !== (int) $trainer->id, 422, 'Эта услуга недоступна у выбранного тренера.');

        $startsAt = isset($data['starts_at']) ? Carbon::parse($data['starts_at']) : Carbon::parse("{$data['date']} {$data['time']}");
        if ($startsAt->isPast()) return response()->json(['message' => 'Нельзя записаться на прошедшее время.'], 422);

        $matchingSchedule = $this->findMatchingSchedule((int) $trainer->id, $startsAt, (int) $service->duration_minutes, $data['location_id'] ?? null);
        if (!$matchingSchedule) return response()->json(['message' => 'Выбранное время недоступно в расписании тренера.'], 422);
        $endsAt = $startsAt->copy()->addMinutes($service->duration_minutes);

        $conflict = Booking::query()->where('trainer_id', $trainer->id)->where('status', 'booked')
            ->where('starts_at', '<', $endsAt)->where('ends_at', '>', $startsAt)->exists();
        if ($conflict) return response()->json(['message' => 'Этот слот уже занят. Выберите другое время.'], 422);

        $discount = $discounts->calculate($request->user(), $data['promo_code'] ?? null, 'booking', (int) $service->price);

        $booking = DB::transaction(function () use ($request, $data, $trainer, $service, $matchingSchedule, $startsAt, $endsAt, $discount, $payments) {
            $booking = Booking::create([
                'user_id' => $request->user()->id,
                'trainer_id' => $trainer->id,
                'trainer_service_id' => $service->id,
                'promo_code_id' => $discount['promo_code']?->id,
                'promotion_id' => $discount['promotion']?->id,
                'location_id' => $data['location_id'] ?? $matchingSchedule->location_id ?? 1,
                'client_name' => $data['client_name'],
                'client_phone' => $data['client_phone'],
                'client_comment' => $data['client_comment'] ?? null,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'status' => 'booked',
                'subtotal_amount' => $service->price,
                'discount_amount' => $discount['discount'],
                'total_amount' => $discount['total'],
                'payment_status' => $discount['total'] > 0 ? 'pending' : 'paid',
            ]);
            $payment = $payments->create($booking, $request->user()->id, $discount['total'], [
                'kind' => 'trainer_booking', 'trainer_id' => $trainer->id, 'service_id' => $service->id,
            ]);
            $booking->update(['payment_id' => $payment->id]);
            return $booking->fresh(['user:id,name,email,phone', 'trainer', 'location', 'service', 'payment']);
        });

        $activity = app(ActivityService::class);
        $serviceName = $booking->service?->name ?: 'тренировка';
        $startsText = $booking->starts_at?->format('d.m.Y H:i');
        $activity->notifyUser($request->user(), 'booking.created', 'Запись создана', "Вы записаны на {$serviceName}: {$startsText}.", '/account/bookings', $booking, ['booking_id' => $booking->id], $request->user()->id, 'calendar');
        $activity->notifyTrainer($booking->trainer, 'trainer.booking.new', 'Новая запись клиента', "{$booking->client_name} записался на {$serviceName}: {$startsText}.", '/account/bookings', $booking, ['booking_id' => $booking->id], $request->user()->id, 'dumbbell');
        $activity->notifyAdmins('admin.booking.new', 'Новая запись к тренеру', "{$booking->client_name} записался к {$booking->trainer?->name}.", '/admin/bookings', $booking, ['booking_id' => $booking->id], $request->user()->id, 'calendar');

        return response()->json([
            'booking' => new BookingResource($booking),
            'data' => new BookingResource($booking),
            'message' => $booking->payment_status === 'paid' ? 'Запись создана.' : 'Запись создана. Завершите демонстрационную оплату.',
        ], 201);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $user = $request->user();
        $allowed = $user->isAdmin() || (int) $booking->user_id === (int) $user->id
            || ($user->isTrainer() && $user->trainerProfile && (int) $booking->trainer_id === (int) $user->trainerProfile->id);
        abort_unless($allowed, 403);
        if ($booking->status === 'completed') return response()->json(['message' => 'Завершённую запись нельзя отменить.'], 422);
        $booking->update(['status' => 'cancelled']);
        $fresh = $booking->fresh(['user:id,name,email,phone', 'trainer', 'location', 'service', 'payment']);
        $activity = app(ActivityService::class);
        $activity->notifyUser($fresh->user_id, 'booking.cancelled', 'Запись отменена', 'Запись к тренеру отменена.', '/account/bookings', $fresh, ['booking_id' => $fresh->id], $request->user()->id, 'calendar');
        $activity->notifyTrainer($fresh->trainer, 'trainer.booking.cancelled', 'Клиент отменил запись', "Запись {$fresh->client_name} отменена.", '/account/bookings', $fresh, ['booking_id' => $fresh->id], $request->user()->id, 'dumbbell');
        $activity->notifyAdmins('admin.booking.cancelled', 'Запись отменена', "Отменена запись к {$fresh->trainer?->name}.", '/admin/bookings', $fresh, ['booking_id' => $fresh->id], $request->user()->id, 'calendar');
        return response()->json(['booking' => new BookingResource($fresh), 'message' => 'Запись отменена.']);
    }

    private function findMatchingSchedule(int $trainerId, Carbon $startsAt, int $duration, ?int $locationId): ?TrainerSchedule
    {
        $schedules = TrainerSchedule::query()->where('trainer_id', $trainerId)->where('day_of_week', $startsAt->dayOfWeek)
            ->when($locationId, fn ($q) => $q->where(fn ($w) => $w->where('location_id', $locationId)->orWhereNull('location_id')))
            ->orderBy('start_time')->get();
        foreach ($schedules as $schedule) {
            $end = $startsAt->copy()->addMinutes($duration);
            $scheduleStart = Carbon::parse($startsAt->toDateString() . ' ' . substr((string) $schedule->start_time, 0, 5));
            $scheduleEnd = Carbon::parse($startsAt->toDateString() . ' ' . substr((string) $schedule->end_time, 0, 5));
            if ($startsAt->lt($scheduleStart) || $end->gt($scheduleEnd)) continue;
            $step = max(1, $duration);
            if ($scheduleStart->diffInMinutes($startsAt) % $step !== 0) continue;
            return $schedule;
        }
        return null;
    }
}
