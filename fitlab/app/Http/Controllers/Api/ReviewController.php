<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Program;
use App\Models\Review;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'reviewable_type' => ['required', Rule::in(['trainer', 'program'])],
            'reviewable_id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'text' => ['required', 'string', 'max:2000'],
        ]);

        $reviewable = $data['reviewable_type'] === 'trainer'
            ? Trainer::findOrFail($data['reviewable_id'])
            : Program::findOrFail($data['reviewable_id']);

        $review = new Review([
            'user_id' => $request->user()->id,
            'rating' => $data['rating'],
            'text' => $data['text'],
        ]);

        $reviewable->reviews()->save($review);

        return new ReviewResource($review->load('user'));
    }
}
