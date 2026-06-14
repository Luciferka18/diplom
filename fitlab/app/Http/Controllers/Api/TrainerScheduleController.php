<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerScheduleResource;
use App\Models\Booking;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\TrainerService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainerScheduleController extends Controller
{
    public function index($trainerId)
    {
        $trainer = Trainer::find($trainerId);
        if (!$trainer) {
            return response()->json(['message' => 'Trainer not found'], 404);
        }

        $schedules = TrainerSchedule::with('location')
            ->where('trainer_id', $trainerId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return TrainerScheduleResource::collection($schedules);
    }

    public function availableSlots($trainerId, Request $request)
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'service_id' => ['nullable', 'integer', 'exists:trainer_services,id'],
        ]);

        $trainer = Trainer::find($trainerId);
        if (!$trainer) {
            return response()->json(['message' => 'Trainer not found'], 404);
        }

        $service = $this->resolveService($trainer, $data['service_id'] ?? null);
        $date = Carbon::parse($data['date'])->startOfDay();

        if ($date->lt(now()->startOfDay())) {
            return response()->json([
                'date' => $date->toDateString(),
                'day_of_week' => (int) $date->dayOfWeek,
                'slots' => [],
                'message' => 'Нельзя записаться на прошедшую дату.',
            ]);
        }

        $slots = $this->buildSlots($trainer, $date, $service);

        return response()->json([
            'date' => $date->toDateString(),
            'day_of_week' => (int) $date->dayOfWeek,
            'slots' => $slots,
            'message' => count($slots) ? null : 'На выбранную дату свободных слотов нет.',
        ]);
    }

    public function availableDays($trainerId, Request $request)
    {
        $data = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'service_id' => ['nullable', 'integer', 'exists:trainer_services,id'],
        ]);

        $trainer = Trainer::find($trainerId);
        if (!$trainer) {
            return response()->json(['message' => 'Trainer not found'], 404);
        }

        $service = $this->resolveService($trainer, $data['service_id'] ?? null);
        $monthStart = Carbon::createFromFormat('Y-m', $data['month'])->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $today = now()->startOfDay();
        $days = [];
        $schedulesByDay = TrainerSchedule::with('location')
            ->where('trainer_id', $trainer->id)
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn (TrainerSchedule $schedule) => (int) $schedule->day_of_week);
        $bookingsByDate = Booking::query()
            ->where('trainer_id', $trainer->id)
            ->where('status', 'booked')
            ->whereBetween('starts_at', [$monthStart->copy()->startOfDay(), $monthEnd->copy()->endOfDay()])
            ->get(['starts_at', 'ends_at'])
            ->groupBy(fn (Booking $booking) => $booking->starts_at->toDateString());

        for ($date = $monthStart->copy(); $date->lte($monthEnd); $date->addDay()) {
            if ($date->lt($today)) {
                continue;
            }

            $slots = $this->buildSlots(
                $trainer,
                $date->copy(),
                $service,
                $schedulesByDay->get((int) $date->dayOfWeek, collect()),
                $bookingsByDate->get($date->toDateString(), collect())
            );
            if (!count($slots)) {
                continue;
            }

            $days[] = [
                'date' => $date->toDateString(),
                'slots_count' => count($slots),
                'first_time' => $slots[0]['time'] ?? null,
                'last_time' => $slots[count($slots) - 1]['time'] ?? null,
            ];
        }

        return response()->json([
            'month' => $data['month'],
            'days' => $days,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        if (!$user || (!$user->isAdmin() && !$user->isTrainer())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'trainer_id' => ['nullable', 'integer', 'exists:trainers,id'],
            'schedules' => ['required', 'array'],
            'schedules.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'schedules.*.start_time' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'schedules.*.end_time' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'schedules.*.location_id' => ['nullable', 'integer', 'exists:gym_locations,id'],
            'schedules.*.slot_duration_minutes' => ['nullable', 'integer', 'min:15', 'max:240'],
        ]);

        if ($user->isTrainer()) {
            $trainer = $user->trainerProfile;
        } else {
            $trainer = Trainer::find($data['trainer_id'] ?? null);
        }

        if (!$trainer) {
            return response()->json(['message' => 'Trainer not found'], 404);
        }

        $normalizedSchedules = collect($data['schedules'])->map(function (array $schedule) {
            $start = substr((string) $schedule['start_time'], 0, 5);
            $end = substr((string) $schedule['end_time'], 0, 5);

            if (Carbon::parse('2000-01-01 ' . $end)->lte(Carbon::parse('2000-01-01 ' . $start))) {
                abort(response()->json([
                    'message' => 'Время окончания должно быть позже времени начала.',
                ], 422));
            }

            return [
                'day_of_week' => (int) $schedule['day_of_week'],
                'start_time' => $start,
                'end_time' => $end,
                'location_id' => $schedule['location_id'] ?? null,
                'slot_duration_minutes' => (int) ($schedule['slot_duration_minutes'] ?? 60),
            ];
        });

        $trainer->schedules()->delete();

        foreach ($normalizedSchedules as $schedule) {
            $trainer->schedules()->create($schedule);
        }

        $schedules = $trainer->fresh()->schedules()->with('location')->orderBy('day_of_week')->orderBy('start_time')->get();

        return response()->json([
            'message' => 'Расписание обновлено.',
            'data' => TrainerScheduleResource::collection($schedules)->resolve(),
        ]);
    }

    private function resolveService(Trainer $trainer, ?int $serviceId): ?TrainerService
    {
        if (!$serviceId) {
            return null;
        }

        $service = TrainerService::query()->where('is_active', true)->find($serviceId);
        if (!$service) {
            abort(response()->json(['message' => 'Услуга недоступна.'], 422));
        }

        if ($service->trainer_id && (int) $service->trainer_id !== (int) $trainer->id) {
            abort(response()->json(['message' => 'Услуга недоступна у этого тренера.'], 422));
        }

        return $service;
    }

    private function buildSlots(Trainer $trainer, Carbon $date, ?TrainerService $service, $schedules = null, $bookings = null): array
    {
        $schedules ??= TrainerSchedule::with('location')
            ->where('trainer_id', $trainer->id)
            ->where('day_of_week', (int) $date->dayOfWeek)
            ->orderBy('start_time')
            ->get();

        if ($schedules->isEmpty()) {
            return [];
        }

        $bookings ??= Booking::query()
            ->where('trainer_id', $trainer->id)
            ->where('status', 'booked')
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'ends_at']);

        $slots = [];

        foreach ($schedules as $schedule) {
            $durationMinutes = max(15, (int) ($service?->duration_minutes ?: $schedule->slot_duration_minutes ?: 60));
            $scheduleStart = Carbon::parse($date->toDateString() . ' ' . substr((string) $schedule->start_time, 0, 5));
            $scheduleEnd = Carbon::parse($date->toDateString() . ' ' . substr((string) $schedule->end_time, 0, 5));

            for ($slotStart = $scheduleStart->copy(); $slotStart->copy()->addMinutes($durationMinutes)->lte($scheduleEnd); $slotStart->addMinutes($durationMinutes)) {
                $slotEnd = $slotStart->copy()->addMinutes($durationMinutes);

                if ($slotStart->isPast()) {
                    continue;
                }

                $isBooked = $bookings->contains(function (Booking $booking) use ($slotStart, $slotEnd) {
                    return $booking->starts_at->lt($slotEnd) && $booking->ends_at->gt($slotStart);
                });

                if ($isBooked) {
                    continue;
                }

                $key = $slotStart->toDateTimeString() . ':' . ($schedule->location_id ?? 'none');
                $slots[$key] = [
                    'date' => $date->toDateString(),
                    'time' => $slotStart->format('H:i'),
                    'starts_at' => $slotStart->toDateTimeString(),
                    'ends_at' => $slotEnd->toDateTimeString(),
                    'duration_minutes' => $durationMinutes,
                    'location_id' => $schedule->location_id,
                    'location_name' => $schedule->location?->name,
                    'schedule_id' => $schedule->id,
                ];
            }
        }

        $slots = array_values($slots);
        usort($slots, fn (array $a, array $b) => strcmp($a['starts_at'], $b['starts_at']));

        return $slots;
    }
}
