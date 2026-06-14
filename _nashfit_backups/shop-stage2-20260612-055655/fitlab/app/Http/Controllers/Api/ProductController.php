<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShopCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $adminView = $request->boolean('admin') && $user?->isAdmin();
        $query = Product::query()
            ->when(!$adminView, fn ($q) => $q->where('is_active', true))
            ->with(['category', 'variants' => fn ($q) => $q->where('is_active', true)])
            ->withCount('reviews')
            ->withAvg('reviews as rating_avg', 'rating');

        if ($request->filled('category')) {
            $category = trim((string) $request->input('category'));
            $query->whereHas('category', fn ($q) => $q->where('slug', $category)->orWhere('id', $category));
        }
        if ($request->filled('brand')) $query->where('brand', (string) $request->input('brand'));
        if ($request->filled('q')) {
            $term = trim((string) $request->input('q'));
            $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")
                ->orWhere('short_description', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('brand', 'like', "%{$term}%"));
        }
        if ($request->filled('min_price')) $query->where('price', '>=', (float) $request->input('min_price'));
        if ($request->filled('max_price')) $query->where('price', '<=', (float) $request->input('max_price'));
        if ($request->boolean('featured')) $query->where('is_featured', true);
        if ($request->boolean('new')) $query->where('is_new', true);
        if ($request->boolean('trainer_pick')) $query->where('trainer_pick', true);
        if ($request->boolean('home_use')) $query->where('home_use', true);
        if ($request->boolean('available')) {
            $query->where(fn ($q) => $q->where('stock', '>', 0)->orWhereHas('variants', fn ($v) => $v->where('is_active', true)->where('stock', '>', 0)));
        }

        match ($request->input('sort')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('rating_avg'),
            'popular' => $query->orderByDesc('views_count'),
            'new' => $query->orderByDesc('is_new')->latest('id'),
            default => $query->orderByDesc('is_featured')->latest('id'),
        };

        $perPage = min(max((int) $request->integer('per_page', 18), 1), 60);
        $products = $query->paginate($perPage);
        if ($user) {
            $favoriteIds = $user->favoriteProducts()->whereIn('products.id', $products->getCollection()->pluck('id'))->pluck('products.id')->all();
            $products->getCollection()->each(fn ($product) => $product->setAttribute('is_favorite', in_array($product->id, $favoriteIds)));
        }
        return ProductResource::collection($products);
    }

    public function overview(Request $request)
    {
        $base = fn () => Product::query()->where('is_active', true)->with(['category', 'variants' => fn ($q) => $q->where('is_active', true)])->withCount('reviews')->withAvg('reviews as rating_avg', 'rating');
        return response()->json([
            'categories' => Category::query()->whereHas('products', fn ($q) => $q->where('is_active', true))->withCount(['products' => fn ($q) => $q->where('is_active', true)])->orderBy('name')->get(['id', 'name', 'slug']),
            'brands' => Product::query()->where('is_active', true)->whereNotNull('brand')->distinct()->orderBy('brand')->pluck('brand')->values(),
            'featured' => ProductResource::collection($base()->where('is_featured', true)->limit(8)->get())->resolve($request),
            'trainer_picks' => ProductResource::collection($base()->where('trainer_pick', true)->limit(8)->get())->resolve($request),
            'new_products' => ProductResource::collection($base()->where('is_new', true)->latest()->limit(8)->get())->resolve($request),
            'popular' => ProductResource::collection($base()->orderByDesc('views_count')->limit(8)->get())->resolve($request),
            'collections' => ShopCollection::query()->where('is_active', true)->with(['products' => fn ($q) => $q->where('is_active', true)->with(['variants', 'category'])])->orderBy('sort_order')->get()->map(fn ($collection) => [
                'id' => $collection->id,
                'name' => $collection->name,
                'slug' => $collection->slug,
                'subtitle' => $collection->subtitle,
                'image_url' => $collection->image_url,
                'products' => ProductResource::collection($collection->products->take(6))->resolve($request),
            ]),
        ]);
    }

    public function show(Request $request, Product $product)
    {
        abort_unless($product->is_active || $request->user('sanctum')?->isAdmin(), 404);
        $product->increment('views_count');
        $product->load([
            'category', 'variants',
            'trainerRecommendations' => fn ($q) => $q->orderByDesc('trainer_product_recommendations.is_featured'),
            'relatedProducts' => fn ($q) => $q->where('is_active', true)->with('variants')->limit(8),
        ])->loadCount('reviews')->loadAvg('reviews as rating_avg', 'rating');
        if ($user = $request->user('sanctum')) {
            $product->setAttribute('is_favorite', $user->favoriteProducts()->where('products.id', $product->id)->exists());
            DB::table('product_views')->updateOrInsert(
                ['user_id' => $user->id, 'product_id' => $product->id],
                ['viewed_at' => now(), 'updated_at' => now(), 'created_at' => now()]
            );
        }
        if ($product->relatedProducts->isEmpty()) {
            $fallback = Product::query()->where('is_active', true)->where('id', '!=', $product->id)
                ->when($product->category_id, fn ($q) => $q->where('category_id', $product->category_id))
                ->limit(6)->get();
            $product->setRelation('relatedProducts', $fallback);
        }
        $product = $product->fresh()->load(['category', 'variants', 'trainerRecommendations', 'relatedProducts'])->loadCount('reviews')->loadAvg('reviews as rating_avg', 'rating');
        if ($user ?? null) $product->setAttribute('is_favorite', $user->favoriteProducts()->where('products.id', $product->id)->exists());
        return new ProductResource($product);
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $this->payload($request);
            $variants = $data['variants'] ?? [];
            unset($data['variants']);
            $product = Product::create($data);
            $this->syncVariants($product, $variants);
            return new ProductResource($product->load('category', 'variants'));
        });
    }

    public function update(Request $request, Product $product)
    {
        return DB::transaction(function () use ($request, $product) {
            $data = $this->payload($request, true, $product);
            $variants = $data['variants'] ?? null;
            unset($data['variants']);
            $product->update($data);
            if (is_array($variants)) $this->syncVariants($product, $variants);
            return new ProductResource($product->fresh()->load('category', 'variants'));
        });
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function payload(Request $request, bool $partial = false, ?Product $product = null): array
    {
        $required = $partial ? 'sometimes' : 'required';
        $validated = $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product?->id)],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:100'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product?->id)],
            'price' => [$required, 'numeric', 'min:0'],
            'old_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['nullable', 'string', 'max:2048'],
            'attributes' => ['nullable', 'array'],
            'badges' => ['nullable', 'array'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'is_featured' => ['nullable', 'boolean'],
            'is_new' => ['nullable', 'boolean'],
            'trainer_pick' => ['nullable', 'boolean'],
            'home_use' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:255'],
            'variants.*.sku' => ['required_with:variants', 'string', 'max:100'],
            'variants.*.options' => ['nullable', 'array'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.old_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.image_url' => ['nullable', 'string', 'max:2048'],
            'variants.*.is_active' => ['nullable', 'boolean'],
        ]);
        if (array_key_exists('name', $validated) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . Str::lower(Str::random(5));
        }
        return $validated;
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $keep = [];
        foreach ($variants as $index => $data) {
            $id = $data['id'] ?? null;
            unset($data['id']);
            $data['sort_order'] = $index;
            $variant = $id ? $product->variants()->whereKey($id)->first() : null;
            if ($variant) $variant->update($data);
            else $variant = $product->variants()->create($data);
            $keep[] = $variant->id;
        }
        if ($variants === []) {
            $product->variants()->delete();
            return;
        }
        $product->variants()->whereNotIn('id', $keep)->delete();
        $product->update(['stock' => (int) $product->variants()->sum('stock')]);
    }
}
