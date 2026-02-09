<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'specialization' => $this->specialization,
            'experience_years' => $this->experience_years,
            'bio' => $this->bio,
            'photo_url' => $this->photo_url,
            'instagram' => $this->instagram,
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
