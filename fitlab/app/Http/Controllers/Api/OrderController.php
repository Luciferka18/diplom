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
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required','array','min:1'],
            'items.*.product_id' => ['required','integer','exists:products,id'],
            'items.*.quantity' => ['required','integer','min:1','max:999'],

            'customer_name' => ['nullable','string','max:255'],
            'customer_phone' => ['nullable','string','max:50'],
            'customer_email' => ['nullable','email','max:255'],

            'address_line' => ['nullable','string','max:255'],
            'city' => ['nullable','string','max:255'],
            'postal_code' => ['nullable','string','max:32'],

            'comment' => ['nullable','string','max:2000'],
        ]);

        $userId = $request->user()?->id;

        // Собираем товары (и цены) только из БД — клиенту не доверяем
        $ids = collect($data['items'])->pluck('product_id')->unique()->values();
        $products = Product::query()->whereIn('id', $ids)->get()->keyBy('id');

        // Если вдруг какого-то id нет (хотя validate должен отловить)
        if ($products->count() !== $ids->count()) {
            return response()->json(['message' => 'Некоторые товары не найдены.'], 422);
        }

        $itemsCount = 0;
        $subtotal = 0;

        $normalizedItems = collect($data['items'])->map(function ($it) use ($products, &$itemsCount, &$subtotal) {
            $p = $products[$it['product_id']];
            $qty = (int)$it['quantity'];

            // Цена в копейках (если в БД decimal)
            $priceRub = (float)$p->price;
            $price = (int) round($priceRub * 100);

            $lineTotal = $price * $qty;

            $itemsCount += $qty;
            $subtotal += $lineTotal;

            return [
                'product_id' => $p->id,
                'name' => $p->name,
                'price' => $price,
                'quantity' => $qty,
                'line_total' => $lineTotal,
            ];
        });

        // Пример доставки (пока 0)
        $delivery = 0;
        $total = $subtotal + $delivery;

        $order = DB::transaction(function () use ($data, $userId, $itemsCount, $subtotal, $delivery, $total, $normalizedItems) {
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
                $normalizedItems->map(fn($i) => array_merge($i, [
                    'order_id' => $order->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]))->all()
            );

            return $order->load('items');
        });

        return response()->json([
            'order' => $order,
        ], 201);
    }

    public function show(Request $request, Order $order)
    {
        // Если хочешь ограничить доступ: только владелец
        if ($order->user_id && $request->user()?->id !== $order->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['order' => $order->load('items')]);
    }
}   