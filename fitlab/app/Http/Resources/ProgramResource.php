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
            'duration_weeks' => $this->duration_weeks,
            'price' => $this->price,
            'image_url' => $this->image_url,
            'trainer' => new TrainerResource($this->whenLoaded('trainer')),
        ];
    }
}
