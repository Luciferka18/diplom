<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentIntent;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function show(Request $request, Payment $payment)
    {
        abort_unless($request->user()->isAdmin() || (int) $payment->user_id === (int) $request->user()->id, 403);
        return response()->json(['data' => $this->format($payment)]);
    }

    public function mockConfirm(Request $request, Payment $payment, PaymentService $service)
    {
        abort_unless($request->user()->isAdmin() || (int) $payment->user_id === (int) $request->user()->id, 403);
        $data = $request->validate([
            'cardholder' => ['nullable', 'string', 'max:100'],
            'last4' => ['nullable', 'digits:4'],
        ]);
        $key = $request->header('Idempotency-Key') ?: (string) Str::uuid();
        $payment->update(['metadata' => array_merge($payment->metadata ?: [], [
            'cardholder' => $data['cardholder'] ?? null,
            'last4' => $data['last4'] ?? '4242',
            'mode' => 'demo',
        ])]);
        $payment = $service->confirm($payment->fresh(), $key);
        return response()->json(['data' => $this->format($payment), 'message' => 'Демонстрационная оплата прошла успешно.']);
    }

    // Legacy store payment endpoints remain compatible.
    public function intent(Request $request)
    {
        $data = $request->validate(['order_id' => ['required', 'exists:orders,id']]);
        $order = Order::findOrFail($data['order_id']);
        abort_unless($request->user()->isAdmin() || $order->user_id === $request->user()->id, 403);
        $intent = PaymentIntent::create([
            'order_id' => $order->id, 'provider' => 'mock_provider', 'status' => 'pending',
            'client_secret' => 'pi_' . Str::random(30),
        ]);
        return response()->json(['intent_id' => $intent->id, 'client_secret' => $intent->client_secret, 'status' => $intent->status]);
    }

    public function confirm(Request $request)
    {
        $data = $request->validate(['intent_id' => ['required', 'exists:payment_intents,id']]);
        $idempotency = $request->header('Idempotency-Key');
        if (!$idempotency) return response()->json(['message' => 'Idempotency-Key header is required'], 422);
        $intent = PaymentIntent::with('order.items.product')->findOrFail($data['intent_id']);
        abort_unless($request->user()->isAdmin() || $intent->order->user_id === $request->user()->id, 403);
        if ($intent->status === 'confirmed' && $intent->idempotency_key === $idempotency) {
            return response()->json(['status' => 'confirmed', 'order_id' => $intent->order_id, 'idempotent' => true]);
        }
        return DB::transaction(function () use ($intent, $idempotency) {
            foreach ($intent->order->items as $item) {
                if ($item->product->stock < $item->quantity) return response()->json(['message' => 'Insufficient stock'], 409);
            }
            foreach ($intent->order->items as $item) $item->product->decrement('stock', $item->quantity);
            $intent->update(['status' => 'confirmed', 'idempotency_key' => $idempotency, 'confirmed_at' => now()]);
            $intent->order->update(['payment_status' => 'paid', 'status' => 'paid']);
            return response()->json(['status' => 'confirmed', 'order_id' => $intent->order_id]);
        });
    }

    private function format(Payment $payment): array
    {
        return [
            'id' => $payment->id, 'provider' => $payment->provider, 'status' => $payment->status,
            'amount' => $payment->amount, 'currency' => $payment->currency,
            'external_id' => $payment->external_id, 'paid_at' => $payment->paid_at,
        ];
    }
}
