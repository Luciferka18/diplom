<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Order;
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
            'provider' => config('yookassa.enabled', true) ? 'yookassa' : 'mock',
            'status' => 'pending',
            'amount' => max(0, $amount),
            'currency' => config('yookassa.currency', 'RUB'),
            'external_id' => config('yookassa.enabled', true) ? null : 'mock_' . Str::uuid(),
            'metadata' => $metadata,
        ]);

        return $amount > 0 ? $payment : $this->confirm($payment, 'zero_' . Str::uuid());
    }

    public function confirm(Payment $payment, string $idempotencyKey): Payment
    {
        return DB::transaction(function () use ($payment, $idempotencyKey) {
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);

            if ($payment->status === 'paid' || $payment->paid_at) {
                if ($payment->status !== 'paid') {
                    $payment->update(['status' => 'paid']);
                }

                return $payment->fresh('payable');
            }

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
            } elseif ($payable instanceof Order) {
                $payable->loadMissing(['items.product', 'items.variant']);
                if ($payable->payment_status !== 'paid') {
                    foreach ($payable->items as $item) {
                        if ($item->variant) {
                            if ($item->variant->stock < $item->quantity) {
                                throw new \RuntimeException('Недостаточно товара «' . $item->name . '» на складе.');
                            }
                            $item->variant->decrement('stock', $item->quantity);
                            $item->product?->update(['stock' => (int) $item->product->variants()->sum('stock')]);
                        } elseif ($item->product) {
                            if ($item->product->stock < $item->quantity) {
                                throw new \RuntimeException('Недостаточно товара «' . $item->name . '» на складе.');
                            }
                            $item->product->decrement('stock', $item->quantity);
                        }
                    }
                    $payable->update(['payment_status' => 'paid', 'status' => 'paid']);
                }
            }

            $activity = app(ActivityService::class);
            if ($payable instanceof UserMembership) {
                $payable->loadMissing('membership');
                $activity->notifyUser($payment->user_id, 'membership.activated', 'Абонемент активирован', 'Абонемент «' . ($payable->membership?->name ?: 'НашФит') . '» успешно активирован.', '/account/membership', $payable, ['payment_id' => $payment->id], null, 'credit-card');
                $activity->notifyAdmins('admin.membership.paid', 'Оплачен абонемент', 'Пользователь оплатил абонемент «' . ($payable->membership?->name ?: 'НашФит') . '».', '/admin/monetization', $payable, ['payment_id' => $payment->id], $payment->user_id, 'credit-card');
            } elseif ($payable instanceof Booking) {
                $payable->loadMissing(['trainer', 'service']);
                $activity->notifyUser($payment->user_id, 'booking.paid', 'Тренировка оплачена', 'Запись к тренеру подтверждена оплатой.', '/account/bookings', $payable, ['payment_id' => $payment->id], null, 'calendar');
                $activity->notifyTrainer($payable->trainer, 'trainer.booking.paid', 'Клиент оплатил тренировку', ($payable->client_name ?: 'Клиент') . ' оплатил запись.', '/account/bookings', $payable, ['payment_id' => $payment->id], $payment->user_id, 'dumbbell');
                $activity->notifyAdmins('admin.booking.paid', 'Оплачена запись к тренеру', 'Оплачена запись к ' . ($payable->trainer?->name ?: 'тренеру') . '.', '/admin/bookings', $payable, ['payment_id' => $payment->id], $payment->user_id, 'calendar');
            } elseif ($payable instanceof Order) {
                $activity->notifyUser($payment->user_id, 'order.paid', 'Заказ оплачен', 'Заказ №' . $payable->id . ' оплачен и передан в обработку.', '/account/orders', $payable, ['payment_id' => $payment->id, 'order_id' => $payable->id], null, 'package');
                $activity->notifyAdmins('admin.order.paid', 'Заказ оплачен', 'Заказ №' . $payable->id . ' оплачен.', '/admin/orders', $payable, ['payment_id' => $payment->id, 'order_id' => $payable->id], $payment->user_id, 'package');
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
