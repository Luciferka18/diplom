<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentIntent;
use App\Services\PaymentService;
use App\Services\YooKassaPaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function show(Request $request, Payment $payment)
    {
        abort_unless($request->user()->isAdmin() || (int) $payment->user_id === (int) $request->user()->id, 403);
        return response()->json(['data' => $this->format($payment)]);
    }

    public function yookassaCreate(Request $request, Payment $payment, YooKassaPaymentGateway $gateway)
    {
        abort_unless($request->user()->isAdmin() || (int) $payment->user_id === (int) $request->user()->id, 403);

        if ($payment->status === 'paid') {
            return response()->json(['data' => $this->format($payment), 'message' => 'Оплата уже подтверждена.']);
        }

        if ((int) $payment->amount <= 0) {
            $payment->update(['provider' => 'yookassa', 'status' => 'paid', 'paid_at' => now()]);
            return response()->json(['data' => $this->format($payment), 'message' => 'Оплата не требуется.']);
        }

        $data = $request->validate([
            'return_url' => ['nullable', 'url'],
            'description' => ['nullable', 'string', 'max:128'],
        ]);

        $returnUrl = $data['return_url'] ?? config('yookassa.return_url');
        $response = $gateway->createPayment($payment, $returnUrl, $data['description'] ?? null);

        $metadata = array_merge($payment->metadata ?: [], [
            'yookassa' => [
                'payment_id' => $response['id'] ?? null,
                'status' => $response['status'] ?? null,
                'confirmation_url' => Arr::get($response, 'confirmation.confirmation_url'),
                'created_at' => now()->toIso8601String(),
            ],
        ]);

        $payment->update([
            'provider' => 'yookassa',
            'status' => $response['status'] ?? 'pending',
            'external_id' => $response['id'] ?? $payment->external_id,
            'idempotency_key' => $payment->idempotency_key ?: (string) Str::uuid(),
            'metadata' => $metadata,
        ]);

        return response()->json([
            'data' => $this->format($payment->fresh()),
            'confirmation_url' => Arr::get($response, 'confirmation.confirmation_url'),
        ]);
    }

    public function yookassaRefresh(Request $request, Payment $payment, YooKassaPaymentGateway $gateway, PaymentService $service)
    {
        abort_unless($request->user()->isAdmin() || (int) $payment->user_id === (int) $request->user()->id, 403);

        if (! $payment->external_id) {
            return response()->json(['data' => $this->format($payment)]);
        }

        $response = $gateway->getPayment($payment->external_id);
        $payment = $this->syncYooKassaPayment($payment, $response, $service);

        return response()->json(['data' => $this->format($payment)]);
    }

    public function yookassaWebhook(Request $request, PaymentService $service)
    {
        $object = $request->input('object', []);
        $externalId = $object['id'] ?? null;

        if (! $externalId) {
            return response()->json(['ok' => true]);
        }

        $payment = Payment::query()->where('external_id', $externalId)->first();
        if ($payment) {
            $this->syncYooKassaPayment($payment, $object, $service);
        }

        return response()->json(['ok' => true]);
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

    private function syncYooKassaPayment(Payment $payment, array $payload, PaymentService $service): Payment
    {
        $status = $payload['status'] ?? $payment->status;
        $metadata = array_merge($payment->metadata ?: [], [
            'yookassa' => array_filter([
                'payment_id' => $payload['id'] ?? $payment->external_id,
                'status' => $status,
                'paid' => $payload['paid'] ?? null,
                'refundable' => $payload['refundable'] ?? null,
                'synced_at' => now()->toIso8601String(),
                'confirmation_url' => Arr::get($payload, 'confirmation.confirmation_url') ?: Arr::get($payment->metadata ?: [], 'yookassa.confirmation_url'),
            ], fn ($value) => $value !== null),
            'yookassa_last_payload' => $payload,
        ]);

        if ($payment->status === 'paid' || $payment->paid_at) {
            $payment->update([
                'provider' => 'yookassa',
                'status' => 'paid',
                'metadata' => $metadata,
                'failed_at' => $payment->failed_at,
            ]);

            return $payment->fresh('payable');
        }

        if ($status === 'succeeded') {
            $payment->update([
                'provider' => 'yookassa',
                'status' => $status,
                'metadata' => $metadata,
            ]);

            return $service->confirm($payment->fresh(), 'yookassa_' . ($payload['id'] ?? Str::uuid()))->fresh('payable');
        }

        $payment->update([
            'provider' => 'yookassa',
            'status' => $status,
            'metadata' => $metadata,
            'failed_at' => $status === 'canceled' ? now() : $payment->failed_at,
        ]);

        return $payment->fresh('payable');
    }

    private function format(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'provider' => $payment->provider,
            'status' => $payment->status,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'external_id' => $payment->external_id,
            'paid_at' => $payment->paid_at,
            'confirmation_url' => Arr::get($payment->metadata ?: [], 'yookassa.confirmation_url'),
        ];
    }
}
