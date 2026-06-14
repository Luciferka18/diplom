<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminDashboardController extends Controller
{
    public function overview(): JsonResponse
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $weekStart = Carbon::now()->subDays(6)->startOfDay();

        return response()->json([
            'totals' => [
                'users' => $this->countTable('users'),
                'trainers' => $this->countTable('trainers'),
                'programs' => $this->countTable('programs'),
                'workouts' => $this->countTable('workouts'),
                'articles' => $this->countTable('articles'),
                'products' => $this->countTable('products'),
                'product_variants' => $this->countTable('product_variants'),
                'orders' => $this->countTable('orders'),
                'bookings' => $this->countTable('bookings'),
                'reviews' => $this->countTable('reviews'),
                'memberships' => $this->countTable('memberships'),
                'payments' => $this->countTable('payments'),
                'notifications' => $this->countTable('user_notifications'),
                'activities' => $this->countTable('activity_events'),
            ],
            'today' => [
                'orders' => $this->countSince('orders', $today),
                'orders_amount' => $this->sumSince('orders', 'total', $today),
                'bookings' => $this->countSince('bookings', $today, 'starts_at'),
                'payments_amount' => $this->sumSince('payments', 'amount', $today, 'created_at', ['status' => ['paid', 'succeeded', 'confirmed']]),
                'users' => $this->countSince('users', $today),
                'pending_articles' => $this->countWhere('articles', 'status', ['pending', 'submitted', 'review']),
            ],
            'month' => [
                'orders' => $this->countSince('orders', $monthStart),
                'orders_amount' => $this->sumSince('orders', 'total', $monthStart),
                'payments_amount' => $this->sumSince('payments', 'amount', $monthStart, 'created_at', ['status' => ['paid', 'succeeded', 'confirmed']]),
                'bookings' => $this->countSince('bookings', $monthStart),
                'memberships' => $this->countSince('user_memberships', $monthStart),
            ],
            'status' => [
                'orders' => $this->statusCounts('orders'),
                'bookings' => $this->statusCounts('bookings'),
                'payments' => $this->statusCounts('payments'),
                'articles' => $this->statusCounts('articles'),
            ],
            'charts' => [
                'orders' => $this->dailySeries('orders', 'total', $weekStart),
                'bookings' => $this->dailySeries('bookings', null, $weekStart, 'starts_at'),
                'users' => $this->dailySeries('users', null, $weekStart),
            ],
            'attention' => [
                'low_stock' => $this->lowStock(),
                'latest_orders' => $this->latestOrders(),
                'latest_bookings' => $this->latestBookings(),
                'latest_payments' => $this->latestPayments(),
                'latest_activity' => $this->latestActivity(),
            ],
            'health' => $this->health(),
        ]);
    }

    private function hasTable(string $table): bool
    {
        try {
            return Schema::hasTable($table);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function hasColumn(string $table, string $column): bool
    {
        try {
            return $this->hasTable($table) && Schema::hasColumn($table, $column);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function countTable(string $table): int
    {
        if (!$this->hasTable($table)) return 0;

        try {
            return (int) DB::table($table)->count();
        } catch (\Throwable $e) {
            return 0;
        }
    }

    private function countSince(string $table, Carbon $since, string $dateColumn = 'created_at'): int
    {
        if (!$this->hasColumn($table, $dateColumn)) return 0;

        try {
            return (int) DB::table($table)->where($dateColumn, '>=', $since)->count();
        } catch (\Throwable $e) {
            return 0;
        }
    }

    private function sumSince(string $table, string $amountColumn, Carbon $since, string $dateColumn = 'created_at', array $whereIn = []): int
    {
        if (!$this->hasColumn($table, $amountColumn) || !$this->hasColumn($table, $dateColumn)) return 0;

        try {
            $query = DB::table($table)->where($dateColumn, '>=', $since);
            foreach ($whereIn as $column => $values) {
                if ($this->hasColumn($table, $column)) {
                    $query->whereIn($column, $values);
                }
            }

            return (int) $query->sum($amountColumn);
        } catch (\Throwable $e) {
            return 0;
        }
    }

    private function countWhere(string $table, string $column, array $values): int
    {
        if (!$this->hasColumn($table, $column)) return 0;

        try {
            return (int) DB::table($table)->whereIn($column, $values)->count();
        } catch (\Throwable $e) {
            return 0;
        }
    }

    private function statusCounts(string $table): array
    {
        if (!$this->hasColumn($table, 'status')) return [];

        try {
            return DB::table($table)
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->orderByDesc('total')
                ->get()
                ->map(fn ($row) => ['status' => (string) $row->status, 'total' => (int) $row->total])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function dailySeries(string $table, ?string $amountColumn, Carbon $since, string $dateColumn = 'created_at'): array
    {
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $days[$date] = ['date' => $date, 'count' => 0, 'amount' => 0];
        }

        if (!$this->hasColumn($table, $dateColumn)) return array_values($days);

        try {
            $select = 'DATE(' . $dateColumn . ') as day, COUNT(*) as count';
            if ($amountColumn && $this->hasColumn($table, $amountColumn)) {
                $select .= ', COALESCE(SUM(' . $amountColumn . '), 0) as amount';
            }

            $rows = DB::table($table)
                ->selectRaw($select)
                ->where($dateColumn, '>=', $since)
                ->groupBy('day')
                ->orderBy('day')
                ->get();

            foreach ($rows as $row) {
                $day = (string) $row->day;
                if (isset($days[$day])) {
                    $days[$day]['count'] = (int) $row->count;
                    $days[$day]['amount'] = isset($row->amount) ? (int) $row->amount : 0;
                }
            }
        } catch (\Throwable $e) {
            // keep zero series
        }

        return array_values($days);
    }

    private function latestOrders(): array
    {
        if (!$this->hasTable('orders')) return [];

        try {
            $columns = ['id'];
            foreach (['status', 'total', 'customer_name', 'customer_phone', 'created_at'] as $column) {
                if ($this->hasColumn('orders', $column)) $columns[] = $column;
            }

            return DB::table('orders')
                ->select($columns)
                ->orderByDesc($this->hasColumn('orders', 'created_at') ? 'created_at' : 'id')
                ->limit(5)
                ->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function latestBookings(): array
    {
        if (!$this->hasTable('bookings')) return [];

        try {
            $query = DB::table('bookings')->select('bookings.id');
            foreach (['client_name', 'client_phone', 'status', 'starts_at', 'created_at'] as $column) {
                if ($this->hasColumn('bookings', $column)) $query->addSelect('bookings.' . $column);
            }

            if ($this->hasTable('trainers') && $this->hasColumn('bookings', 'trainer_id') && $this->hasColumn('trainers', 'name')) {
                $query->leftJoin('trainers', 'trainers.id', '=', 'bookings.trainer_id')
                    ->addSelect('trainers.name as trainer_name');
            }

            return $query
                ->orderByDesc($this->hasColumn('bookings', 'starts_at') ? 'bookings.starts_at' : 'bookings.id')
                ->limit(5)
                ->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function latestPayments(): array
    {
        if (!$this->hasTable('payments')) return [];

        try {
            $columns = ['id'];
            foreach (['status', 'amount', 'provider', 'currency', 'paid_at', 'created_at'] as $column) {
                if ($this->hasColumn('payments', $column)) $columns[] = $column;
            }

            return DB::table('payments')
                ->select($columns)
                ->orderByDesc($this->hasColumn('payments', 'created_at') ? 'created_at' : 'id')
                ->limit(5)
                ->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function latestActivity(): array
    {
        if (!$this->hasTable('activity_events')) return [];

        try {
            $columns = ['id'];
            foreach (['title', 'message', 'body', 'type', 'created_at'] as $column) {
                if ($this->hasColumn('activity_events', $column)) $columns[] = $column;
            }

            return DB::table('activity_events')
                ->select($columns)
                ->orderByDesc($this->hasColumn('activity_events', 'created_at') ? 'created_at' : 'id')
                ->limit(6)
                ->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function lowStock(): array
    {
        if (!$this->hasColumn('product_variants', 'stock')) return [];

        try {
            $query = DB::table('product_variants')
                ->select('product_variants.id', 'product_variants.name', 'product_variants.stock');

            if ($this->hasTable('products') && $this->hasColumn('product_variants', 'product_id') && $this->hasColumn('products', 'name')) {
                $query->leftJoin('products', 'products.id', '=', 'product_variants.product_id')
                    ->addSelect('products.name as product_name');
            }

            return $query
                ->where('product_variants.stock', '<=', 5)
                ->orderBy('product_variants.stock')
                ->limit(8)
                ->get()
                ->map(fn ($row) => (array) $row)
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    private function health(): array
    {
        $critical = [
            'users', 'trainers', 'programs', 'products', 'orders', 'bookings', 'reviews',
            'memberships', 'payments', 'product_variants', 'user_notifications', 'activity_events',
        ];

        $missingTables = [];
        foreach ($critical as $table) {
            if (!$this->hasTable($table)) $missingTables[] = $table;
        }

        $missingColumns = [];
        foreach ([
            'user_notifications' => ['message', 'body'],
            'orders' => ['status', 'total'],
            'bookings' => ['status', 'starts_at'],
            'product_variants' => ['stock', 'price'],
            'activity_events' => ['title', 'message'],
        ] as $table => $columns) {
            if (!$this->hasTable($table)) continue;
            foreach ($columns as $column) {
                if (!$this->hasColumn($table, $column)) {
                    $missingColumns[] = $table . '.' . $column;
                }
            }
        }

        return [
            'ok' => count($missingTables) === 0 && count($missingColumns) === 0,
            'missing_tables' => $missingTables,
            'missing_columns' => $missingColumns,
        ];
    }
}
