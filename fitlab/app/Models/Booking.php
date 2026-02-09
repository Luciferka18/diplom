<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'trainer_id', 'location_id', 'client_name', 'client_phone', 'client_comment', 'starts_at', 'ends_at', 'status'];

    protected $casts = ['starts_at' => 'datetime', 'ends_at' => 'datetime'];

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function location()
    {
        return $this->belongsTo(GymLocation::class, 'location_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
