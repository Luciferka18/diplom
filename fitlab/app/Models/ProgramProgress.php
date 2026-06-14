<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramProgress extends Model
{
    use HasFactory;

    /**
     * "Progress" is treated as an uncountable word by Laravel's pluralizer,
     * so Eloquent would otherwise look for the singular table program_progress.
     */
    protected $table = 'program_progresses';

    protected $fillable = [
        'user_id',
        'program_id',
        'completed_weeks',
        'status',
        'started_at',
        'completed_at',
        'last_activity_at',
    ];

    protected $casts = [
        'completed_weeks' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
