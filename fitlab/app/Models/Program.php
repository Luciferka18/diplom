<?php

namespace App\Models;

use App\Services\ProgramPlanGenerator;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'level', 'duration_weeks', 'price', 'trainer_id', 'image_url'];

    protected $casts = [
        'duration_weeks' => 'integer',
        'price' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::saving(function (Program $program): void {
            $program->price = 0;
        });

        static::saved(function (Program $program): void {
            app(ProgramPlanGenerator::class)->ensure($program);
        });
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable')->latest();
    }

    public function workouts()
    {
        return $this->hasMany(Workout::class)
            ->orderBy('week_number')
            ->orderBy('day_number')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function progresses()
    {
        return $this->hasMany(ProgramProgress::class);
    }
}
