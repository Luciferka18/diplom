<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::query()
            ->with(['trainer', 'location'])
            ->latest('starts_at');

        if ($request->user()->isTrainer() && $request->user()->trainerProfile) {
            $query->where('trainer_id', $request->user()->trainerProfile->id);
        } elseif (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        return BookingResource::collection(
            $query->paginate((int) $request->integer('per_page', 10))
        );
    }

    public function next(Request $request)
    {
        $query = Booking::query()
            ->with(['trainer', 'location'])
            ->where('starts_at', '>=', now())
            ->where('status', 'booked')
            ->orderBy('starts_at');

        if ($request->user()->isTrainer() && $request->user()->trainerProfile) {
            $query->where('trainer_id', $request->user()->trainerProfile->id);
        } elseif (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        $booking = $query->first();

        return response()->json([
            'booking' => $booking ? new BookingResource($booking) : null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'trainer_id' => ['required', 'integer', 'exists:trainers,id'],
            'location_id' => ['nullable', 'integer', 'exists:gym_locations,id'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_phone' => ['required', 'string', 'max:255'],
            'client_comment' => ['nullable', 'string', 'max:2000'],
            'date' => ['required_without:starts_at', 'date'],
            'time' => ['required_without:starts_at', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'starts_at' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:240'],
        ]);

        $trainer = Trainer::query()->find($data['trainer_id']);
        if (!$trainer) {
            return response()->json(['message' => 'Тренер не найден.'], 404);
        }

        $startsAt = isset($data['starts_at'])
            ? Carbon::parse($data['starts_at'])
            : Carbon::parse("{$data['date']} {$data['time']}");

        if ($startsAt->isPast()) {
            return response()->json([
                'message' => 'Нельзя записаться на прошедшее время.',
            ], 422);
        }

        $matchingSchedule = $this->findMatchingSchedule(
            trainerId: (int) $data['trainer_id'],
            startsAt: $startsAt,
            requestedDuration: isset($data['duration_minutes']) ? (int) $data['duration_minutes'] : null,
            requestedLocationId: isset($data['location_id']) ? (int) $data['location_id'] : null,
        );

        if (!$matchingSchedule) {
            return response()->json([
                'message' => 'Выбранное время недоступно в расписании тренера.',
            ], 422);
        }

        $durationMinutes = (int) ($data['duration_minutes'] ?? $matchingSchedule->slot_duration_minutes ?? 60);
        $endsAt = (clone $startsAt)->addMinutes($durationMinutes);

        $conflict = Booking::query()
            ->where('trainer_id', $data['trainer_id'])
            ->where('status', 'booked')
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Этот слот уже занят. Выберите другое время.',
            ], 422);
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'trainer_id' => $data['trainer_id'],
            'location_id' => $data['location_id'] ?? $matchingSchedule->location_id ?? 1,
            'client_name' => $data['client_name'],
            'client_phone' => $data['client_phone'],
            'client_comment' => $data['client_comment'] ?? null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'booked',
        ])->load(['trainer', 'location']);

        return response()->json([
            'booking' => new BookingResource($booking),
            'data' => new BookingResource($booking),
            'message' => 'Запись создана.',
        ], 201);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $user = $request->user();

        $canCancel = $user->isAdmin()
            || ((int) $booking->user_id === (int) $user->id)
            || ($user->isTrainer() && $user->trainerProfile && (int) $booking->trainer_id === (int) $user->trainerProfile->id);

        if (!$canCancel) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($booking->status === 'completed') {
            return response()->json([
                'message' => 'Завершённую запись нельзя отменить.',
            ], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'booking' => new BookingResource($booking->fresh(['trainer', 'location'])),
            'message' => 'Запись отменена.',
        ]);
    }

    private function findMatchingSchedule(int $trainerId, Carbon $startsAt, ?int $requestedDuration, ?int $requestedLocationId): ?TrainerSchedule
    {
        $dayOfWeek = (int) $startsAt->dayOfWeek;
        $date = $startsAt->toDateString();

        $schedules = TrainerSchedule::query()
            ->where('trainer_id', $trainerId)
            ->where('day_of_week', $dayOfWeek)
            ->when($requestedLocationId, fn ($query) => $query->where(function ($q) use ($requestedLocationId) {
                $q->where('location_id', $requestedLocationId)->orWhereNull('location_id');
            }))
            ->orderBy('start_time')
            ->get();

        foreach ($schedules as $schedule) {
            $duration = (int) ($requestedDuration ?? $schedule->slot_duration_minutes ?? 60);
            $endsAt = (clone $startsAt)->addMinutes($duration);

            $scheduleStart = Carbon::parse($date . ' ' . substr((string) $schedule->start_time, 0, 5));
            $scheduleEnd = Carbon::parse($date . ' ' . substr((string) $schedule->end_time, 0, 5));

            if ($startsAt->lt($scheduleStart) || $endsAt->gt($scheduleEnd)) {
                continue;
            }

            $step = max(1, (int) ($schedule->slot_duration_minutes ?? 60));
            if ($scheduleStart->diffInMinutes($startsAt) % $step !== 0) {
                continue;
            }

            return $schedule;
        }

        return null;
    }
}
