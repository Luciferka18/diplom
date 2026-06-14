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
            'trainer_service_id' => $this->trainer_service_id,
            'location_id' => $this->location_id,
            'gym_location_id' => $this->location_id,
            'status' => $this->status,
            'status_label' => match ($this->status) {
                'booked' => 'Записан', 'cancelled' => 'Отменено', 'completed' => 'Завершено', default => $this->status,
            },
            'payment_status' => $this->payment_status,
            'subtotal_amount' => (int) $this->subtotal_amount,
            'discount_amount' => (int) $this->discount_amount,
            'total_amount' => (int) $this->total_amount,
            'date' => $this->starts_at?->toDateString(),
            'time' => $this->starts_at?->format('H:i'),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'duration_minutes' => $this->starts_at && $this->ends_at ? $this->starts_at->diffInMinutes($this->ends_at) : null,
            'client_name' => $this->client_name,
            'client_phone' => $this->client_phone,
            'client_comment' => $this->client_comment,
            'comment' => $this->client_comment,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
                'avatar_url' => $this->user->avatar_url,
            ] : null),
            'service' => $this->whenLoaded('service', fn () => $this->service ? [
                'id' => $this->service->id,
                'name' => $this->service->name,
                'description' => $this->service->description,
                'duration_minutes' => $this->service->duration_minutes,
                'price' => $this->service->price,
                'badge' => $this->service->badge,
            ] : null),
            'payment' => $this->whenLoaded('payment', fn () => $this->payment ? [
                'id' => $this->payment->id,
                'status' => $this->payment->status,
                'amount' => $this->payment->amount,
                'provider' => $this->payment->provider,
            ] : null),
            'trainer' => $this->whenLoaded('trainer', fn () => [
                'id' => $this->trainer?->id,
                'name' => $this->trainer?->name,
                'specialization' => $this->trainer?->specialization,
                'photo_url' => $this->trainer?->photo_url,
            ]),
            'location' => $this->whenLoaded('location', fn () => [
                'id' => $this->location?->id,
                'name' => $this->location?->name,
                'address' => $this->location?->address,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
