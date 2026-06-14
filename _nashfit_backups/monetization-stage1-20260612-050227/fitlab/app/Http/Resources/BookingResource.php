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
            'user_id' => $this->user_id,
            'trainer_id' => $this->trainer_id,
            'location_id' => $this->location_id,
            'gym_location_id' => $this->location_id,

            'status' => $this->status,
            'status_label' => match ($this->status) {
                'booked' => 'Записан',
                'cancelled' => 'Отменено',
                'completed' => 'Завершено',
                default => $this->status,
            },

            'date' => $this->starts_at?->toDateString(),
            'time' => $this->starts_at?->format('H:i'),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'duration_minutes' => $this->starts_at && $this->ends_at
                ? $this->starts_at->diffInMinutes($this->ends_at)
                : null,

            'client_name' => $this->client_name,
            'client_phone' => $this->client_phone,
            'client_comment' => $this->client_comment,
            'comment' => $this->client_comment,

            'trainer' => $this->whenLoaded('trainer', function () {
                return [
                    'id' => $this->trainer?->id,
                    'name' => $this->trainer?->name,
                    'specialization' => $this->trainer?->specialization,
                    'photo_url' => $this->trainer?->photo_url,
                ];
            }),

            'location' => $this->whenLoaded('location', function () {
                return [
                    'id' => $this->location?->id,
                    'name' => $this->location?->name,
                    'address' => $this->location?->address,
                ];
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
