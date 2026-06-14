<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variants = $this->relationLoaded('variants') ? $this->variants : collect();
        $rating = isset($this->rating_avg) ? round((float) $this->rating_avg, 1) : 0;
        $reviewsCount = isset($this->reviews_count) ? (int) $this->reviews_count : 0;
        $stock = $variants->isNotEmpty() ? (int) $variants->where('is_active', true)->sum('stock') : (int) $this->stock;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'title' => $this->name,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'brand' => $this->brand,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'old_price' => $this->old_price !== null ? (float) $this->old_price : null,
            'stock' => $stock,
            'in_stock' => $stock > 0,
            'image_url' => $this->image_url,
            'gallery' => array_values(array_filter($this->gallery ?: [])),
            'attributes' => $this->attributes ?: [],
            'badges' => $this->badges ?: [],
            'is_featured' => (bool) $this->is_featured,
            'is_new' => (bool) $this->is_new,
            'trainer_pick' => (bool) $this->trainer_pick,
            'home_use' => (bool) $this->home_use,
            'is_active' => (bool) $this->is_active,
            'views_count' => (int) $this->views_count,
            'rating' => $rating,
            'reviews_count' => $reviewsCount,
            'is_favorite' => (bool) ($this->is_favorite ?? false),
            'category' => $this->category?->name,
            'category_id' => $this->category_id,
            'category_data' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'name' => $variant->name,
                'sku' => $variant->sku,
                'options' => $variant->options ?: [],
                'price' => $variant->price !== null ? (float) $variant->price : (float) $this->price,
                'old_price' => $variant->old_price !== null ? (float) $variant->old_price : null,
                'stock' => (int) $variant->stock,
                'image_url' => $variant->image_url,
                'is_active' => (bool) $variant->is_active,
            ])->values()),
            'trainer_recommendations' => $this->whenLoaded('trainerRecommendations', fn () => $this->trainerRecommendations->map(fn ($trainer) => [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'specialization' => $trainer->specialization,
                'photo_url' => $trainer->photo_url,
                'comment' => $trainer->pivot?->comment,
                'is_featured' => (bool) $trainer->pivot?->is_featured,
            ])->values()),
            'related_products' => $this->whenLoaded('relatedProducts', fn () => $this->relatedProducts->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'brand' => $product->brand,
                'price' => (float) $product->price,
                'old_price' => $product->old_price !== null ? (float) $product->old_price : null,
                'image_url' => $product->image_url,
                'stock' => $product->relationLoaded('variants') && $product->variants->isNotEmpty() ? (int) $product->variants->sum('stock') : (int) $product->stock,
                'in_stock' => ($product->relationLoaded('variants') && $product->variants->isNotEmpty() ? $product->variants->sum('stock') : $product->stock) > 0,
                'variants' => $product->relationLoaded('variants') ? $product->variants->where('is_active', true)->map(fn ($variant) => [
                    'id' => $variant->id, 'name' => $variant->name, 'sku' => $variant->sku,
                    'options' => $variant->options ?: [], 'price' => $variant->price !== null ? (float) $variant->price : (float) $product->price,
                    'old_price' => $variant->old_price !== null ? (float) $variant->old_price : null,
                    'stock' => (int) $variant->stock, 'image_url' => $variant->image_url, 'is_active' => (bool) $variant->is_active,
                ])->values() : [],
                'type' => $product->pivot?->type,
            ])->values()),
            'created_at' => $this->created_at,
        ];
    }
}
