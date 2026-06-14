<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'membership_id', 'payment_id', 'promo_code_id', 'promotion_id', 'status',
        'subtotal_amount', 'discount_amount', 'total_amount', 'starts_at', 'ends_at',
        'is_trial_grant', 'metadata',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_trial_grant' => 'boolean',
        'metadata' => 'array',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function membership() { return $this->belongsTo(Membership::class); }
    public function payment() { return $this->belongsTo(Payment::class); }
    public function promoCode() { return $this->belongsTo(PromoCode::class); }
    public function promotion() { return $this->belongsTo(Promotion::class); }

    public function activate(): void
    {
        $start = now();
        $months = $this->membership?->duration_months;
        $this->update([
            'status' => 'active',
            'starts_at' => $this->starts_at ?: $start,
            'ends_at' => $this->ends_at ?: ($months ? $start->copy()->addMonths($months) : null),
        ]);
    }
}
