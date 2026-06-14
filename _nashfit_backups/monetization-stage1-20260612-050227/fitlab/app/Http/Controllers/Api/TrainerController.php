<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerResource;
use App\Models\Trainer;

class TrainerController extends Controller
{
    public function index()
    {
        $trainers = Trainer::with(['user', 'reviews.user', 'schedules.location'])
            ->orderBy('name')
            ->get();

        return TrainerResource::collection($trainers);
    }

    public function show($id)
    {
        $trainer = Trainer::with(['user', 'reviews.user', 'schedules.location'])->find($id);

        if (!$trainer) {
            return response()->json([
                'message' => 'Trainer not found',
            ], 404);
        }

        return new TrainerResource($trainer);
    }
}
