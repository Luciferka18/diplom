<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'week_number',
        'day_number',
        'duration_minutes',
        'sort_order',
        'is_generated',
        'title',
        'description',
        'video_path',
    ];

    protected $casts = [
        'week_number' => 'integer',
        'day_number' => 'integer',
        'duration_minutes' => 'integer',
        'sort_order' => 'integer',
        'is_generated' => 'boolean',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
