<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('level')->nullable();
            $table->unsignedTinyInteger('duration_weeks')->nullable();
            $table->string('focus')->nullable();
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->text('muscle_groups')->nullable(); // какие группы мышц развиваем
            $table->longText('diet_recommendations')->nullable(); // рекомендации по питанию
            $table->longText('supplement_recommendations')->nullable(); // рекомендуемый спортпит
            $table->longText('workout_plan')->nullable(); // общий план тренировок
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};


