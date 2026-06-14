<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ShopAccountController extends Controller
{
    public function favorites(Request $request)
    {
        $products = $request->user()->favoriteProducts()
            ->where('products.is_active', true)
            ->with(['category', 'variants'])
            ->withCount('reviews')
            ->withAvg('reviews as rating_avg', 'rating')
            ->latest('product_wishlists.created_at')
            ->get();
        $products->each(fn ($product) => $product->setAttribute('is_favorite', true));
        return ProductResource::collection($products);
    }

    public function toggleFavorite(Request $request, Product $product)
    {
        $exists = $request->user()->favoriteProducts()->where('products.id', $product->id)->exists();
        if ($exists) $request->user()->favoriteProducts()->detach($product->id);
        else $request->user()->favoriteProducts()->attach($product->id);
        return response()->json(['is_favorite' => !$exists]);
    }

    public function recent(Request $request)
    {
        $products = Product::query()
            ->join('product_views', 'products.id', '=', 'product_views.product_id')
            ->where('product_views.user_id', $request->user()->id)
            ->where('products.is_active', true)
            ->orderByDesc('product_views.viewed_at')
            ->select('products.*')
            ->with(['category', 'variants'])
            ->withCount('reviews')
            ->withAvg('reviews as rating_avg', 'rating')
            ->limit(12)
            ->get();
        return ProductResource::collection($products);
    }
}
