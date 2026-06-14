<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Models\PromoCode;
use App\Models\Promotion;
use App\Models\TrainerService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminMonetizationController extends Controller
{
    public function index(string $entity)
    {
        $items = match ($entity) {
            'memberships' => Membership::query()->orderBy('sort_order')->get(),
            'promotions' => Promotion::query()->latest()->get(),
            'promo-codes' => PromoCode::query()->with('promotion')->latest()->get(),
            'trainer-services' => TrainerService::query()->with('trainer:id,name')->orderBy('sort_order')->get(),
            default => abort(404),
        };
        return response()->json(['data' => $items]);
    }

    public function store(Request $request, string $entity)
    {
        $model = match ($entity) {
            'memberships' => Membership::create($this->membershipPayload($request)),
            'promotions' => Promotion::create($this->promotionPayload($request)),
            'promo-codes' => PromoCode::create($this->promoPayload($request)),
            'trainer-services' => TrainerService::create($this->servicePayload($request)),
            default => abort(404),
        };
        return response()->json(['data' => $model], 201);
    }

    public function update(Request $request, string $entity, int $id)
    {
        $model = $this->find($entity, $id);
        $payload = match ($entity) {
            'memberships' => $this->membershipPayload($request, true),
            'promotions' => $this->promotionPayload($request, true),
            'promo-codes' => $this->promoPayload($request, true),
            'trainer-services' => $this->servicePayload($request, true),
            default => abort(404),
        };
        $model->update($payload);
        return response()->json(['data' => $model->fresh()]);
    }

    public function destroy(string $entity, int $id)
    {
        $model = $this->find($entity, $id);
        if ($entity === 'memberships' && $model->purchases()->exists()) {
            $model->update(['is_active' => false]);
            return response()->json(['message' => 'Абонемент скрыт, потому что уже использовался.']);
        }
        $model->delete();
        return response()->json(['message' => 'Удалено']);
    }

    private function find(string $entity, int $id)
    {
        return match ($entity) {
            'memberships' => Membership::findOrFail($id),
            'promotions' => Promotion::findOrFail($id),
            'promo-codes' => PromoCode::findOrFail($id),
            'trainer-services' => TrainerService::findOrFail($id),
            default => abort(404),
        };
    }

    private function membershipPayload(Request $request, bool $partial = false): array
    {
        $v = $request->validate([
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'trial_visits' => ['nullable', 'integer', 'min:1', 'max:100'],
            'price_rubles' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'old_price_rubles' => ['nullable', 'numeric', 'min:0'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:500'],
            'badge' => ['nullable', 'string', 'max:100'],
            'is_trial' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
        if (isset($v['name']) && empty($v['slug'])) $v['slug'] = Str::slug($v['name']);
        if (array_key_exists('price_rubles', $v)) $v['price'] = (int) round($v['price_rubles'] * 100);
        if (array_key_exists('old_price_rubles', $v)) $v['old_price'] = $v['old_price_rubles'] === null ? null : (int) round($v['old_price_rubles'] * 100);
        unset($v['price_rubles'], $v['old_price_rubles']);
        return $v;
    }

    private function promotionPayload(Request $request, bool $partial = false): array
    {
        $v = $request->validate([
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => [$partial ? 'sometimes' : 'required', 'in:percent,fixed'],
            'discount_value' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'applies_to' => ['nullable', 'array'],
            'applies_to.*' => ['in:all,membership,booking,store'],
            'auto_apply' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'badge' => ['nullable', 'string', 'max:100'],
            'banner_title' => ['nullable', 'string', 'max:255'],
            'banner_text' => ['nullable', 'string'],
        ]);
        if (isset($v['name']) && empty($v['slug'])) $v['slug'] = Str::slug($v['name']);
        return $v;
    }

    private function promoPayload(Request $request, bool $partial = false): array
    {
        $v = $request->validate([
            'promotion_id' => ['nullable', 'exists:promotions,id'],
            'code' => [$partial ? 'sometimes' : 'required', 'string', 'max:64'],
            'description' => ['nullable', 'string'],
            'discount_type' => [$partial ? 'sometimes' : 'required', 'in:percent,fixed'],
            'discount_value' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'applies_to' => ['nullable', 'array'],
            'applies_to.*' => ['in:all,membership,booking,store'],
            'minimum_amount_rubles' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);
        if (isset($v['code'])) $v['code'] = mb_strtoupper(trim($v['code']));
        if (array_key_exists('minimum_amount_rubles', $v)) $v['minimum_amount'] = (int) round(($v['minimum_amount_rubles'] ?? 0) * 100);
        unset($v['minimum_amount_rubles']);
        return $v;
    }

    private function servicePayload(Request $request, bool $partial = false): array
    {
        $v = $request->validate([
            'trainer_id' => ['nullable', 'exists:trainers,id'],
            'name' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration_minutes' => [$partial ? 'sometimes' : 'required', 'integer', 'min:15', 'max:300'],
            'price_rubles' => [$partial ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'badge' => ['nullable', 'string', 'max:100'],
            'is_intro' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
        if (isset($v['name']) && empty($v['slug'])) $v['slug'] = Str::slug($v['name']);
        if (array_key_exists('price_rubles', $v)) $v['price'] = (int) round($v['price_rubles'] * 100);
        unset($v['price_rubles']);
        return $v;
    }
}
