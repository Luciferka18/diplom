<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::query()
            ->with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Order $order) => $this->formatOrder($order));

        return response()->json([
            'data' => $orders,
            'orders' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],

            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],

            'address_line' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:32'],

            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $userId = $request->user()->id;

        $ids = collect($data['items'])
            ->pluck('product_id')
            ->unique()
            ->values();

        $products = Product::query()
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        if ($products->count() !== $ids->count()) {
            return response()->json([
                'message' => 'Некоторые товары не найдены.',
            ], 422);
        }

        $itemsCount = 0;
        $subtotal = 0;

        $normalizedItems = collect($data['items'])->map(function ($item) use ($products, &$itemsCount, &$subtotal) {
            $product = $products[$item['product_id']];
            $quantity = (int) $item['quantity'];

            // В БД товар хранится в рублях decimal, заказ — в копейках.
            $price = (int) round(((float) $product->price) * 100);
            $lineTotal = $price * $quantity;

            $itemsCount += $quantity;
            $subtotal += $lineTotal;

            return [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $price,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
            ];
        });

        $delivery = 0;
        $total = $subtotal + $delivery;

        $order = DB::transaction(function () use (
            $data,
            $userId,
            $itemsCount,
            $subtotal,
            $delivery,
            $total,
            $normalizedItems
        ) {
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'new',
                'items_count' => $itemsCount,
                'subtotal' => $subtotal,
                'delivery' => $delivery,
                'total' => $total,

                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'address_line' => $data['address_line'] ?? null,
                'city' => $data['city'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'comment' => $data['comment'] ?? null,
            ]);

            OrderItem::insert(
                $normalizedItems
                    ->map(fn ($item) => array_merge($item, [
                        'order_id' => $order->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]))
                    ->all()
            );

            return $order->load(['items.product']);
        });

        return response()->json([
            'order' => $this->formatOrder($order),
            'data' => $this->formatOrder($order),
        ], 201);
    }

    public function show(Request $request, Order $order)
    {
        if ((int) $order->user_id !== (int) $request->user()->id) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        $order->load(['items.product']);

        return response()->json([
            'order' => $this->formatOrder($order),
            'data' => $this->formatOrder($order),
        ]);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'status' => $order->status,
            'items_count' => $order->items_count,

            'subtotal' => $order->subtotal,
            'delivery' => $order->delivery,
            'total' => $order->total,

            // alias-ы для frontend
            'subtotal_amount' => $order->subtotal,
            'delivery_amount' => $order->delivery,
            'total_amount' => $order->total,

            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'address_line' => $order->address_line,
            'city' => $order->city,
            'postal_code' => $order->postal_code,
            'comment' => $order->comment,

            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,

            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'order_id' => $item->order_id,
                'product_id' => $item->product_id,

                'name' => $item->name,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,

                // alias-ы для старого frontend-кода
                'qty' => $item->quantity,
                'price_snapshot' => $item->price,

                'product' => $item->product,
            ])->values(),
        ];
    }
}