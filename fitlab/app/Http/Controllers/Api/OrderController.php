<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email'],
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($request, $data) {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'created',
                'payment_status' => 'pending',
                'currency' => 'RUB',
                'total_amount' => 0,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
            ]);

            $sourceItems = $data['items'] ?? null;
            if (!$sourceItems) {
                $cart = Cart::with('items')->where('user_id', $request->user()->id)->where('status', 'active')->firstOrFail();
                $sourceItems = $cart->items->map(fn($item) => ['product_id' => $item->product_id, 'quantity' => $item->qty])->all();
                $cart->update(['status' => 'converted']);
            }

            $total = 0;
            foreach ($sourceItems as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);
                $qty = (int) $item['quantity'];
                $order->items()->create([
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'price_snapshot' => $product->price,
                ]);
                $total += $product->price * $qty;
            }

            $order->update(['total_amount' => $total]);

            return $order->fresh('items.product');
        });

        return new OrderResource($order);
    }

    public function index(Request $request)
    {
        $query = Order::with('items.product')->where('user_id', $request->user()->id);
        return OrderResource::collection($query->latest()->paginate((int) $request->integer('per_page', 10)));
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($request->user()->isAdmin() || $order->user_id === $request->user()->id, 403);
        return new OrderResource($order->load('items.product'));
    }
}
