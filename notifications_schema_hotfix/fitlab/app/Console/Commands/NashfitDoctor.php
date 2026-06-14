<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class NashfitDoctor extends Command
{
    protected $signature = 'nashfit:doctor {--repair : Create missing tables/columns that are safe to add} {--short : Show only problems}';
    protected $description = 'Check and repair the NashFit schema after local patches without deleting data';

    private int $errors = 0;
    private int $fixed = 0;

    public function handle(): int
    {
        $this->line('');
        $this->info('NashFit project doctor');
        $this->line('Mode: '.($this->option('repair') ? 'check + repair' : 'check only'));
        $this->line('');

        try {
            DB::connection()->getPdo();
            $this->ok('Database connection');
        } catch (Throwable $e) {
            $this->fail('Database connection', $e->getMessage());
            return self::FAILURE;
        }

        if ($this->option('repair')) {
            $this->repairCoreSchema();
        }

        $this->checkTable('users', ['id', 'name', 'email']);
        $this->checkTable('trainers', ['id', 'name']);
        $this->checkTable('trainer_schedules', ['id', 'trainer_id']);
        $this->checkTable('trainer_services', ['id', 'trainer_id', 'name', 'price', 'duration_minutes']);
        $this->checkTable('programs', ['id', 'title']);
        $this->checkTable('program_progresses', ['id', 'user_id', 'program_id']);
        $this->checkTable('articles', ['id', 'title']);
        $this->checkTable('products', ['id', 'name', 'price', 'slug', 'is_active']);
        $this->checkTable('product_variants', ['id', 'product_id', 'name', 'sku', 'stock', 'created_at', 'updated_at']);
        $this->checkTable('shop_collections', ['id', 'name', 'slug']);
        $this->checkTable('shop_collection_product', ['id', 'shop_collection_id', 'product_id', 'sort_order', 'created_at', 'updated_at']);
        $this->checkTable('orders', ['id', 'user_id', 'status', 'subtotal', 'discount', 'delivery', 'delivery_method', 'total']);
        $this->checkTable('order_items', ['id', 'order_id', 'product_id', 'quantity', 'price']);
        $this->checkTable('reviews', ['id', 'user_id', 'rating', 'text', 'reviewable_type', 'reviewable_id', 'advantages', 'disadvantages', 'verified_purchase']);
        $this->checkTable('memberships', ['id', 'name', 'price', 'duration_months']);
        $this->checkTable('user_memberships', ['id', 'user_id', 'membership_id', 'status']);
        $this->checkTable('promo_codes', ['id', 'code', 'discount_type', 'discount_value']);
        $this->checkTable('promotions', ['id', 'name', 'discount_type', 'discount_value']);
        $this->checkTable('payments', ['id', 'status', 'amount', 'provider']);
        $this->checkTable('content_recommendations', ['id']);
        $this->checkTable('user_notifications', ['id', 'user_id', 'title', 'body', 'message', 'read_at']);
        $this->checkTable('activity_events', ['id', 'type', 'title', 'body', 'created_at']);

        $this->line('');
        if ($this->fixed > 0) {
            $this->info("Safe repairs applied: {$this->fixed}");
        }

        if ($this->errors > 0) {
            $this->warn("Problems found: {$this->errors}");
            $this->line('Run: php artisan nashfit:doctor --repair');
            return self::FAILURE;
        }

        $this->info('Schema looks ready for demo content.');
        return self::SUCCESS;
    }

    private function checkTable(string $table, array $columns = []): void
    {
        if (!Schema::hasTable($table)) {
            $this->fail("table {$table}", 'missing');
            return;
        }

        $missing = [];
        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                $missing[] = $column;
            }
        }

        if ($missing) {
            $this->fail("table {$table}", 'missing columns: '.implode(', ', $missing));
            return;
        }

        $this->ok("table {$table}");
    }

    private function ok(string $message): void
    {
        if (!$this->option('short')) {
            $this->line('<fg=green>OK</>   '.$message);
        }
    }

    private function fail(string $message, string $reason): void
    {
        $this->errors++;
        $this->line('<fg=red>FAIL</> '.$message.' — '.$reason);
    }

    private function repaired(string $message): void
    {
        $this->fixed++;
        $this->line('<fg=cyan>FIX</>  '.$message);
    }

    private function repairCoreSchema(): void
    {
        $this->repairNotifications();
        $this->repairShopTables();
        $this->repairOrderTables();
        $this->repairReviews();
    }

    private function repairNotifications(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            Schema::create('user_notifications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->string('type', 64)->default('info')->index();
                $table->string('title');
                $table->text('message')->nullable();
                $table->string('action_url')->nullable();
                $table->json('payload')->nullable();
                $table->timestamp('read_at')->nullable()->index();
                $table->timestamps();
            });
            $this->repaired('created user_notifications');
        }

        $this->ensureColumns('user_notifications', [
            'actor_id' => fn (Blueprint $table) => $table->unsignedBigInteger('actor_id')->nullable()->index(),
            'type' => fn (Blueprint $table) => $table->string('type', 80)->default('system')->index(),
            'title' => fn (Blueprint $table) => $table->string('title')->default('Уведомление'),
            'body' => fn (Blueprint $table) => $table->text('body')->nullable(),
            'message' => fn (Blueprint $table) => $table->text('message')->nullable(),
            'action_url' => fn (Blueprint $table) => $table->string('action_url')->nullable(),
            'icon' => fn (Blueprint $table) => $table->string('icon')->nullable(),
            'data' => fn (Blueprint $table) => $table->json('data')->nullable(),
            'payload' => fn (Blueprint $table) => $table->json('payload')->nullable(),
            'read_at' => fn (Blueprint $table) => $table->timestamp('read_at')->nullable()->index(),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);

        if (Schema::hasTable('activity_events') && Schema::hasColumn('user_notifications', 'body') && Schema::hasColumn('user_notifications', 'message')) {
            DB::table('user_notifications')->whereNull('message')->whereNotNull('body')->update(['message' => DB::raw('body')]);
            DB::table('user_notifications')->whereNull('body')->whereNotNull('message')->update(['body' => DB::raw('message')]);
        }

        if (!Schema::hasTable('activity_events')) {
            Schema::create('activity_events', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->unsignedBigInteger('actor_id')->nullable()->index();
                $table->string('audience', 40)->default('user')->index();
                $table->string('type', 80)->default('system')->index();
                $table->string('title');
                $table->text('body')->nullable();
                $table->text('description')->nullable();
                $table->string('action_url')->nullable();
                $table->string('subject_type')->nullable();
                $table->unsignedBigInteger('subject_id')->nullable();
                $table->json('data')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->index(['subject_type', 'subject_id']);
                $table->index(['audience', 'created_at']);
            });
            $this->repaired('created activity_events');
        }

        $this->ensureColumns('activity_events', [
            'audience' => fn (Blueprint $table) => $table->string('audience', 40)->default('user')->index(),
            'body' => fn (Blueprint $table) => $table->text('body')->nullable(),
            'description' => fn (Blueprint $table) => $table->text('description')->nullable(),
            'action_url' => fn (Blueprint $table) => $table->string('action_url')->nullable(),
            'data' => fn (Blueprint $table) => $table->json('data')->nullable(),
            'metadata' => fn (Blueprint $table) => $table->json('metadata')->nullable(),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);

        if (Schema::hasColumn('activity_events', 'body') && Schema::hasColumn('activity_events', 'description')) {
            DB::table('activity_events')->whereNull('description')->whereNotNull('body')->update(['description' => DB::raw('body')]);
            DB::table('activity_events')->whereNull('body')->whereNotNull('description')->update(['body' => DB::raw('description')]);
        }
    }

    private function repairShopTables(): void
    {
        if (Schema::hasTable('products') && !Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('product_id')->index();
                $table->string('name');
                $table->string('sku')->unique();
                $table->json('options')->nullable();
                $table->decimal('price', 10, 2)->nullable();
                $table->decimal('old_price', 10, 2)->nullable();
                $table->unsignedInteger('stock')->default(0);
                $table->string('image_url', 2048)->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
            $this->repaired('created product_variants');
        }

        $this->ensureColumns('product_variants', [
            'options' => fn (Blueprint $table) => $table->json('options')->nullable(),
            'old_price' => fn (Blueprint $table) => $table->decimal('old_price', 10, 2)->nullable(),
            'image_url' => fn (Blueprint $table) => $table->string('image_url', 2048)->nullable(),
            'is_active' => fn (Blueprint $table) => $table->boolean('is_active')->default(true)->index(),
            'sort_order' => fn (Blueprint $table) => $table->unsignedSmallInteger('sort_order')->default(0),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);

        if (!Schema::hasTable('shop_collections')) {
            Schema::create('shop_collections', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('subtitle', 500)->nullable();
                $table->string('image_url', 2048)->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
            $this->repaired('created shop_collections');
        }

        if (!Schema::hasTable('shop_collection_product')) {
            Schema::create('shop_collection_product', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('shop_collection_id')->index();
                $table->unsignedBigInteger('product_id')->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['shop_collection_id', 'product_id'], 'shop_collection_product_unique');
            });
            $this->repaired('created shop_collection_product');
        }

        $this->ensureColumns('shop_collection_product', [
            'sort_order' => fn (Blueprint $table) => $table->unsignedSmallInteger('sort_order')->default(0),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);
    }

    private function repairOrderTables(): void
    {
        $this->ensureColumns('orders', [
            'discount' => fn (Blueprint $table) => $table->unsignedBigInteger('discount')->default(0),
            'delivery_method' => fn (Blueprint $table) => $table->string('delivery_method', 32)->default('pickup'),
            'pickup_location' => fn (Blueprint $table) => $table->string('pickup_location')->nullable(),
            'promo_code_id' => fn (Blueprint $table) => $table->unsignedBigInteger('promo_code_id')->nullable()->index(),
            'promotion_id' => fn (Blueprint $table) => $table->unsignedBigInteger('promotion_id')->nullable()->index(),
        ]);

        $this->ensureColumns('order_items', [
            'product_variant_id' => fn (Blueprint $table) => $table->unsignedBigInteger('product_variant_id')->nullable()->index(),
            'variant_name' => fn (Blueprint $table) => $table->string('variant_name')->nullable(),
            'variant_options' => fn (Blueprint $table) => $table->json('variant_options')->nullable(),
            'sku' => fn (Blueprint $table) => $table->string('sku')->nullable(),
            'image_url' => fn (Blueprint $table) => $table->string('image_url', 2048)->nullable(),
        ]);

        $this->ensureColumns('cart_items', [
            'product_variant_id' => fn (Blueprint $table) => $table->unsignedBigInteger('product_variant_id')->nullable()->index(),
        ]);
    }

    private function repairReviews(): void
    {
        $this->ensureColumns('reviews', [
            'advantages' => fn (Blueprint $table) => $table->text('advantages')->nullable(),
            'disadvantages' => fn (Blueprint $table) => $table->text('disadvantages')->nullable(),
            'photos' => fn (Blueprint $table) => $table->json('photos')->nullable(),
            'verified_purchase' => fn (Blueprint $table) => $table->boolean('verified_purchase')->default(false)->index(),
            'trainer_recommendation' => fn (Blueprint $table) => $table->boolean('trainer_recommendation')->default(false)->index(),
        ]);
    }

    private function ensureColumns(string $table, array $columns): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        $missing = [];
        foreach ($columns as $column => $callback) {
            if (!Schema::hasColumn($table, $column)) {
                $missing[$column] = $callback;
            }
        }

        if (!$missing) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($missing) {
            foreach ($missing as $callback) {
                $callback($blueprint);
            }
        });

        $this->repaired('added columns to '.$table.': '.implode(', ', array_keys($missing)));
    }
}
