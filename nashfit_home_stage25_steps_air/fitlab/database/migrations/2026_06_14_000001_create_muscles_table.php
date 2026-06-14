<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('muscles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('latin_name')->nullable();
            $table->text('description')->nullable();
            $table->text('function')->nullable();
            $table->text('how_to_grow')->nullable();
            $table->enum('body_side', ['front', 'back', 'both'])->default('front');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('muscles');
    }
};
