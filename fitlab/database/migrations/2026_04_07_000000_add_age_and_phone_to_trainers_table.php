<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->unsignedTinyInteger('age')->nullable()->after('experience_years');
            $table->string('phone')->nullable()->after('instagram');
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn(['age', 'phone']);
        });
    }
};
