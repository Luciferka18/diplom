<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Публичный список отзывов (для главной страницы)
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

        return response()->json($reviews);
    }

    /**
     * Создание отзыва (только авторизованные)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:2', 'max:2000'],
            'reviewable_type' => ['required', 'string', 'max:50'],
            'reviewable_id' => ['required', 'integer', 'min:1'],
        ]);

        $review = new Review();
        $review->user_id = $request->user()->id;
        $review->rating = $data['rating'];
        $review->text = $data['text'];
        $review->reviewable_type = $data['reviewable_type'];
        $review->reviewable_id = $data['reviewable_id'];
        $review->save();

        return response()->json($review->load(['user:id,name,login']), 201);
    }
}
