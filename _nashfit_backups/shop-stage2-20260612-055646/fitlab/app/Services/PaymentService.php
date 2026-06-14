<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\PromoRedemption;
use App\Models\UserMembership;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function create(Model $payable, int $userId, int $amount, array $metadata = []): Payment
    {
        $payment = Payment::create([
            'user_id' => $userId,
            'payable_type' => $payable::class,
            'payable_id' => $payable->getKey(),
            'provider' => 'mock',
            'status' => 'pending',
            'amount' => max(0, $amount),
            'currency' => 'RUB',
            'external_id' => 'mock_' . Str::uuid(),
            'metadata' => $metadata,
        ]);

        return $amount > 0 ? $payment : $this->confirm($payment, 'zero_' . Str::uuid());
    }

    public function confirm(Payment $payment, string $idempotencyKey): Payment
    {
        if ($payment->status === 'paid') return $payment;

        return DB::transaction(function () use ($payment, $idempotencyKey) {
            $payment->update([
                'status' => 'paid',
                'idempotency_key' => $idempotencyKey,
                'paid_at' => now(),
            ]);

            $payable = $payment->payable;
            if ($payable && method_exists($payable, 'promoCode')) $payable->loadMissing('promoCode');
            if ($payable instanceof UserMembership) {
                $payable->load('membership');
                $payable->activate();
            } elseif ($payable instanceof Booking) {
                $payable->update(['payment_status' => 'paid']);
            }

            if ($payable?->promo_code_id) {
                $exists = PromoRedemption::query()
                    ->where('promo_code_id', $payable->promo_code_id)
                    ->where('user_id', $payment->user_id)
                    ->where('redeemable_type', $payable::class)
                    ->where('redeemable_id', $payable->getKey())
                    ->exists();
                if (!$exists) {
                    PromoRedemption::create([
                        'promo_code_id' => $payable->promo_code_id,
                        'user_id' => $payment->user_id,
                        'redeemable_type' => $payable::class,
                        'redeemable_id' => $payable->getKey(),
                        'discount_amount' => (int) ($payable->discount_amount ?? 0),
                    ]);
                    $payable->promoCode()->increment('uses_count');
                }
            }

            return $payment->fresh('payable');
        });
    }
}
