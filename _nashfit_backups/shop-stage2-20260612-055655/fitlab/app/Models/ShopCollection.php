<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopCollection extends Model
{
    protected $fillable = ['name', 'slug', 'subtitle', 'image_url', 'is_active', 'sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    public function products() { return $this->belongsToMany(Product::class, 'shop_collection_product')->withPivot('sort_order')->orderByPivot('sort_order'); }
}
