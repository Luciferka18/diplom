<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityEvent;
use App\Models\UserNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $items = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $items->getCollection()->map(fn (UserNotification $item) => $this->notification($item))->values(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
            'unread_count' => UserNotification::query()->where('user_id', $request->user()->id)->whereNull('read_at')->count(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => UserNotification::query()->where('user_id', $request->user()->id)->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Request $request, UserNotification $notification)
    {
        abort_unless((int) $notification->user_id === (int) $request->user()->id, 403);
        $notification->forceFill(['read_at' => $notification->read_at ?: now()])->save();

        return response()->json([
            'data' => $this->notification($notification->fresh()),
            'unread_count' => UserNotification::query()->where('user_id', $request->user()->id)->whereNull('read_at')->count(),
        ]);
    }

    public function markAllRead(Request $request)
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return response()->json(['message' => 'Все уведомления прочитаны.', 'unread_count' => 0]);
    }

    public function activity(Request $request)
    {
        $items = ActivityEvent::query()
            ->where(function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
                if ($request->user()->isTrainer()) $query->orWhere('audience', 'trainer')->where('user_id', $request->user()->id);
            })
            ->latest()
            ->limit((int) $request->integer('limit', 12))
            ->get();

        return response()->json(['data' => $items->map(fn (ActivityEvent $item) => $this->event($item))->values()]);
    }

    public function adminActivity(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $items = ActivityEvent::query()
            ->where('audience', 'admin')
            ->latest()
            ->limit((int) $request->integer('limit', 20))
            ->get();

        return response()->json(['data' => $items->map(fn (ActivityEvent $item) => $this->event($item))->values()]);
    }

    private function notification(UserNotification $item): array
    {
        return [
            'id' => $item->id,
            'type' => $item->type,
            'title' => $item->title,
            'body' => $item->body,
            'action_url' => $item->action_url,
            'icon' => $item->icon,
            'data' => $item->data ?: [],
            'read_at' => $item->read_at?->toISOString(),
            'created_at' => $item->created_at?->toISOString(),
            'is_read' => (bool) $item->read_at,
        ];
    }

    private function event(ActivityEvent $item): array
    {
        return [
            'id' => $item->id,
            'audience' => $item->audience,
            'type' => $item->type,
            'title' => $item->title,
            'body' => $item->body,
            'action_url' => $item->action_url,
            'data' => $item->data ?: [],
            'created_at' => $item->created_at?->toISOString(),
        ];
    }
}
