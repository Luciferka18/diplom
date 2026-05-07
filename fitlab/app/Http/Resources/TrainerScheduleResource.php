<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $dayNames = [
            0 => 'Воскресенье',
            1 => 'Понедельник',
            2 => 'Вторник',
            3 => 'Среда',
            4 => 'Четверг',
            5 => 'Пятница',
            6 => 'Суббота',
        ];

        return [
            'id' => $this->id,
            'trainer_id' => $this->trainer_id,
            'location_id' => $this->location_id,
            'location_name' => $this->when($this->location, $this->location?->name),
            'day_of_week' => $this->day_of_week,
            'day_name' => $dayNames[$this->day_of_week] ?? '',
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'slot_duration_minutes' => $this->slot_duration_minutes,
        ];
    }
}
