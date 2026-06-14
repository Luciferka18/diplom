<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Публичный список отзывов.
     * Используется на главной странице.
     */
    public function index(Request $request)
    {
        $limit = max(1, min((int) $request->query('limit', 20), 100));
        $query = Review::query()->with(['user:id,name,login,role'])->latest();

        if ($request->filled('reviewable_type')) {
            $query->where('reviewable_type', $this->normalizeReviewableType((string) $request->input('reviewable_type')));
        }
        if ($request->filled('reviewable_id')) {
            $query->where('reviewable_id', (int) $request->input('reviewable_id'));
        }

        return ReviewResource::collection($query->take($limit)->get());
    }

    /**
     * Отзывы текущего пользователя.
     * Используется в личном кабинете /account/reviews.
     */
    public function mine(Request $request)
    {
        $reviews = Review::query()
            ->with(['user:id,name,login'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return ReviewResource::collection($reviews);
    }

    /**
     * Создание отзыва.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:2', 'max:2000'],
            'reviewable_type' => ['required', 'string', 'max:255'],
            'reviewable_id' => ['required', 'integer', 'min:1'],
            'advantages' => ['nullable', 'string', 'max:2000'],
            'disadvantages' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['string', 'max:2048'],
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'rating' => $data['rating'],
            'text' => $data['text'],
            'reviewable_type' => $this->normalizeReviewableType($data['reviewable_type']),
            'reviewable_id' => $data['reviewable_id'],
            'advantages' => $data['advantages'] ?? null,
            'disadvantages' => $data['disadvantages'] ?? null,
            'photos' => $data['photos'] ?? null,
            'verified_purchase' => $this->verifiedPurchase($request, $data),
            'trainer_recommendation' => $request->user()?->isTrainer() ?? false,
        ]);

        $review->load(['user:id,name,login']);

        return response()->json([
            'review' => new ReviewResource($review),
            'data' => new ReviewResource($review),
        ], 201);
    }

    private function verifiedPurchase(Request $request, array $data): bool
    {
        if ($this->normalizeReviewableType($data['reviewable_type']) !== \App\Models\Product::class) return false;
        return \App\Models\Order::query()
            ->where('user_id', $request->user()->id)
            ->where('payment_status', 'paid')
            ->whereHas('items', fn ($q) => $q->where('product_id', $data['reviewable_id']))
            ->exists();
    }

    private function normalizeReviewableType(string $type): string
    {
        return match ($type) {
            'site', 'gym', 'club', 'fitlab' => 'site',
            'trainer' => \App\Models\Trainer::class,
            'program' => \App\Models\Program::class,
            'product' => \App\Models\Product::class,
            default => $type,
        };
    }
}