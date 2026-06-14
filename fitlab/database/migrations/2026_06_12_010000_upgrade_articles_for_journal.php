<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('articles')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE articles MODIFY status VARCHAR(32) NOT NULL DEFAULT 'draft'");
            }

            Schema::table('articles', function (Blueprint $table) {
                if (!Schema::hasColumn('articles', 'excerpt')) {
                    $table->text('excerpt')->nullable()->after('title');
                }
                if (!Schema::hasColumn('articles', 'cover_image_url')) {
                    $table->string('cover_image_url', 2048)->nullable()->after('excerpt');
                }
                if (!Schema::hasColumn('articles', 'category')) {
                    $table->string('category', 80)->nullable()->index()->after('cover_image_url');
                }
                if (!Schema::hasColumn('articles', 'is_featured')) {
                    $table->boolean('is_featured')->default(false)->index()->after('status');
                }
                if (!Schema::hasColumn('articles', 'is_trainer_article')) {
                    $table->boolean('is_trainer_article')->default(false)->index()->after('is_featured');
                }
                if (!Schema::hasColumn('articles', 'reading_time_minutes')) {
                    $table->unsignedSmallInteger('reading_time_minutes')->default(1)->after('is_trainer_article');
                }
                if (!Schema::hasColumn('articles', 'views_count')) {
                    $table->unsignedBigInteger('views_count')->default(0)->after('reading_time_minutes');
                }
                if (!Schema::hasColumn('articles', 'helpful_count')) {
                    $table->unsignedBigInteger('helpful_count')->default(0)->after('views_count');
                }
                if (!Schema::hasColumn('articles', 'rejection_reason')) {
                    $table->text('rejection_reason')->nullable()->after('helpful_count');
                }
            });

            $trainerUserIds = DB::table('users')->where('role', 'trainer')->pluck('id');
            if ($trainerUserIds->isNotEmpty()) {
                DB::table('articles')
                    ->whereIn('author_user_id', $trainerUserIds)
                    ->update(['is_trainer_article' => true]);
            }
        }

        if (!Schema::hasTable('article_favorites')) {
            Schema::create('article_favorites', function (Blueprint $table) {
                $table->id();
                $table->foreignId('article_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['article_id', 'user_id']);
            });
        }

        if (!Schema::hasTable('article_helpful_votes')) {
            Schema::create('article_helpful_votes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('article_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['article_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('article_helpful_votes');
        Schema::dropIfExists('article_favorites');

        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                $columns = [
                    'excerpt',
                    'cover_image_url',
                    'category',
                    'is_featured',
                    'is_trainer_article',
                    'reading_time_minutes',
                    'views_count',
                    'helpful_count',
                    'rejection_reason',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('articles', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
