<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_recommendations', function (Blueprint $table) {
            $table->id();
            $table->string('source_type', 32);
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('placement', 64)->default('default');
            $table->string('target_type', 32);
            $table->unsignedBigInteger('target_id');
            $table->string('headline')->nullable();
            $table->text('description')->nullable();
            $table->string('cta_label')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['source_type', 'source_id', 'placement'], 'content_recommendations_source_index');
            $table->index(['target_type', 'target_id'], 'content_recommendations_target_index');
            $table->unique(
                ['source_type', 'source_id', 'placement', 'target_type', 'target_id'],
                'content_recommendations_unique_target'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_recommendations');
    }
};
