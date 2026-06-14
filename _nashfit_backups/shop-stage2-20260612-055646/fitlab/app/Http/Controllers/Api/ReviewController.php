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
        $limit = (int) $request->query('limit', 6);
        $limit = max(1, min($limit, 50));

        $reviews = Review::query()
            ->with(['user:id,name,login'])
            ->latest()
            ->take($limit)
            ->get();

        return ReviewResource::collection($reviews);
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
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'rating' => $data['rating'],
            'text' => $data['text'],
            'reviewable_type' => $this->normalizeReviewableType($data['reviewable_type']),
            'reviewable_id' => $data['reviewable_id'],
        ]);

        $review->load(['user:id,name,login']);

        return response()->json([
            'review' => new ReviewResource($review),
            'data' => new ReviewResource($review),
        ], 201);
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