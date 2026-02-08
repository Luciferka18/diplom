<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'level',
        'duration_weeks',
        'focus',
        'slug',
        'short_description',
        'description',
        'muscle_groups',
        'diet_recommendations',
        'supplement_recommendations',
        'workout_plan',
        'price',
        'is_active',
    ];
}


