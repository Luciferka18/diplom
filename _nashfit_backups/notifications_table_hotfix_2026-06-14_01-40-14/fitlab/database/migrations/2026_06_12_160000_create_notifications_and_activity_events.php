<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('user_notifications')) {
            Schema::create('user_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('type')->default('system')->index();
                $table->string('title');
                $table->text('body')->nullable();
                $table->string('action_url')->nullable();
                $table->string('icon')->nullable();
                $table->json('data')->nullable();
                $table->timestamp('read_at')->nullable()->index();
                $table->timestamps();
                $table->index(['user_id', 'created_at']);
                $table->index(['user_id', 'read_at']);
            });
        }

        if (!Schema::hasTable('activity_events')) {
            Schema::create('activity_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('audience')->default('user')->index(); // user, trainer, admin
                $table->string('type')->default('system')->index();
                $table->string('title');
                $table->text('body')->nullable();
                $table->string('action_url')->nullable();
                $table->morphs('subject');
                $table->json('data')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'created_at']);
                $table->index(['audience', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_events');
        Schema::dropIfExists('user_notifications');
    }
};
