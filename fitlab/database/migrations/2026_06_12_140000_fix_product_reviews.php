<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('reviews')) {
            return;
        }

        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'advantages')) {
                $table->text('advantages')->nullable();
            }
            if (!Schema::hasColumn('reviews', 'disadvantages')) {
                $table->text('disadvantages')->nullable();
            }
            if (!Schema::hasColumn('reviews', 'photos')) {
                $table->json('photos')->nullable();
            }
            if (!Schema::hasColumn('reviews', 'verified_purchase')) {
                $table->boolean('verified_purchase')->default(false)->index();
            }
            if (!Schema::hasColumn('reviews', 'trainer_recommendation')) {
                $table->boolean('trainer_recommendation')->default(false)->index();
            }
        });

        DB::table('reviews')
            ->where('reviewable_type', 'product')
            ->update(['reviewable_type' => \App\Models\Product::class]);

        DB::table('reviews')
            ->where('reviewable_type', 'trainer')
            ->update(['reviewable_type' => \App\Models\Trainer::class]);

        DB::table('reviews')
            ->where('reviewable_type', 'program')
            ->update(['reviewable_type' => \App\Models\Program::class]);
    }

    public function down(): void
    {
        // Data-preserving repair migration. No destructive rollback.
    }
};
