<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Models\UserMembership;
use App\Services\DiscountService;
use App\Services\PaymentService;
use App\Services\TrialMembershipService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{
    public function index()
    {
        $items = Membership::query()->where('is_active', true)->orderBy('sort_order')->orderBy('price')->get();
        return response()->json(['data' => $items->map(fn ($item) => $this->formatPlan($item))]);
    }

    public function account(Request $request, TrialMembershipService $trialService)
    {
        $trialService->ensureForUser($request->user());
        $request->user()->memberships()->where('status', 'active')->whereNotNull('ends_at')->where('ends_at', '<', now())->update(['status' => 'expired']);
        $items = $request->user()->memberships()->with(['membership', 'payment', 'promoCode', 'promotion'])->latest()->get();
        return response()->json(['data' => $items->map(fn ($item) => $this->formatPurchase($item))]);
    }

    public function purchase(Request $request, Membership $membership, DiscountService $discounts, PaymentService $payments)
    {
        abort_unless($membership->is_active && !$membership->is_trial, 404);
        $data = $request->validate(['promo_code' => ['nullable', 'string', 'max:64']]);
        $subtotal = (int) $membership->price;
        $discount = $discounts->calculate($request->user(), $data['promo_code'] ?? null, 'membership', $subtotal);

        $purchase = DB::transaction(function () use ($request, $membership, $subtotal, $discount, $payments) {
            $purchase = UserMembership::create([
                'user_id' => $request->user()->id,
                'membership_id' => $membership->id,
                'promo_code_id' => $discount['promo_code']?->id,
                'promotion_id' => $discount['promotion']?->id,
                'status' => $discount['total'] > 0 ? 'pending' : 'active',
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discount['discount'],
                'total_amount' => $discount['total'],
                'starts_at' => $discount['total'] > 0 ? null : now(),
                'ends_at' => $discount['total'] > 0 ? null : now()->addMonths((int) ($membership->duration_months ?: 1)),
            ]);
            $payment = $payments->create($purchase, $request->user()->id, $discount['total'], [
                'kind' => 'membership', 'membership_id' => $membership->id,
            ]);
            $purchase->update(['payment_id' => $payment->id]);
            return $purchase->fresh(['membership', 'payment', 'promoCode', 'promotion']);
        });

        return response()->json(['data' => $this->formatPurchase($purchase), 'message' => $purchase->status === 'active' ? 'Абонемент активирован.' : 'Счёт создан.'], 201);
    }

    private function formatPlan(Membership $item): array
    {
        return [
            'id' => $item->id, 'name' => $item->name, 'slug' => $item->slug,
            'description' => $item->description, 'duration_months' => $item->duration_months,
            'trial_visits' => $item->trial_visits, 'price' => $item->price, 'old_price' => $item->old_price,
            'features' => $item->features ?: [], 'badge' => $item->badge,
            'is_trial' => $item->is_trial, 'is_featured' => $item->is_featured,
        ];
    }

    private function formatPurchase(UserMembership $item): array
    {
        return [
            'id' => $item->id, 'status' => $item->status,
            'starts_at' => $item->starts_at, 'ends_at' => $item->ends_at,
            'subtotal_amount' => $item->subtotal_amount, 'discount_amount' => $item->discount_amount,
            'total_amount' => $item->total_amount, 'is_trial_grant' => $item->is_trial_grant,
            'membership' => $item->membership ? $this->formatPlan($item->membership) : null,
            'promo_code' => $item->promoCode?->code,
            'promotion' => $item->promotion?->name,
            'payment' => $item->payment ? [
                'id' => $item->payment->id, 'status' => $item->payment->status,
                'amount' => $item->payment->amount, 'provider' => $item->payment->provider,
            ] : null,
        ];
    }
}
