<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Muscle extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'latin_name',
        'description',
        'function',
        'how_to_grow',
        'body_side',
    ];

    public function exercises()
    {
        return $this->belongsToMany(Exercise::class)
            ->withPivot('role')
            ->withTimestamps()
            ->orderByPivot('role');
    }

    public function primaryExercises()
    {
        return $this->belongsToMany(Exercise::class)
            ->withPivot('role')
            ->wherePivot('role', 'primary')
            ->withTimestamps();
    }

    public function secondaryExercises()
    {
        return $this->belongsToMany(Exercise::class)
            ->withPivot('role')
            ->wherePivot('role', 'secondary')
            ->withTimestamps();
    }
}
