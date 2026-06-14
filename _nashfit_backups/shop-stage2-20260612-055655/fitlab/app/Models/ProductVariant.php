<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'name', 'sku', 'options', 'price', 'old_price', 'stock', 'image_url', 'is_active', 'sort_order'];
    protected $casts = ['options' => 'array', 'price' => 'decimal:2', 'old_price' => 'decimal:2', 'is_active' => 'boolean'];
    public function product() { return $this->belongsTo(Product::class); }
}
