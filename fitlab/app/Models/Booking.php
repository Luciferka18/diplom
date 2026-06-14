<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'trainer_id', 'trainer_service_id', 'payment_id', 'promo_code_id', 'promotion_id', 'location_id',
        'client_name', 'client_phone', 'client_comment', 'starts_at', 'ends_at', 'status',
        'subtotal_amount', 'discount_amount', 'total_amount', 'payment_status',
    ];

    protected $casts = ['starts_at' => 'datetime', 'ends_at' => 'datetime'];

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function service()
    {
        return $this->belongsTo(TrainerService::class, 'trainer_service_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
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
