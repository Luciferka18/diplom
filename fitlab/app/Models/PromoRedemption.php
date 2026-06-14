<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoRedemption extends Model
{
    protected $fillable = ['promo_code_id', 'user_id', 'redeemable_type', 'redeemable_id', 'discount_amount'];
    public function promoCode() { return $this->belongsTo(PromoCode::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function redeemable() { return $this->morphTo(); }
}
