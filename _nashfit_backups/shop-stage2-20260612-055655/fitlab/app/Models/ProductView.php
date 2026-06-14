<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductView extends Model
{
    protected $fillable = ['user_id', 'product_id', 'viewed_at'];
    protected $casts = ['viewed_at' => 'datetime'];
    public function product() { return $this->belongsTo(Product::class); }
}
