<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GymLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'description',
        'phone',
        'email',
        'working_hours',
        'weekend_hours',
        'features',
        'latitude',
        'longitude',
        'map_url',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
