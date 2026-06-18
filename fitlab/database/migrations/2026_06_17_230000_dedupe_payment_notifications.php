<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->dedupeUserNotifications();
        $this->dedupeActivityEvents();
    }

    public function down(): void
    {
        // Data cleanup migration; nothing to roll back safely.
    }

    private function dedupeUserNotifications(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            return;
        }

        $seen = [];
        $deleteIds = [];

        DB::table('user_notifications')
            ->select(['id', 'user_id', 'type', 'title', 'body', 'action_url', 'data', 'created_at'])
            ->orderBy('id')
            ->chunkById(300, function ($rows) use (&$seen, &$deleteIds) {
                foreach ($rows as $row) {
                    $data = $this->decodeData($row->data ?? null);
                    $paymentId = $data['payment_id'] ?? null;
                    $orderId = $data['order_id'] ?? null;
                    $type = $this->normalizeType((string) ($row->type ?? ''));

                    if ($paymentId || $orderId) {
                        $key = implode('|', [
                            (int) $row->user_id,
                            $type,
                            $paymentId ? 'payment:' . $paymentId : 'order:' . $orderId,
                            (string) ($row->title ?? ''),
                        ]);
                    } else {
                        $key = implode('|', [
                            (int) $row->user_id,
                            (string) ($row->type ?? ''),
                            (string) ($row->title ?? ''),
                            trim((string) ($row->body ?? '')),
                            (string) ($row->action_url ?? ''),
                        ]);
                    }

                    if (isset($seen[$key])) {
                        $deleteIds[] = (int) $row->id;
                    } else {
                        $seen[$key] = (int) $row->id;
                    }
                }
            });

        foreach (array_chunk($deleteIds, 300) as $chunk) {
            DB::table('user_notifications')->whereIn('id', $chunk)->delete();
        }
    }

    private function dedupeActivityEvents(): void
    {
        if (!Schema::hasTable('activity_events')) {
            return;
        }

        $seen = [];
        $deleteIds = [];

        DB::table('activity_events')
            ->select(['id', 'user_id', 'audience', 'type', 'title', 'body', 'action_url', 'subject_type', 'subject_id', 'data'])
            ->orderBy('id')
            ->chunkById(300, function ($rows) use (&$seen, &$deleteIds) {
                foreach ($rows as $row) {
                    $data = $this->decodeData($row->data ?? null);
                    $paymentId = $data['payment_id'] ?? null;
                    $orderId = $data['order_id'] ?? null;
                    $type = $this->normalizeType((string) ($row->type ?? ''));

                    if ($paymentId || $orderId) {
                        $key = implode('|', [
                            (string) ($row->user_id ?? 'null'),
                            (string) ($row->audience ?? ''),
                            $type,
                            (string) ($row->subject_type ?? ''),
                            (string) ($row->subject_id ?? ''),
                            $paymentId ? 'payment:' . $paymentId : 'order:' . $orderId,
                            (string) ($row->title ?? ''),
                        ]);
                    } else {
                        $key = implode('|', [
                            (string) ($row->user_id ?? 'null'),
                            (string) ($row->audience ?? ''),
                            (string) ($row->type ?? ''),
                            (string) ($row->title ?? ''),
                            trim((string) ($row->body ?? '')),
                            (string) ($row->action_url ?? ''),
                        ]);
                    }

                    if (isset($seen[$key])) {
                        $deleteIds[] = (int) $row->id;
                    } else {
                        $seen[$key] = (int) $row->id;
                    }
                }
            });

        foreach (array_chunk($deleteIds, 300) as $chunk) {
            DB::table('activity_events')->whereIn('id', $chunk)->delete();
        }
    }

    private function decodeData(mixed $raw): array
    {
        if (is_array($raw)) {
            return $raw;
        }

        if (is_object($raw)) {
            return json_decode(json_encode($raw), true) ?: [];
        }

        if (!is_string($raw) || trim($raw) === '') {
            return [];
        }

        return json_decode($raw, true) ?: [];
    }

    private function normalizeType(string $type): string
    {
        return preg_replace('/^admin\./', '', $type) ?: $type;
    }
};
