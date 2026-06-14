<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class NashfitQa extends Command
{
    protected $signature = 'nashfit:qa {--fix : Safely add missing columns/tables used by NashFit modules} {--seed : Run nashfit:seed-demo after repair}';

    protected $description = 'Run a safe QA checklist for NashFit modules: schema, demo data and key business entities.';

    private int $errors = 0;
    private int $warnings = 0;
    private array $rows = [];

    public function handle(): int
    {
        $this->info('NashFit QA started');
        $this->line('Mode: '.($this->option('fix') ? 'check + safe repair' : 'check only'));
        $this->newLine();

        if ($this->option('fix')) {
            $this->safeRepair();
            $this->newLine();
        }

        if ($this->option('seed')) {
            $this->line('Running demo seeder...');
            if (class_exists(\App\Console\Commands\SeedNashfitDemo::class) || $this->commandExists('nashfit:seed-demo')) {
                Artisan::call('nashfit:seed-demo', ['--force' => true]);
                $this->line(trim(Artisan::output()));
            } else {
                $this->warn('Command nashfit:seed-demo was not found. Skipping seeding.');
            }
            $this->newLine();
        }

        $this->checkSchema();
        $this->checkData();
        $this->checkBusinessScenarios();

        $this->newLine();
        $this->table(['Status', 'Area', 'Details'], $this->rows);
        $this->newLine();

        if ($this->errors > 0) {
            $this->error("QA finished with {$this->errors} problem(s) and {$this->warnings} warning(s).");
            $this->line('Run: php artisan nashfit:qa --fix');
            return self::FAILURE;
        }

        if ($this->warnings > 0) {
            $this->warn("QA finished without critical errors, but with {$this->warnings} warning(s).");
            return self::SUCCESS;
        }

        $this->info('QA finished successfully. Project looks consistent.');
        return self::SUCCESS;
    }

    private function checkSchema(): void
    {
        $this->section('Schema');

        $tables = [
            'users', 'trainers', 'trainer_schedules', 'trainer_services', 'gym_locations', 'bookings',
            'programs', 'workouts', 'program_progresses',
            'articles', 'categories', 'tags',
            'products', 'product_variants', 'shop_collections', 'shop_collection_product',
            'orders', 'order_items', 'reviews',
            'memberships', 'user_memberships', 'promo_codes', 'promotions', 'payments',
            'content_recommendations', 'user_notifications', 'activity_events',
        ];

        foreach ($tables as $table) {
            $this->assertTable($table);
        }

        $this->assertColumns('user_notifications', ['id', 'user_id', 'title', 'message', 'body', 'type', 'url', 'data', 'is_read', 'read_at', 'created_at', 'updated_at']);
        $this->assertColumns('activity_events', ['id', 'user_id', 'actor_id', 'type', 'title', 'message', 'description', 'data', 'subject_type', 'subject_id', 'created_at', 'updated_at']);
        $this->assertColumns('product_variants', ['id', 'product_id', 'name', 'sku', 'options', 'price', 'old_price', 'stock', 'image_url', 'is_active', 'sort_order', 'created_at', 'updated_at']);
        $this->assertColumns('shop_collection_product', ['shop_collection_id', 'product_id', 'sort_order', 'created_at', 'updated_at']);
        $this->assertColumns('orders', ['discount', 'delivery_method', 'delivery_price', 'recipient_name', 'phone', 'city', 'address_line', 'postal_code', 'comment']);
        $this->assertColumns('reviews', ['advantages', 'disadvantages', 'photos', 'is_verified_purchase', 'is_trainer_recommendation']);
        $this->assertColumns('workouts', ['week_number', 'day_number', 'duration_minutes', 'sort_order', 'is_generated']);
    }

    private function checkData(): void
    {
        $this->section('Demo data and content');

        $this->assertCount('users', 1, 'Users');
        $this->assertCount('trainers', 3, 'Trainers');
        $this->assertCount('gym_locations', 1, 'Gym locations');
        $this->assertCount('programs', 3, 'Training programs');
        $this->assertCount('articles', 5, 'Articles');
        $this->assertCount('products', 5, 'Products');
        $this->assertCount('product_variants', 5, 'Product variants');
        $this->assertCount('memberships', 3, 'Membership plans');
        $this->assertCount('trainer_services', 2, 'Trainer services');
        $this->assertCount('promo_codes', 1, 'Promo codes');

        if ($this->hasAll(['products', 'product_variants'])) {
            $count = DB::table('products')
                ->join('product_variants', 'products.id', '=', 'product_variants.product_id')
                ->where(function ($q) {
                    if (Schema::hasColumn('products', 'is_active')) $q->where('products.is_active', true);
                })
                ->where(function ($q) {
                    if (Schema::hasColumn('product_variants', 'is_active')) $q->where('product_variants.is_active', true);
                })
                ->where('product_variants.stock', '>', 0)
                ->distinct('products.id')
                ->count('products.id');
            $this->expect($count > 0, 'Shop stock', "active products with stock: {$count}", true);
        }

        if ($this->hasAll(['programs', 'workouts'])) {
            $programs = DB::table('programs')->count();
            $withPlans = DB::table('programs')
                ->whereExists(function ($q) {
                    $q->select(DB::raw(1))->from('workouts')->whereColumn('workouts.program_id', 'programs.id');
                })->count();
            $this->expect($programs === 0 || $withPlans > 0, 'Program plans', "programs with workouts: {$withPlans}/{$programs}", true);
        }
    }

    private function checkBusinessScenarios(): void
    {
        $this->section('Business scenarios');

        if ($this->hasAll(['bookings', 'trainer_services'])) {
            $bookingsWithService = Schema::hasColumn('bookings', 'trainer_service_id')
                ? DB::table('bookings')->whereNotNull('trainer_service_id')->count()
                : 0;
            $this->expect(Schema::hasColumn('bookings', 'trainer_service_id'), 'Booking services', 'bookings.trainer_service_id exists', false);
            $this->note('Booking demo data', "bookings linked to services: {$bookingsWithService}");
        }

        if ($this->hasAll(['payments'])) {
            $this->assertColumns('payments', ['id', 'status', 'provider', 'amount', 'currency', 'payable_type', 'payable_id']);
        }

        if ($this->hasAll(['content_recommendations'])) {
            $this->note('Recommendations', 'content_recommendations table is present');
        }

        if ($this->hasAll(['user_notifications'])) {
            $unread = Schema::hasColumn('user_notifications', 'is_read') ? DB::table('user_notifications')->where('is_read', false)->count() : 0;
            $this->note('Notifications', "unread notifications: {$unread}");
        }
    }

    private function safeRepair(): void
    {
        $this->section('Safe repair');

        $this->ensureUserNotifications();
        $this->ensureActivityEvents();
        $this->ensureProductVariants();
        $this->ensureShopCollectionPivot();
        $this->ensureOrdersColumns();
        $this->ensureReviewsColumns();
        $this->ensureWorkoutColumns();
        $this->ensureBookingColumns();

        $this->info('Safe repair completed. Existing data was not deleted.');
    }

    private function ensureUserNotifications(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            Schema::create('user_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
                $table->string('type', 80)->default('system')->index();
                $table->string('title')->nullable();
                $table->text('message')->nullable();
                $table->text('body')->nullable();
                $table->string('url')->nullable();
                $table->json('data')->nullable();
                $table->boolean('is_read')->default(false)->index();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'is_read']);
            });
            $this->fixed('user_notifications', 'table created');
            return;
        }

        Schema::table('user_notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('user_notifications', 'type')) $table->string('type', 80)->default('system')->index();
            if (!Schema::hasColumn('user_notifications', 'title')) $table->string('title')->nullable();
            if (!Schema::hasColumn('user_notifications', 'message')) $table->text('message')->nullable();
            if (!Schema::hasColumn('user_notifications', 'body')) $table->text('body')->nullable();
            if (!Schema::hasColumn('user_notifications', 'url')) $table->string('url')->nullable();
            if (!Schema::hasColumn('user_notifications', 'data')) $table->json('data')->nullable();
            if (!Schema::hasColumn('user_notifications', 'is_read')) $table->boolean('is_read')->default(false)->index();
            if (!Schema::hasColumn('user_notifications', 'read_at')) $table->timestamp('read_at')->nullable();
            if (!Schema::hasColumn('user_notifications', 'created_at')) $table->timestamp('created_at')->nullable();
            if (!Schema::hasColumn('user_notifications', 'updated_at')) $table->timestamp('updated_at')->nullable();
        });

        if (Schema::hasColumn('user_notifications', 'body') && Schema::hasColumn('user_notifications', 'message')) {
            DB::table('user_notifications')->whereNull('message')->whereNotNull('body')->update(['message' => DB::raw('body')]);
            DB::table('user_notifications')->whereNull('body')->whereNotNull('message')->update(['body' => DB::raw('message')]);
        }
        $this->fixed('user_notifications', 'columns repaired');
    }

    private function ensureActivityEvents(): void
    {
        if (!Schema::hasTable('activity_events')) {
            Schema::create('activity_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type', 80)->default('system')->index();
                $table->string('title')->nullable();
                $table->text('message')->nullable();
                $table->text('description')->nullable();
                $table->json('data')->nullable();
                $table->nullableMorphs('subject');
                $table->timestamps();
                $table->index(['user_id', 'created_at']);
            });
            $this->fixed('activity_events', 'table created');
            return;
        }
        Schema::table('activity_events', function (Blueprint $table) {
            if (!Schema::hasColumn('activity_events', 'user_id')) $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            if (!Schema::hasColumn('activity_events', 'actor_id')) $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            if (!Schema::hasColumn('activity_events', 'type')) $table->string('type', 80)->default('system')->index();
            if (!Schema::hasColumn('activity_events', 'title')) $table->string('title')->nullable();
            if (!Schema::hasColumn('activity_events', 'message')) $table->text('message')->nullable();
            if (!Schema::hasColumn('activity_events', 'description')) $table->text('description')->nullable();
            if (!Schema::hasColumn('activity_events', 'data')) $table->json('data')->nullable();
            if (!Schema::hasColumn('activity_events', 'subject_type')) $table->string('subject_type')->nullable();
            if (!Schema::hasColumn('activity_events', 'subject_id')) $table->unsignedBigInteger('subject_id')->nullable();
            if (!Schema::hasColumn('activity_events', 'created_at')) $table->timestamp('created_at')->nullable();
            if (!Schema::hasColumn('activity_events', 'updated_at')) $table->timestamp('updated_at')->nullable();
        });
        $this->fixed('activity_events', 'columns repaired');
    }

    private function ensureProductVariants(): void
    {
        if (!Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('sku')->unique();
                $table->json('options')->nullable();
                $table->decimal('price', 10, 2)->nullable();
                $table->decimal('old_price', 10, 2)->nullable();
                $table->unsignedInteger('stock')->default(0);
                $table->string('image_url')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
            $this->fixed('product_variants', 'table created');
            return;
        }
        Schema::table('product_variants', function (Blueprint $table) {
            if (!Schema::hasColumn('product_variants', 'options')) $table->json('options')->nullable();
            if (!Schema::hasColumn('product_variants', 'old_price')) $table->decimal('old_price', 10, 2)->nullable();
            if (!Schema::hasColumn('product_variants', 'stock')) $table->unsignedInteger('stock')->default(0);
            if (!Schema::hasColumn('product_variants', 'image_url')) $table->string('image_url')->nullable();
            if (!Schema::hasColumn('product_variants', 'is_active')) $table->boolean('is_active')->default(true)->index();
            if (!Schema::hasColumn('product_variants', 'sort_order')) $table->unsignedSmallInteger('sort_order')->default(0);
            if (!Schema::hasColumn('product_variants', 'created_at')) $table->timestamp('created_at')->nullable();
            if (!Schema::hasColumn('product_variants', 'updated_at')) $table->timestamp('updated_at')->nullable();
        });
        $this->fixed('product_variants', 'columns repaired');
    }

    private function ensureShopCollectionPivot(): void
    {
        if (!Schema::hasTable('shop_collection_product')) return;
        Schema::table('shop_collection_product', function (Blueprint $table) {
            if (!Schema::hasColumn('shop_collection_product', 'sort_order')) $table->unsignedSmallInteger('sort_order')->default(0);
            if (!Schema::hasColumn('shop_collection_product', 'created_at')) $table->timestamp('created_at')->nullable();
            if (!Schema::hasColumn('shop_collection_product', 'updated_at')) $table->timestamp('updated_at')->nullable();
        });
        $this->fixed('shop_collection_product', 'columns repaired');
    }

    private function ensureOrdersColumns(): void
    {
        if (!Schema::hasTable('orders')) return;
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'discount')) $table->decimal('discount', 10, 2)->default(0);
            if (!Schema::hasColumn('orders', 'delivery_method')) $table->string('delivery_method', 40)->nullable();
            if (!Schema::hasColumn('orders', 'delivery_price')) $table->decimal('delivery_price', 10, 2)->default(0);
            if (!Schema::hasColumn('orders', 'recipient_name')) $table->string('recipient_name')->nullable();
            if (!Schema::hasColumn('orders', 'phone')) $table->string('phone', 60)->nullable();
            if (!Schema::hasColumn('orders', 'city')) $table->string('city')->nullable();
            if (!Schema::hasColumn('orders', 'address_line')) $table->string('address_line')->nullable();
            if (!Schema::hasColumn('orders', 'postal_code')) $table->string('postal_code', 32)->nullable();
            if (!Schema::hasColumn('orders', 'comment')) $table->text('comment')->nullable();
        });
        $this->fixed('orders', 'shop checkout columns repaired');
    }

    private function ensureReviewsColumns(): void
    {
        if (!Schema::hasTable('reviews')) return;
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'advantages')) $table->text('advantages')->nullable();
            if (!Schema::hasColumn('reviews', 'disadvantages')) $table->text('disadvantages')->nullable();
            if (!Schema::hasColumn('reviews', 'photos')) $table->json('photos')->nullable();
            if (!Schema::hasColumn('reviews', 'is_verified_purchase')) $table->boolean('is_verified_purchase')->default(false)->index();
            if (!Schema::hasColumn('reviews', 'is_trainer_recommendation')) $table->boolean('is_trainer_recommendation')->default(false)->index();
        });
        $this->fixed('reviews', 'product review columns repaired');
    }

    private function ensureWorkoutColumns(): void
    {
        if (!Schema::hasTable('workouts')) return;
        Schema::table('workouts', function (Blueprint $table) {
            if (!Schema::hasColumn('workouts', 'week_number')) $table->unsignedSmallInteger('week_number')->nullable();
            if (!Schema::hasColumn('workouts', 'day_number')) $table->unsignedTinyInteger('day_number')->nullable();
            if (!Schema::hasColumn('workouts', 'duration_minutes')) $table->unsignedSmallInteger('duration_minutes')->nullable();
            if (!Schema::hasColumn('workouts', 'sort_order')) $table->unsignedInteger('sort_order')->default(0);
            if (!Schema::hasColumn('workouts', 'is_generated')) $table->boolean('is_generated')->default(false);
        });
        $this->fixed('workouts', 'program plan columns repaired');
    }

    private function ensureBookingColumns(): void
    {
        if (!Schema::hasTable('bookings')) return;
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'trainer_service_id')) $table->unsignedBigInteger('trainer_service_id')->nullable();
            if (!Schema::hasColumn('bookings', 'gym_location_id')) $table->unsignedBigInteger('gym_location_id')->nullable();
            if (!Schema::hasColumn('bookings', 'price')) $table->decimal('price', 10, 2)->nullable();
            if (!Schema::hasColumn('bookings', 'duration_minutes')) $table->unsignedSmallInteger('duration_minutes')->nullable();
        });
        $this->fixed('bookings', 'service/location columns repaired');
    }

    private function assertTable(string $table): void
    {
        $this->expect(Schema::hasTable($table), "table {$table}", Schema::hasTable($table) ? 'exists' : 'missing', false);
    }

    private function assertColumns(string $table, array $columns): void
    {
        if (!Schema::hasTable($table)) return;
        $missing = array_values(array_filter($columns, fn ($column) => !Schema::hasColumn($table, $column)));
        $this->expect(empty($missing), "columns {$table}", empty($missing) ? 'ok' : 'missing: '.implode(', ', $missing), false);
    }

    private function assertCount(string $table, int $minimum, string $label): void
    {
        if (!Schema::hasTable($table)) return;
        $count = DB::table($table)->count();
        $this->expect($count >= $minimum, $label, "count: {$count}, expected at least {$minimum}", true);
    }

    private function hasAll(array $tables): bool
    {
        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) return false;
        }
        return true;
    }

    private function expect(bool $condition, string $area, string $details, bool $warning = false): void
    {
        if ($condition) {
            $this->rows[] = ['OK', $area, $details];
            return;
        }
        if ($warning) {
            $this->warnings++;
            $this->rows[] = ['WARN', $area, $details];
        } else {
            $this->errors++;
            $this->rows[] = ['FAIL', $area, $details];
        }
    }

    private function note(string $area, string $details): void
    {
        $this->rows[] = ['INFO', $area, $details];
    }

    private function fixed(string $area, string $details): void
    {
        $this->rows[] = ['FIX', $area, $details];
    }

    private function section(string $title): void
    {
        $this->line("-- {$title} --");
    }

    private function commandExists(string $name): bool
    {
        return array_key_exists($name, Artisan::all());
    }
}
