<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id, 'status' => 'active']);
        $cart->load('items.product');
        $this->recalculate($cart);

        return response()->json($cart);
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'qty' => ['nullable', 'integer', 'min:1'],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id, 'status' => 'active']);
        $product = Product::findOrFail($data['product_id']);

        $item = CartItem::firstOrNew(['cart_id' => $cart->id, 'product_id' => $product->id]);
        $item->qty = ($item->qty ?? 0) + (int) ($data['qty'] ?? 1);
        $item->price_snapshot = $product->price;
        $item->save();

        $this->recalculate($cart->fresh('items'));

        return response()->json($item->load('product'), 201);
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $this->authorizeItem($request, $item);
        $data = $request->validate(['qty' => ['required', 'integer', 'min:1']]);
        $item->update(['qty' => $data['qty']]);
        $this->recalculate($item->cart);

        return response()->json($item->fresh('product'));
    }

    public function removeItem(Request $request, CartItem $item)
    {
        $this->authorizeItem($request, $item);
        $cart = $item->cart;
        $item->delete();
        $this->recalculate($cart);

        return response()->json(['message' => 'Item removed']);
    }

    private function authorizeItem(Request $request, CartItem $item): void
    {
        abort_unless($item->cart->user_id === $request->user()->id, 403);
    }

    private function recalculate(Cart $cart): void
    {
        $sum = $cart->items()->selectRaw('COALESCE(SUM(qty * price_snapshot),0) as s')->value('s');
        $cart->update(['subtotal_amount' => $sum, 'total_amount' => $sum]);
    }
}
