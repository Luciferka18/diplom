<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class WorkoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $videoUrl = null;

        if ($this->video_path) {
            $videoUrl = str_starts_with($this->video_path, 'http')
                ? $this->video_path
                : Storage::disk('public')->url($this->video_path);
        }

        return [
            'id' => $this->id,
            'program_id' => $this->program_id,
            'week_number' => (int) ($this->week_number ?: 1),
            'day_number' => (int) ($this->day_number ?: 1),
            'duration_minutes' => $this->duration_minutes ? (int) $this->duration_minutes : null,
            'sort_order' => (int) ($this->sort_order ?: 0),
            'title' => $this->title,
            'description' => $this->description,
            'video_url' => $videoUrl,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
