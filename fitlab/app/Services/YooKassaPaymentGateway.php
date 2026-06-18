<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class YooKassaPaymentGateway
{
    public function createPayment(Payment $payment, string $returnUrl, ?string $description = null): array
    {
        $this->ensureConfigured();

        $amount = number_format(((int) $payment->amount) / 100, 2, '.', '');
        $description = Str::limit($description ?: $this->defaultDescription($payment), 128, '');

        $payload = [
            'amount' => [
                'value' => $amount,
                'currency' => $payment->currency ?: config('yookassa.currency', 'RUB'),
            ],
            'capture' => true,
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => $this->appendPaymentId($returnUrl, $payment->id),
            ],
            'description' => $description,
            'metadata' => [
                'local_payment_id' => (string) $payment->id,
                'user_id' => (string) $payment->user_id,
                'payable_type' => $payment->payable_type,
                'payable_id' => (string) $payment->payable_id,
            ],
        ];

        $idempotenceKey = 'nashfit-payment-' . $payment->id . '-' . ($payment->idempotency_key ?: Str::uuid());

        return $this->request('post', '/payments', $payload, $idempotenceKey);
    }

    public function getPayment(string $providerPaymentId): array
    {
        $this->ensureConfigured();
        return $this->request('get', '/payments/' . $providerPaymentId);
    }

    private function request(string $method, string $path, array $payload = [], ?string $idempotenceKey = null): array
    {
        $headers = ['Accept' => 'application/json'];
        if ($idempotenceKey) {
            $headers['Idempotence-Key'] = $idempotenceKey;
        }

        $client = Http::withBasicAuth((string) config('yookassa.shop_id'), (string) config('yookassa.secret_key'))
            ->withHeaders($headers)
            ->timeout(25);

        $url = rtrim((string) config('yookassa.api_url'), '/') . $path;
        $response = $method === 'get' ? $client->get($url) : $client->post($url, $payload);

        if (! $response->successful()) {
            $message = Arr::get($response->json() ?: [], 'description')
                ?: Arr::get($response->json() ?: [], 'message')
                ?: 'ЮKassa вернула ошибку: HTTP ' . $response->status();
            throw new RuntimeException($message);
        }

        return $response->json() ?: [];
    }

    private function ensureConfigured(): void
    {
        if (! config('yookassa.enabled')) {
            throw new RuntimeException('Оплата ЮKassa отключена в настройках.');
        }

        if (! config('yookassa.shop_id') || ! config('yookassa.secret_key')) {
            throw new RuntimeException('Не заполнены YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env.');
        }
    }

    private function appendPaymentId(string $url, int $paymentId): string
    {
        if (str_contains($url, 'payment_id=')) {
            return $url;
        }
        return $url . (str_contains($url, '?') ? '&' : '?') . 'payment_id=' . $paymentId;
    }

    private function defaultDescription(Payment $payment): string
    {
        $payable = $payment->payable;
        if ($payable && class_basename($payable) === 'Order') {
            return 'Заказ НашФит #' . $payable->id;
        }
        if ($payable && class_basename($payable) === 'Booking') {
            return 'Запись к тренеру НашФит #' . $payable->id;
        }
        if ($payable && class_basename($payable) === 'UserMembership') {
            return 'Абонемент НашФит #' . $payable->id;
        }
        return 'Оплата НашФит #' . $payment->id;
    }
}
