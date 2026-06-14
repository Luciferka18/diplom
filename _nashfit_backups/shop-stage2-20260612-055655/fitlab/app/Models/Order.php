<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id','status','payment_status','currency','items_count','subtotal','discount','delivery','delivery_method',
        'pickup_location','total','customer_name','customer_phone','customer_email','address_line','city','postal_code',
        'comment','promo_code_id','promotion_id',
    ];

    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function promoCode() { return $this->belongsTo(PromoCode::class); }
    public function promotion() { return $this->belongsTo(Promotion::class); }
    public function payments() { return $this->morphMany(Payment::class, 'payable'); }
}
