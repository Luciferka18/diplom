<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentIntent extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'provider', 'status', 'client_secret', 'idempotency_key', 'confirmed_at'];

    protected $casts = ['confirmed_at' => 'datetime'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
