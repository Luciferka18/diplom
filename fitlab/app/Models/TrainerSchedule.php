<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainerSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'location_id',
        'day_of_week',
        'start_time',
        'end_time',
        'slot_duration_minutes',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'start_time' => 'string',
        'end_time' => 'string',
        'slot_duration_minutes' => 'integer',
    ];

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function location()
    {
        return $this->belongsTo(GymLocation::class);
    }

    /**
     * Получить массив доступных слотов для данной записи расписания
     */
    public function getTimeSlotsAttribute(): array
    {
        $start = strtotime($this->start_time);
        $end = strtotime($this->end_time);
        $duration = $this->slot_duration_minutes * 60;
        $slots = [];

        for ($time = $start; $time + $duration <= $end; $time += $duration) {
            $slots[] = date('H:i', $time);
        }

        return $slots;
    }
}
