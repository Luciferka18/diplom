<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->findOrCreateCart($request->user()->id);

        return response()->json($this->loadCart($cart));
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->findOrCreateCart($request->user()->id);
        $product = Product::findOrFail($data['product_id']);

        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $item->quantity += $data['quantity'];
            $item->save();
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'price' => $product->price,
            ]);
        }

        $this->recalculateCartTotal($cart);

        return response()->json($this->loadCart($cart));
    }

    public function updateItem(Request $request, int $itemId)
    {
        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->findOrCreateCart($request->user()->id);
        $item = $cart->items()->where('id', $itemId)->firstOrFail();
        $item->update(['quantity' => $data['quantity']]);

        $this->recalculateCartTotal($cart);

        return response()->json($this->loadCart($cart));
    }

    public function removeItem(Request $request, int $itemId)
    {
        $cart = $this->findOrCreateCart($request->user()->id);
        $item = $cart->items()->where('id', $itemId)->firstOrFail();
        $item->delete();

        $this->recalculateCartTotal($cart);

        return response()->json($this->loadCart($cart));
    }

    public function checkout(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
        ]);

        return DB::transaction(function () use ($request, $data) {
            $cart = $this->findOrCreateCart($request->user()->id);
            $cart->load('items');

            if ($cart->items->isEmpty()) {
                return response()->json(['message' => 'Cart is empty'], 422);
            }

            $this->recalculateCartTotal($cart);

            $cart->update([
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'status' => 'new',
            ]);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $cart->fresh()->load('items.product'),
            ], 201);
        });
    }

    private function findOrCreateCart(int $userId): Order
    {
        return Order::firstOrCreate(
            ['user_id' => $userId, 'status' => 'cart'],
            [
                'customer_name' => 'Cart User',
                'customer_phone' => '-',
                'customer_email' => null,
                'total_amount' => 0,
            ]
        );
    }

    private function recalculateCartTotal(Order $cart): void
    {
        $cart->load('items');

        $total = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $cart->update(['total_amount' => $total]);
    }

    private function loadCart(Order $cart): Order
    {
        return $cart->load('items.product');
    }
}
