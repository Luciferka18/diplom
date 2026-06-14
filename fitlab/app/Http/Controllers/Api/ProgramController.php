<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = Program::with('trainer')->withCount('workouts');

        if ($request->filled('level')) {
            $query->where('level', $request->string('level'));
        }

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn($w) => $w->where('title', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"));
        }

        if ($request->boolean('paginate')) {
            return ProgramResource::collection($query->latest()->paginate((int) $request->integer('per_page', 12)));
        }

        return ProgramResource::collection($query->latest()->limit((int) $request->integer('per_page', 12))->get());
    }

    public function show(Program $program)
    {
        return new ProgramResource($program->load(['trainer', 'workouts'])->loadCount('workouts'));
    }
}
