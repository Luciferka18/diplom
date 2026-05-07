<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerScheduleResource;
use App\Models\Booking;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainerScheduleController extends Controller
{
    /**
     * Получить расписание тренера (публичный доступ)
     */
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

    /**
     * Получить доступные слоты для тренера на конкретную дату
     */
    public function availableSlots($trainerId, Request $request)
    {
        $request->validate([
            'date' => ['required', 'date'],
        ]);

        $trainer = Trainer::find($trainerId);
        if (!$trainer) {
            return response()->json(['message' => 'Trainer not found'], 404);
        }

        $date = $request->input('date');
        $dayOfWeek = (int) date('w', strtotime($date)); // 0=Вс, 1=Пн, ...

        // Находим расписание на этот день недели
        $schedules = TrainerSchedule::with('location')
            ->where('trainer_id', $trainerId)
            ->where('day_of_week', $dayOfWeek)
            ->get();

        if ($schedules->isEmpty()) {
            return response()->json(['slots' => [], 'message' => 'Тренер не работает в этот день']);
        }

        // Собираем все слоты
        $allSlots = [];
        foreach ($schedules as $schedule) {
            $start = strtotime($schedule->start_time);
            $end = strtotime($schedule->end_time);
            $duration = $schedule->slot_duration_minutes * 60;

            for ($time = $start; $time + $duration <= $end; $time += $duration) {
                $slotTime = date('H:i', $time);
                $allSlots[] = [
                    'time' => $slotTime,
                    'location_id' => $schedule->location_id,
                    'location_name' => $schedule->location?->name ?? null,
                    'schedule_id' => $schedule->id,
                ];
            }
        }

        // Находим уже забронированные слоты на эту дату
        $bookedSlots = Booking::where('trainer_id', $trainerId)
            ->whereDate('date', $date)
            ->pluck('time')
            ->toArray();

        // Фильтруем занятые слоты
        $availableSlots = array_filter($allSlots, function ($slot) use ($bookedSlots) {
            return !in_array($slot['time'], $bookedSlots);
        });

        return response()->json([
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'slots' => array_values($availableSlots),
        ]);
    }

    /**
     * Обновить расписание (только для тренера/админа)
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        if (!$user || (!$user->isAdmin() && !$user->isTrainer())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'schedules' => ['required', 'array'],
            'schedules.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'schedules.*.start_time' => ['required', 'date_format:H:i'],
            'schedules.*.end_time' => ['required', 'date_format:H:i', 'after:schedules.*.start_time'],
            'schedules.*.location_id' => ['nullable', 'exists:gym_locations,id'],
            'schedules.*.slot_duration_minutes' => ['nullable', 'integer', 'min:15', 'max:240'],
        ]);

        // Определяем тренера
        if ($user->isTrainer()) {
            $trainer = $user->trainerProfile;
        } else {
            // Админ может редактировать любого тренера
            $trainerId = $request->input('trainer_id');
            if (!$trainerId) {
                return response()->json(['message' => 'trainer_id required for admin'], 400);
            }
            $trainer = Trainer::find($trainerId);
        }

        if (!$trainer) {
            return response()->json(['message' => 'Trainer not found'], 404);
        }

        // Удаляем старое расписание
        $trainer->schedules()->delete();

        // Создаём новое
        foreach ($request->input('schedules') as $scheduleData) {
            TrainerSchedule::create([
                'trainer_id' => $trainer->id,
                'location_id' => $scheduleData['location_id'] ?? null,
                'day_of_week' => $scheduleData['day_of_week'],
                'start_time' => $scheduleData['start_time'],
                'end_time' => $scheduleData['end_time'],
                'slot_duration_minutes' => $scheduleData['slot_duration_minutes'] ?? 60,
            ]);
        }

        return response()->json(['message' => 'Расписание обновлено']);
    }
}
