<?php

namespace App\Services;

use App\Models\PromoCode;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class DiscountService
{
    public function calculate(?User $user, ?string $rawCode, string $target, int $subtotal): array
    {
        if (!$rawCode) {
            $promotion = Promotion::currentlyActive()->where('auto_apply', true)->get()
                ->filter(fn (Promotion $p) => in_array('all', $p->applies_to ?: ['all'], true) || in_array($target, $p->applies_to ?: [], true))
                ->sortByDesc(fn (Promotion $p) => $this->amount($p->discount_type, $p->discount_value, $subtotal))
                ->first();
            $discount = $promotion ? $this->amount($promotion->discount_type, $promotion->discount_value, $subtotal) : 0;
            return ['promo_code' => null, 'promotion' => $promotion, 'discount' => $discount, 'total' => max(0, $subtotal - $discount)];
        }

        $code = PromoCode::query()->whereRaw('UPPER(code) = ?', [mb_strtoupper(trim($rawCode))])->first();
        if (!$code || !$code->is_active) throw ValidationException::withMessages(['promo_code' => 'Промокод не найден или отключён.']);
        if ($code->starts_at && $code->starts_at->isFuture()) throw ValidationException::withMessages(['promo_code' => 'Промокод ещё не начал действовать.']);
        if ($code->ends_at && $code->ends_at->isPast()) throw ValidationException::withMessages(['promo_code' => 'Срок действия промокода закончился.']);
        if ($code->max_uses && $code->uses_count >= $code->max_uses) throw ValidationException::withMessages(['promo_code' => 'Лимит использований промокода исчерпан.']);
        if ($subtotal < (int) $code->minimum_amount) throw ValidationException::withMessages(['promo_code' => 'Недостаточная сумма для этого промокода.']);
        $targets = $code->applies_to ?: ['all'];
        if (!in_array('all', $targets, true) && !in_array($target, $targets, true)) throw ValidationException::withMessages(['promo_code' => 'Промокод не действует для этой покупки.']);
        if ($user && $code->per_user_limit && $code->redemptions()->where('user_id', $user->id)->count() >= $code->per_user_limit) {
            throw ValidationException::withMessages(['promo_code' => 'Вы уже использовали этот промокод.']);
        }

        $discount = $this->amount($code->discount_type, $code->discount_value, $subtotal);
        return ['promo_code' => $code, 'promotion' => $code->promotion, 'discount' => $discount, 'total' => max(0, $subtotal - $discount)];
    }

    private function amount(string $type, float $value, int $subtotal): int
    {
        $discount = $type === 'fixed' ? (int) round($value * 100) : (int) round($subtotal * min(100, max(0, $value)) / 100);
        return min($subtotal, max(0, $discount));
    }
}
