<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug', 'name', 'short_description', 'description', 'brand', 'sku', 'price', 'old_price',
        'stock', 'image_url', 'gallery', 'attributes', 'badges', 'category_id', 'is_featured',
        'is_new', 'trainer_pick', 'home_use', 'is_active', 'views_count',
    ];

    protected $casts = [
        'price' => 'decimal:2', 'old_price' => 'decimal:2', 'gallery' => 'array', 'attributes' => 'array',
        'badges' => 'array', 'is_featured' => 'boolean', 'is_new' => 'boolean', 'trainer_pick' => 'boolean',
        'home_use' => 'boolean', 'is_active' => 'boolean',
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function tags() { return $this->morphToMany(Tag::class, 'taggable'); }
    public function variants() { return $this->hasMany(ProductVariant::class)->orderBy('sort_order')->orderBy('id'); }
    public function reviews() { return $this->morphMany(Review::class, 'reviewable'); }
    public function wishlistedBy() { return $this->belongsToMany(User::class, 'product_wishlists')->withTimestamps(); }
    public function trainerRecommendations() { return $this->belongsToMany(Trainer::class, 'trainer_product_recommendations')->withPivot(['comment', 'is_featured'])->withTimestamps(); }
    public function relatedProducts() { return $this->belongsToMany(Product::class, 'product_relations', 'product_id', 'related_product_id')->withPivot(['type', 'sort_order'])->orderByPivot('sort_order'); }
    public function collections() { return $this->belongsToMany(ShopCollection::class, 'shop_collection_product')->withPivot('sort_order'); }

    public function availableStock(): int
    {
        if ($this->relationLoaded('variants') ? $this->variants->isNotEmpty() : $this->variants()->exists()) {
            return (int) $this->variants()->where('is_active', true)->sum('stock');
        }
        return (int) $this->stock;
    }
}
