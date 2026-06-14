<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'promotion_id', 'code', 'description', 'discount_type', 'discount_value', 'applies_to',
        'minimum_amount', 'max_uses', 'per_user_limit', 'uses_count', 'is_active', 'starts_at', 'ends_at',
    ];

    protected $casts = [
        'applies_to' => 'array',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'discount_value' => 'float',
    ];

    public function promotion() { return $this->belongsTo(Promotion::class); }
    public function redemptions() { return $this->hasMany(PromoRedemption::class); }
}
