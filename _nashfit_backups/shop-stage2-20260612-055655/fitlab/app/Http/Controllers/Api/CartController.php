<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($this->format($this->activeCart($request)->load('items.product.category', 'items.variant')));
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'qty' => ['nullable', 'integer', 'min:1', 'max:99'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);
        $qty = (int) ($data['qty'] ?? $data['quantity'] ?? 1);
        $cart = $this->activeCart($request);
        $product = Product::query()->where('is_active', true)->findOrFail($data['product_id']);
        $variant = null;
        if (!empty($data['variant_id'])) {
            $variant = ProductVariant::query()->where('product_id', $product->id)->where('is_active', true)->findOrFail($data['variant_id']);
        } elseif ($product->variants()->where('is_active', true)->exists()) {
            return response()->json(['message' => 'Выберите вариант товара.'], 422);
        }
        $available = $variant ? $variant->stock : $product->stock;
        $price = $variant?->price ?? $product->price;
        $query = CartItem::query()->where('cart_id', $cart->id)->where('product_id', $product->id);
        $variant ? $query->where('product_variant_id', $variant->id) : $query->whereNull('product_variant_id');
        $item = $query->first();
        $nextQty = ($item?->qty ?? 0) + $qty;
        if ($nextQty > $available) return response()->json(['message' => "Доступно только {$available} шт."], 422);
        if ($item) $item->update(['qty' => $nextQty, 'price_snapshot' => $price]);
        else $item = CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'product_variant_id' => $variant?->id, 'qty' => $qty, 'price_snapshot' => $price]);
        $this->recalculate($cart);
        return response()->json($this->format($cart->fresh()->load('items.product.category', 'items.variant')), 201);
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $this->authorizeItem($request, $item);
        $data = $request->validate(['qty' => ['nullable', 'integer', 'min:1', 'max:99'], 'quantity' => ['nullable', 'integer', 'min:1', 'max:99']]);
        $qty = (int) ($data['qty'] ?? $data['quantity'] ?? 1);
        $item->load('product', 'variant');
        $available = $item->variant?->stock ?? $item->product?->stock ?? 0;
        if ($qty > $available) return response()->json(['message' => "Доступно только {$available} шт."], 422);
        $item->update(['qty' => $qty]);
        $this->recalculate($item->cart);
        return response()->json($this->format($item->cart->fresh()->load('items.product.category', 'items.variant')));
    }

    public function removeItem(Request $request, CartItem $item)
    {
        $this->authorizeItem($request, $item);
        $cart = $item->cart;
        $item->delete();
        $this->recalculate($cart);
        return response()->json($this->format($cart->fresh()->load('items.product.category', 'items.variant')));
    }

    public function clear(Request $request)
    {
        $cart = $this->activeCart($request);
        $cart->items()->delete();
        $this->recalculate($cart);
        return response()->json($this->format($cart->fresh()->load('items.product.category', 'items.variant')));
    }

    private function activeCart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id, 'status' => 'active'], ['subtotal_amount' => 0, 'total_amount' => 0]);
    }

    private function authorizeItem(Request $request, CartItem $item): void
    {
        abort_unless((int) $item->cart->user_id === (int) $request->user()->id, 403);
    }

    private function recalculate(Cart $cart): void
    {
        $sum = $cart->items()->selectRaw('COALESCE(SUM(qty * price_snapshot),0) as s')->value('s');
        $cart->update(['subtotal_amount' => $sum, 'total_amount' => $sum]);
    }

    private function format(Cart $cart): array
    {
        $items = $cart->items->map(function (CartItem $item) {
            $product = $item->product;
            $variant = $item->variant;
            return [
                'id' => $item->id,
                'cart_item_id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->product_variant_id,
                'qty' => (int) $item->qty,
                'quantity' => (int) $item->qty,
                'price' => (float) $item->price_snapshot,
                'price_snapshot' => (float) $item->price_snapshot,
                'line_total' => round((float) $item->price_snapshot * $item->qty, 2),
                'product' => $product ? [
                    'id' => $product->id, 'name' => $product->name, 'title' => $product->name,
                    'slug' => $product->slug, 'image_url' => $variant?->image_url ?: $product->image_url,
                    'stock' => $variant?->stock ?? $product->stock, 'brand' => $product->brand,
                    'category' => $product->category?->name,
                ] : null,
                'variant' => $variant ? ['id' => $variant->id, 'name' => $variant->name, 'sku' => $variant->sku, 'options' => $variant->options ?: [], 'stock' => $variant->stock] : null,
            ];
        })->values();
        return [
            'id' => $cart->id,
            'status' => $cart->status,
            'items' => $items,
            'items_count' => $items->sum('qty'),
            'subtotal_amount' => (float) $cart->subtotal_amount,
            'total_amount' => (float) $cart->total_amount,
        ];
    }
}
