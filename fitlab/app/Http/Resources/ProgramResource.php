<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'level' => $this->level,
            'duration_weeks' => (int) ($this->duration_weeks ?: 1),
            'price' => 0,
            'is_free' => true,
            'image_url' => $this->image_url,
            'trainer' => new TrainerResource($this->whenLoaded('trainer')),
            'workouts_count' => $this->when(
                isset($this->workouts_count),
                fn () => (int) $this->workouts_count
            ),
            'workouts' => WorkoutResource::collection($this->whenLoaded('workouts')),
        ];
    }
}
