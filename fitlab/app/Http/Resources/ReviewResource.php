<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userData = null;
        if ($this->relationLoaded('user')) {
            $userData = $this->user ? new UserResource($this->user) : null;
        }

        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'text' => $this->text,
            'user' => $userData,
            'created_at' => $this->created_at,
        ];
    }
}
