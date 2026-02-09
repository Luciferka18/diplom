<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerResource;
use App\Models\Trainer;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
    public function index(Request $request)
    {
        $query = Trainer::query();

        if ($request->filled('specialization')) {
            $query->where('specialization', 'like', '%' . $request->string('specialization') . '%');
        }

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn($w) => $w
                ->where('name', 'like', "%{$q}%")
                ->orWhere('bio', 'like', "%{$q}%"));
        }

        $perPage = (int) $request->integer('per_page', 12);

        if ($request->boolean('paginate')) {
            return TrainerResource::collection($query->latest()->paginate(max(1, min(50, $perPage))));
        }

        return TrainerResource::collection($query->latest()->limit($perPage)->get());
    }

    public function show(Trainer $trainer)
    {
        $trainer->load(['reviews.user']);

        return new TrainerResource($trainer);
    }
}
