<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'technique',
        'common_mistakes',
        'difficulty',
        'equipment',
        'video_url',
        'thumbnail_url',
    ];

    public function muscles()
    {
        return $this->belongsToMany(Muscle::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function primaryMuscles()
    {
        return $this->belongsToMany(Muscle::class)
            ->withPivot('role')
            ->wherePivot('role', 'primary')
            ->withTimestamps();
    }

    public function secondaryMuscles()
    {
        return $this->belongsToMany(Muscle::class)
            ->withPivot('role')
            ->wherePivot('role', 'secondary')
            ->withTimestamps();
    }
}
