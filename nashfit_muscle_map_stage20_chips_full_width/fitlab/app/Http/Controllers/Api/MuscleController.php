<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Muscle;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

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

            $payload['related_programs'] = $this->relatedProgramsForMuscle($muscle);
        }

        return $payload;
    }

    private function relatedProgramsForMuscle(Muscle $muscle)
    {
        $keywordsByMuscle = [
            'chest' => ['жим', 'силовая', 'масса', 'сила'],
            'shoulders' => ['жим', 'силовая', 'мощь', 'сила'],
            'biceps' => ['тяга', 'силовая', 'масса', 'сила'],
            'triceps' => ['жим', 'силовая', 'мощь', 'сила'],
            'forearms' => ['функциональный', 'тяга', 'базовые'],
            'abs' => ['функциональный', 'похудение', 'корпус', 'базовые'],
            'obliques' => ['функциональный', 'похудение', 'корпус', 'базовые'],
            'lats' => ['тяга', 'силовая', 'мощь', 'сила'],
            'traps' => ['тяга', 'силовая', 'мощь', 'сила'],
            'lower_back' => ['тяга', 'функциональный', 'базовые', 'силовая'],
            'glutes' => ['присед', 'тяга', 'силовая', 'похудение'],
            'quads' => ['присед', 'силовая', 'мощь', 'похудение'],
            'hamstrings' => ['тяга', 'присед', 'силовая'],
            'calves' => ['похудение', 'выносливость', 'силовая'],
        ];

        $keywords = $keywordsByMuscle[$muscle->slug] ?? [];
        if (!$keywords) {
            return collect();
        }

        return Program::query()
            ->with('tags')
            ->get()
            ->filter(function (Program $program) use ($keywords) {
                $tagText = $program->tags
                    ->map(fn ($tag) => trim(($tag->name ?? '') . ' ' . ($tag->slug ?? '')))
                    ->implode(' ');

                $haystack = Str::lower(trim(
                    ($program->title ?? '') . ' ' .
                    ($program->description ?? '') . ' ' .
                    ($program->level ?? '') . ' ' .
                    $tagText
                ));

                foreach ($keywords as $keyword) {
                    if (Str::contains($haystack, Str::lower($keyword))) {
                        return true;
                    }
                }

                return false;
            })
            ->take(2)
            ->map(fn (Program $program) => $this->programPayload($program, $muscle))
            ->values();
    }

    private function programPayload(Program $program, Muscle $muscle): array
    {
        return [
            'id' => $program->id,
            'title' => $program->title,
            'description' => $program->description,
            'level' => $program->level,
            'duration_weeks' => $program->duration_weeks,
            'image_url' => $program->image_url,
            'href' => "/programs/{$program->id}",
            'match_reason' => "связана с развитием: {$muscle->name}",
        ];
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
            'technique' => $exercise->technique,
            'common_mistakes' => $exercise->common_mistakes,
            'role' => $exercise->pivot?->role,
            'primary_muscles' => $primaryMuscles,
            'secondary_muscles' => $secondaryMuscles,
        ];

        return $payload;
    }
}
