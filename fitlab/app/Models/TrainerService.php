<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainerService extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id', 'name', 'slug', 'description', 'duration_minutes', 'price',
        'badge', 'is_intro', 'is_active', 'sort_order',
    ];

    protected $casts = ['is_intro' => 'boolean', 'is_active' => 'boolean', 'price' => 'integer'];
    public function trainer() { return $this->belongsTo(Trainer::class); }
    public function bookings() { return $this->hasMany(Booking::class); }
}
