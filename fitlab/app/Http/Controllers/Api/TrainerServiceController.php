<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use App\Models\TrainerService;

class TrainerServiceController extends Controller
{
    public function index(Trainer $trainer)
    {
        $services = TrainerService::query()
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('trainer_id')->orWhere('trainer_id', $trainer->id))
            ->orderByRaw('trainer_id IS NULL DESC')
            ->orderBy('sort_order')
            ->get()
            ->unique('slug')
            ->values();
        return response()->json(['data' => $services]);
    }
}
