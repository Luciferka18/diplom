<?php

namespace App\Services;

use App\Models\ActivityEvent;
use App\Models\Trainer;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class ActivityService
{
    public function notifyUser(User|int|null $user, string $type, string $title, ?string $body = null, ?string $url = null, ?Model $subject = null, array $data = [], ?int $actorId = null, string $icon = 'bell'): ?UserNotification
    {
        if (!Schema::hasTable('user_notifications')) return null;

        $userId = $user instanceof User ? $user->id : $user;
        if (!$userId) return null;

        $existing = $this->findExistingNotification($userId, $type, $data);
        if ($existing) {
            $existing->fill([
                'actor_id' => $actorId,
                'title' => $title,
                'body' => $body,
                'action_url' => $url,
                'icon' => $icon,
                'data' => array_merge($existing->data ?: [], $data),
            ])->save();

            return $existing->fresh();
        }

        $notification = UserNotification::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'action_url' => $url,
            'icon' => $icon,
            'data' => $data,
        ]);

        $this->event($userId, 'user', $type, $title, $body, $url, $subject, $data, $actorId);

        return $notification;
    }

    public function notifyTrainer(Trainer|int|null $trainer, string $type, string $title, ?string $body = null, ?string $url = null, ?Model $subject = null, array $data = [], ?int $actorId = null, string $icon = 'dumbbell'): void
    {
        $trainerModel = $trainer instanceof Trainer ? $trainer : Trainer::find($trainer);
        if (!$trainerModel || !$trainerModel->user_id) return;

        $this->notifyUser($trainerModel->user_id, $type, $title, $body, $url, $subject, $data, $actorId, $icon);
        $this->event($trainerModel->user_id, 'trainer', $type, $title, $body, $url, $subject, $data, $actorId);
    }

    public function notifyAdmins(string $type, string $title, ?string $body = null, ?string $url = null, ?Model $subject = null, array $data = [], ?int $actorId = null, string $icon = 'shield'): void
    {
        if (!Schema::hasTable('user_notifications')) return;

        User::query()->where('role', 'admin')->select('id')->chunkById(100, function ($admins) use ($type, $title, $body, $url, $subject, $data, $actorId, $icon) {
            foreach ($admins as $admin) {
                if ($actorId && (int) $admin->id === (int) $actorId) {
                    continue;
                }

                $this->notifyUser($admin->id, $type, $title, $body, $url, $subject, $data, $actorId, $icon);
            }
        });

        $this->event(null, 'admin', $type, $title, $body, $url, $subject, $data, $actorId);
    }

    public function event(User|int|null $user, string $audience, string $type, string $title, ?string $body = null, ?string $url = null, ?Model $subject = null, array $data = [], ?int $actorId = null): ?ActivityEvent
    {
        if (!Schema::hasTable('activity_events')) return null;

        $userId = $user instanceof User ? $user->id : $user;
        $subjectType = $subject ? $subject::class : User::class;
        $subjectId = $subject?->getKey() ?: ($userId ?: 0);

        if ($existing = $this->findExistingEvent($userId, $audience, $type, $subjectType, $subjectId, $data)) {
            $existing->fill([
                'actor_id' => $actorId,
                'title' => $title,
                'body' => $body,
                'action_url' => $url,
                'data' => array_merge($existing->data ?: [], $data),
            ])->save();

            return $existing->fresh();
        }

        return ActivityEvent::create([
            'user_id' => $userId,
            'actor_id' => $actorId,
            'audience' => $audience,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'action_url' => $url,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'data' => $data,
        ]);
    }

    private function findExistingNotification(int $userId, string $type, array $data): ?UserNotification
    {
        $paymentId = $data['payment_id'] ?? null;
        $orderId = $data['order_id'] ?? null;

        if (!$paymentId && !$orderId) return null;

        $query = UserNotification::query()
            ->where('user_id', $userId)
            ->whereIn('type', $this->relatedTypes($type));

        if ($paymentId) {
            $query->where('data->payment_id', $paymentId);
        }

        if ($orderId) {
            $query->where('data->order_id', $orderId);
        }

        return $query->latest('id')->first();
    }

    private function findExistingEvent(User|int|null $userId, string $audience, string $type, string $subjectType, int|string $subjectId, array $data): ?ActivityEvent
    {
        $paymentId = $data['payment_id'] ?? null;
        $orderId = $data['order_id'] ?? null;

        if (!$paymentId && !$orderId) return null;

        $query = ActivityEvent::query()
            ->where('audience', $audience)
            ->whereIn('type', $this->relatedTypes($type))
            ->where('subject_type', $subjectType)
            ->where('subject_id', $subjectId);

        if ($userId) {
            $query->where('user_id', $userId instanceof User ? $userId->id : $userId);
        } else {
            $query->whereNull('user_id');
        }

        if ($paymentId) {
            $query->where('data->payment_id', $paymentId);
        }

        if ($orderId) {
            $query->where('data->order_id', $orderId);
        }

        return $query->latest('id')->first();
    }

    private function relatedTypes(string $type): array
    {
        $normalized = preg_replace('/^admin\./', '', $type);
        $types = [$type, $normalized, 'admin.' . $normalized];

        return array_values(array_unique($types));
    }
}
