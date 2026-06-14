<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

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
    echo "Created table: user_notifications\n";
} else {
    echo "Table already exists: user_notifications\n";
}

if (!Schema::hasTable('activity_events')) {
    Schema::create('activity_events', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
        $table->string('audience')->default('user')->index();
        $table->string('type')->default('system')->index();
        $table->string('title');
        $table->text('body')->nullable();
        $table->string('action_url')->nullable();
        $table->string('subject_type')->nullable();
        $table->unsignedBigInteger('subject_id')->nullable();
        $table->json('data')->nullable();
        $table->timestamps();
        $table->index(['subject_type', 'subject_id']);
        $table->index(['user_id', 'created_at']);
        $table->index(['audience', 'created_at']);
    });
    echo "Created table: activity_events\n";
} else {
    echo "Table already exists: activity_events\n";
}

echo "Notification tables are ready.\n";
