<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Http\Resources\TrainerResource;

class TrainerController extends Controller
{
    public function index()
    {
        $trainers = Trainer::with('user')->get();

        return TrainerResource::collection($trainers);
    }

    public function show($id)
    {
        $trainer = Trainer::with('user')->find($id);

        if (!$trainer) {
            return response()->json([
                'message' => 'Trainer not found'
            ], 404);
        }

        return new TrainerResource($trainer);
    }
}
