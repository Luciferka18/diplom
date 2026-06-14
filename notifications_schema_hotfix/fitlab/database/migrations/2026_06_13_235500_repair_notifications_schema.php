<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->repairUserNotifications();
        $this->repairActivityEvents();
    }

    private function repairUserNotifications(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            Schema::create('user_notifications', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->index();
                $table->unsignedBigInteger('actor_id')->nullable()->index();
                $table->string('type', 80)->default('system')->index();
                $table->string('title');
                $table->text('body')->nullable();
                $table->text('message')->nullable();
                $table->string('action_url')->nullable();
                $table->string('icon')->nullable();
                $table->json('data')->nullable();
                $table->json('payload')->nullable();
                $table->timestamp('read_at')->nullable()->index();
                $table->timestamps();
                $table->index(['user_id', 'created_at']);
                $table->index(['user_id', 'read_at']);
            });
            return;
        }

        $this->ensureColumns('user_notifications', [
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable()->index(),
            'actor_id' => fn (Blueprint $table) => $table->unsignedBigInteger('actor_id')->nullable()->index(),
            'type' => fn (Blueprint $table) => $table->string('type', 80)->default('system')->index(),
            'title' => fn (Blueprint $table) => $table->string('title')->default('Уведомление'),
            'body' => fn (Blueprint $table) => $table->text('body')->nullable(),
            'message' => fn (Blueprint $table) => $table->text('message')->nullable(),
            'action_url' => fn (Blueprint $table) => $table->string('action_url')->nullable(),
            'icon' => fn (Blueprint $table) => $table->string('icon')->nullable(),
            'data' => fn (Blueprint $table) => $table->json('data')->nullable(),
            'payload' => fn (Blueprint $table) => $table->json('payload')->nullable(),
            'read_at' => fn (Blueprint $table) => $table->timestamp('read_at')->nullable(),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);

        if (Schema::hasColumn('user_notifications', 'body') && Schema::hasColumn('user_notifications', 'message')) {
            DB::table('user_notifications')
                ->whereNull('message')
                ->whereNotNull('body')
                ->update(['message' => DB::raw('body')]);

            DB::table('user_notifications')
                ->whereNull('body')
                ->whereNotNull('message')
                ->update(['body' => DB::raw('message')]);
        }
    }

    private function repairActivityEvents(): void
    {
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
            return;
        }

        $this->ensureColumns('activity_events', [
            'user_id' => fn (Blueprint $table) => $table->unsignedBigInteger('user_id')->nullable()->index(),
            'actor_id' => fn (Blueprint $table) => $table->unsignedBigInteger('actor_id')->nullable()->index(),
            'audience' => fn (Blueprint $table) => $table->string('audience', 40)->default('user')->index(),
            'type' => fn (Blueprint $table) => $table->string('type', 80)->default('system')->index(),
            'title' => fn (Blueprint $table) => $table->string('title')->default('Событие'),
            'body' => fn (Blueprint $table) => $table->text('body')->nullable(),
            'description' => fn (Blueprint $table) => $table->text('description')->nullable(),
            'action_url' => fn (Blueprint $table) => $table->string('action_url')->nullable(),
            'subject_type' => fn (Blueprint $table) => $table->string('subject_type')->nullable(),
            'subject_id' => fn (Blueprint $table) => $table->unsignedBigInteger('subject_id')->nullable(),
            'data' => fn (Blueprint $table) => $table->json('data')->nullable(),
            'metadata' => fn (Blueprint $table) => $table->json('metadata')->nullable(),
            'created_at' => fn (Blueprint $table) => $table->timestamp('created_at')->nullable(),
            'updated_at' => fn (Blueprint $table) => $table->timestamp('updated_at')->nullable(),
        ]);

        if (Schema::hasColumn('activity_events', 'body') && Schema::hasColumn('activity_events', 'description')) {
            DB::table('activity_events')
                ->whereNull('description')
                ->whereNotNull('body')
                ->update(['description' => DB::raw('body')]);

            DB::table('activity_events')
                ->whereNull('body')
                ->whereNotNull('description')
                ->update(['body' => DB::raw('description')]);
        }
    }

    private function ensureColumns(string $table, array $columns): void
    {
        $missing = [];
        foreach ($columns as $column => $callback) {
            if (!Schema::hasColumn($table, $column)) {
                $missing[$column] = $callback;
            }
        }

        if (!$missing) {
            return;
        }

        Schema::table($table, function (Blueprint $table) use ($missing) {
            foreach ($missing as $callback) {
                $callback($table);
            }
        });
    }

    public function down(): void
    {
        // Safe repair migration: do not drop user data on rollback.
    }
};
