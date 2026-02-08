<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainer_id',
        'user_id',
        'client_name',
        'client_phone',
        'client_comment',
        'date',
        'time',
        'status',
    ];

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }
}


