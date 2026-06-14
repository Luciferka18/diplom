<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $target = $this->getTargetData();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,

            'rating' => $this->rating,
            'text' => $this->text,

            'reviewable_type' => $this->reviewable_type,
            'reviewable_id' => $this->reviewable_id,

            'target' => $target,
            'target_label' => $target['label'],
            'target_name' => $target['name'],

            'status' => $this->status ?? 'pending',
            'response' => $this->response ?? null,

            'user' => $this->whenLoaded('user', function () {
                return $this->user ? [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'login' => $this->user->login,
                ] : null;
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function getTargetData(): array
    {
        $type = (string) $this->reviewable_type;
        $id = (int) $this->reviewable_id;

        if (in_array($type, ['site', 'gym', 'club', 'fitlab'], true)) {
            return [
                'type' => 'site',
                'type_label' => 'Зал',
                'name' => 'НашФит',
                'label' => 'Зал: НашФит',
            ];
        }

        if (in_array($type, ['trainer', \App\Models\Trainer::class], true)) {
            $trainer = \App\Models\Trainer::query()->find($id);
            $name = $trainer?->name ?? "Тренер #{$id}";

            return [
                'type' => 'trainer',
                'type_label' => 'Тренер',
                'name' => $name,
                'label' => "Тренер: {$name}",
            ];
        }

        if (in_array($type, ['program', \App\Models\Program::class], true)) {
            $program = \App\Models\Program::query()->find($id);
            $name = $program?->title ?? $program?->name ?? "Программа #{$id}";

            return [
                'type' => 'program',
                'type_label' => 'Программа',
                'name' => $name,
                'label' => "Программа: {$name}",
            ];
        }

        if (in_array($type, ['product', \App\Models\Product::class], true)) {
            $product = \App\Models\Product::query()->find($id);
            $name = $product?->name ?? $product?->title ?? "Товар #{$id}";

            return [
                'type' => 'product',
                'type_label' => 'Товар',
                'name' => $name,
                'label' => "Товар: {$name}",
            ];
        }

        return [
            'type' => $type ?: 'unknown',
            'type_label' => 'Объект',
            'name' => $id ? "#{$id}" : 'Неизвестно',
            'label' => $id ? "Объект: #{$id}" : 'Объект: неизвестно',
        ];
    }
}