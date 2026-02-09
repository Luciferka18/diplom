<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'status', 'total_amount', 'currency', 'payment_status', 'customer_name', 'customer_phone', 'customer_email'];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentIntents()
    {
        return $this->hasMany(PaymentIntent::class);
    }
}
