<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Http\JsonResponse;

class MuscleController extends Controller
{
    public function index(): JsonResponse
    {
        $muscles = Muscle::query()
            ->orderBy('body_side')
            ->orderBy('name')
            ->get()
            ->map(fn (Muscle $muscle) => $this->musclePayload($muscle, false));

        return response()->json($muscles);
    }

    public function show(string $slug): JsonResponse
    {
        $muscle = Muscle::query()
            ->where('slug', $slug)
            ->with(['exercises.muscles'])
            ->firstOrFail();

        return response()->json($this->musclePayload($muscle, true));
    }

    public function exercises(string $slug): JsonResponse
    {
        $muscle = Muscle::query()
            ->where('slug', $slug)
            ->with(['exercises.muscles'])
            ->firstOrFail();

        return response()->json(
            $muscle->exercises->map(fn (Exercise $exercise) => $this->exercisePayload($exercise))
        );
    }

    public function showExercise(string $slug): JsonResponse
    {
        $exercise = Exercise::query()
            ->where('slug', $slug)
            ->with('muscles')
            ->firstOrFail();

        return response()->json($this->exercisePayload($exercise, true));
    }

    private function musclePayload(Muscle $muscle, bool $withExercises = false): array
    {
        $payload = [
            'id' => $muscle->id,
            'slug' => $muscle->slug,
            'name' => $muscle->name,
            'latin_name' => $muscle->latin_name,
            'description' => $muscle->description,
            'function' => $muscle->getAttribute('function'),
            'how_to_grow' => $muscle->how_to_grow,
            'body_side' => $muscle->body_side,
        ];

        if ($withExercises) {
            $payload['exercises'] = $muscle->exercises
                ->map(fn (Exercise $exercise) => $this->exercisePayload($exercise))
                ->values();
        }

        return $payload;
    }

    private function exercisePayload(Exercise $exercise, bool $withDetails = false): array
    {
        $primaryMuscles = $exercise->muscles
            ->filter(fn (Muscle $muscle) => $muscle->pivot?->role === 'primary')
            ->map(fn (Muscle $muscle) => [
                'slug' => $muscle->slug,
                'name' => $muscle->name,
            ])
            ->values();

        $secondaryMuscles = $exercise->muscles
            ->filter(fn (Muscle $muscle) => $muscle->pivot?->role === 'secondary')
            ->map(fn (Muscle $muscle) => [
                'slug' => $muscle->slug,
                'name' => $muscle->name,
            ])
            ->values();

        $payload = [
            'id' => $exercise->id,
            'slug' => $exercise->slug,
            'name' => $exercise->name,
            'description' => $exercise->description,
            'difficulty' => $exercise->difficulty,
            'equipment' => $exercise->equipment,
            'video_url' => $exercise->video_url,
            'thumbnail_url' => $exercise->thumbnail_url,
            'role' => $exercise->pivot?->role,
            'primary_muscles' => $primaryMuscles,
            'secondary_muscles' => $secondaryMuscles,
        ];

        if ($withDetails) {
            $payload['technique'] = $exercise->technique;
            $payload['common_mistakes'] = $exercise->common_mistakes;
        }

        return $payload;
    }
}
