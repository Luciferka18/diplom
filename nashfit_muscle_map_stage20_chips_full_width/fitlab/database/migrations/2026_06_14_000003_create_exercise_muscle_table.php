<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_muscle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->foreignId('muscle_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['primary', 'secondary'])->default('primary');
            $table->timestamps();

            $table->unique(['exercise_id', 'muscle_id']);
            $table->index(['muscle_id', 'role']);
            $table->index(['exercise_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_muscle');
    }
};
