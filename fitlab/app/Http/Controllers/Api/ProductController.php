<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->filled('category')) {
            $category = $request->string('category');
            $query->whereHas('category', fn($q) => $q->where('slug', $category)->orWhere('name', 'like', "%{$category}%"));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn($w) => $w->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"));
        }

        if ($request->boolean('paginate')) {
            return ProductResource::collection($query->latest()->paginate((int) $request->integer('per_page', 12)));
        }

        return ProductResource::collection($query->latest()->limit((int) $request->integer('per_page', 12))->get());
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load('category'));
    }

    public function store(Request $request)
    {
        return new ProductResource(Product::create($this->payload($request)));
    }

    public function update(Request $request, Product $product)
    {
        $product->update($this->payload($request, true));
        return new ProductResource($product->fresh('category'));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function payload(Request $request, bool $partial = false): array
    {
        $validated = $request->validate([
            'name' => [$partial ? 'sometimes' : 'nullable', 'string'],
            'title' => [$partial ? 'sometimes' : 'nullable', 'string'],
            'description' => ['nullable', 'string'],
            'price' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'in_stock' => ['nullable', 'boolean'],
            'image_url' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'category' => ['nullable', 'string'],
        ]);

        $name = $validated['name'] ?? $validated['title'] ?? null;
        if (!$partial && !$name) {
            abort(422, 'Product name is required');
        }

        return array_filter([
            'name' => $name,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'] ?? null,
            'stock' => isset($validated['stock']) ? (int) $validated['stock'] : (($validated['in_stock'] ?? false) ? 100 : 0),
            'image_url' => $validated['image_url'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
        ], fn($v) => !is_null($v));
    }
}
