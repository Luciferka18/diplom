<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'client_name' => $this->client_name,
            'client_phone' => $this->client_phone,
            'trainer' => new TrainerResource($this->whenLoaded('trainer')),
            'location' => $this->whenLoaded('location', fn() => ['id' => $this->location->id, 'name' => $this->location->name, 'address' => $this->location->address]),
        ];
    }
}
