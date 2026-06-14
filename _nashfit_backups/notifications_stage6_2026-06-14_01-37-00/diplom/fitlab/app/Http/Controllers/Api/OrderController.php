<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\DiscountService;
use App\Services\PaymentService;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::query()->with(['items.product', 'items.variant', 'payments'])
            ->where('user_id', $request->user()->id)->latest()->get()
            ->map(fn (Order $order) => $this->formatOrder($order));
        return response()->json(['data' => $orders, 'orders' => $orders]);
    }

    public function store(Request $request, DiscountService $discounts, PaymentService $payments)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'delivery_method' => ['required', 'in:pickup,courier'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            'address_line' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:32'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'promo_code' => ['nullable', 'string', 'max:64'],
        ]);
        if ($data['delivery_method'] === 'courier' && (empty($data['city']) || empty($data['address_line']))) {
            return response()->json(['message' => 'Для доставки укажите город и адрес.'], 422);
        }

        $order = DB::transaction(function () use ($request, $data, $discounts) {
            $normalized = collect();
            $subtotal = 0;
            $itemsCount = 0;
            foreach ($data['items'] as $input) {
                $product = Product::query()->where('is_active', true)->lockForUpdate()->findOrFail($input['product_id']);
                $variant = null;
                if (!empty($input['variant_id'])) {
                    $variant = ProductVariant::query()->where('product_id', $product->id)->where('is_active', true)->lockForUpdate()->findOrFail($input['variant_id']);
                } elseif ($product->variants()->where('is_active', true)->exists()) {
                    throw ValidationException::withMessages(['items' => "Выберите вариант товара «{$product->name}»."]);
                }
                $quantity = (int) $input['quantity'];
                $stock = $variant?->stock ?? $product->stock;
                if ($quantity > $stock) throw ValidationException::withMessages(['items' => "Товара «{$product->name}» доступно только {$stock} шт."]);
                $priceRub = (float) ($variant?->price ?? $product->price);
                $price = (int) round($priceRub * 100);
                $line = $price * $quantity;
                $subtotal += $line;
                $itemsCount += $quantity;
                $normalized->push([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'name' => $product->name,
                    'variant_name' => $variant?->name,
                    'variant_options' => $variant?->options,
                    'sku' => $variant?->sku ?: $product->sku,
                    'image_url' => $variant?->image_url ?: $product->image_url,
                    'price' => $price,
                    'quantity' => $quantity,
                    'line_total' => $line,
                ]);
            }

            $discountData = $discounts->calculate($request->user(), $data['promo_code'] ?? null, 'store', $subtotal);
            $delivery = $data['delivery_method'] === 'pickup' ? 0 : ($discountData['total'] >= 500000 ? 0 : 39000);
            $total = $discountData['total'] + $delivery;
            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => $total > 0 ? 'awaiting_payment' : 'paid',
                'payment_status' => $total > 0 ? 'pending' : 'paid',
                'currency' => 'RUB',
                'items_count' => $itemsCount,
                'subtotal' => $subtotal,
                'discount' => $discountData['discount'],
                'delivery' => $delivery,
                'delivery_method' => $data['delivery_method'],
                'pickup_location' => $data['pickup_location'] ?? 'Клуб НашФит',
                'total' => $total,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'address_line' => $data['address_line'] ?? null,
                'city' => $data['city'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'comment' => $data['comment'] ?? null,
                'promo_code_id' => $discountData['promo_code']?->id,
                'promotion_id' => $discountData['promotion']?->id,
            ]);
            foreach ($normalized as $item) $order->items()->create($item);
            $activeCart = Cart::query()->where('user_id', $request->user()->id)->where('status', 'active')->first();
            if ($activeCart) {
                $activeCart->update(['status' => 'converted']);
                Cart::create(['user_id' => $request->user()->id, 'status' => 'active', 'subtotal_amount' => 0, 'total_amount' => 0]);
            }
            return $order->load(['items.product', 'items.variant']);
        });

        $payment = $payments->create($order, $request->user()->id, (int) $order->total, ['kind' => 'store_order', 'order_id' => $order->id]);
        $activity = app(ActivityService::class);
        $activity->notifyUser($request->user(), 'order.created', 'Заказ оформлен', "Заказ №{$order->id} создан. Завершите демонстрационную оплату.", '/account/orders', $order, ['order_id' => $order->id], $request->user()->id, 'package');
        $activity->notifyAdmins('admin.order.new', 'Новый заказ', "Заказ №{$order->id} на сумму " . number_format($order->total / 100, 0, ',', ' ') . ' ₽.', '/admin/orders', $order, ['order_id' => $order->id], $request->user()->id, 'package');
        return response()->json([
            'order' => $this->formatOrder($order->fresh()->load(['items.product', 'items.variant', 'payments'])),
            'data' => $this->formatOrder($order->fresh()->load(['items.product', 'items.variant', 'payments'])),
            'payment' => ['id' => $payment->id, 'status' => $payment->status, 'amount' => $payment->amount, 'currency' => $payment->currency],
        ], 201);
    }

    public function show(Request $request, Order $order)
    {
        abort_unless((int) $order->user_id === (int) $request->user()->id || $request->user()->isAdmin(), 403);
        return response()->json(['order' => $this->formatOrder($order->load(['items.product', 'items.variant', 'payments'])), 'data' => $this->formatOrder($order)]);
    }

    public function repeat(Request $request, Order $order)
    {
        abort_unless((int) $order->user_id === (int) $request->user()->id, 403);
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id, 'status' => 'active'], ['subtotal_amount' => 0, 'total_amount' => 0]);
        $added = 0;
        foreach ($order->items()->with(['product', 'variant'])->get() as $item) {
            if (!$item->product || !$item->product->is_active) continue;
            $variant = $item->variant;
            if ($item->product_variant_id && (!$variant || !$variant->is_active || $variant->stock < 1)) continue;
            if (!$item->product_variant_id && $item->product->stock < 1) continue;
            $query = $cart->items()->where('product_id', $item->product_id);
            $variant ? $query->where('product_variant_id', $variant->id) : $query->whereNull('product_variant_id');
            $cartItem = $query->first();
            $price = $variant?->price ?? $item->product->price;
            if ($cartItem) $cartItem->update(['qty' => min(99, $cartItem->qty + $item->quantity), 'price_snapshot' => $price]);
            else $cart->items()->create(['product_id' => $item->product_id, 'product_variant_id' => $variant?->id, 'qty' => min(99, $item->quantity), 'price_snapshot' => $price]);
            $added++;
        }
        $sum = $cart->items()->selectRaw('COALESCE(SUM(qty * price_snapshot),0) as s')->value('s');
        $cart->update(['subtotal_amount' => $sum, 'total_amount' => $sum]);
        return response()->json(['message' => $added ? 'Товары добавлены в корзину.' : 'Нет доступных товаров для повторения.', 'added' => $added]);
    }

    private function formatOrder(Order $order): array
    {
        $order->loadMissing(['items.product', 'items.variant', 'payments']);
        return [
            'id' => $order->id, 'user_id' => $order->user_id, 'status' => $order->status,
            'payment_status' => $order->payment_status, 'currency' => $order->currency, 'items_count' => $order->items_count,
            'subtotal' => $order->subtotal, 'discount' => $order->discount ?? 0, 'delivery' => $order->delivery, 'total' => $order->total,
            'subtotal_amount' => $order->subtotal, 'discount_amount' => $order->discount ?? 0, 'delivery_amount' => $order->delivery, 'total_amount' => $order->total,
            'delivery_method' => $order->delivery_method, 'pickup_location' => $order->pickup_location,
            'customer_name' => $order->customer_name, 'customer_phone' => $order->customer_phone, 'customer_email' => $order->customer_email,
            'address_line' => $order->address_line, 'city' => $order->city, 'postal_code' => $order->postal_code, 'comment' => $order->comment,
            'created_at' => $order->created_at, 'updated_at' => $order->updated_at,
            'payment' => optional($order->payments->sortByDesc('id')->first())->only(['id', 'status', 'amount', 'currency']),
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id, 'product_id' => $item->product_id, 'variant_id' => $item->product_variant_id,
                'name' => $item->name, 'variant_name' => $item->variant_name, 'variant_options' => $item->variant_options ?: [],
                'sku' => $item->sku, 'image_url' => $item->image_url, 'price' => $item->price, 'quantity' => $item->quantity,
                'qty' => $item->quantity, 'line_total' => $item->line_total, 'product' => $item->product,
            ])->values(),
            'order_items' => $order->items->map(fn ($item) => [
                'id' => $item->id, 'name' => $item->name, 'variant_name' => $item->variant_name,
                'price' => $item->price, 'quantity' => $item->quantity, 'image_url' => $item->image_url,
                'product' => $item->product,
            ])->values(),
        ];
    }
}
