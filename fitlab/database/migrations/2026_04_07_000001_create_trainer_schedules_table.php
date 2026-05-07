<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trainer_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained('gym_locations')->nullOnDelete();

            // День недели: 0=Воскресенье, 1=Понедельник, ..., 6=Суббота
            $table->unsignedTinyInteger('day_of_week');

            // Время начала и окончания работы
            $table->time('start_time');
            $table->time('end_time');

            // Длительность одного слота в минутах (по умолчанию 60)
            $table->unsignedSmallInteger('slot_duration_minutes')->default(60);

            $table->timestamps();

            $table->unique(['trainer_id', 'day_of_week', 'start_time', 'end_time'], 'tr_schedule_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_schedules');
    }
};
