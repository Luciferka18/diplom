<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $reviewsCollection = null;
        $reviewsCount = 0;
        $totalRating = 0;
        $reviewsData = [];

        if ($this->relationLoaded('reviews')) {
            $reviewsCollection = $this->reviews;
            if ($reviewsCollection instanceof \Illuminate\Support\Collection) {
                $reviewsCount = $reviewsCollection->count();
                $totalRating = $reviewsCollection->sum('rating');
                $reviewsData = ReviewResource::collection($reviewsCollection)->resolve();
            }
        }

        $avgRating = $reviewsCount > 0 ? round($totalRating / $reviewsCount, 1) : 0;

        // Расписание
        $schedulesData = [];
        if ($this->relationLoaded('schedules')) {
            $schedulesData = \App\Http\Resources\TrainerScheduleResource::collection($this->schedules)->resolve();
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'specialization' => $this->specialization,
            'experience_years' => $this->experience_years,
            'age' => $this->age,
            'bio' => $this->bio,
            'photo_url' => $this->photo_url ?: $this->user?->avatar_url,
            'avatar_url' => $this->user?->avatar_url,
            'instagram' => $this->instagram,
            'phone' => $this->phone,
            'avg_rating' => $avgRating,
            'reviews_count' => $reviewsCount,
            'reviews' => $reviewsData,
            'services' => $this->whenLoaded('services', fn () => $this->services->where('is_active', true)->values()->map(fn ($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration_minutes' => $service->duration_minutes,
                'price' => $service->price,
                'badge' => $service->badge,
                'is_intro' => $service->is_intro,
            ])),
            'schedules' => $schedulesData,
        ];
    }
}
