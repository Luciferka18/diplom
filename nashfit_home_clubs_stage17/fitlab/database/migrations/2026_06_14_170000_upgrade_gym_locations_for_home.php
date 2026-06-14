<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('gym_locations')) {
            Schema::create('gym_locations', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('address');
                $table->text('description')->nullable();
                $table->string('phone', 40)->nullable();
                $table->string('email')->nullable();
                $table->string('working_hours')->nullable();
                $table->string('weekend_hours')->nullable();
                $table->json('features')->nullable();
                $table->decimal('latitude', 10, 6)->nullable();
                $table->decimal('longitude', 10, 6)->nullable();
                $table->text('map_url')->nullable();
                $table->boolean('is_active')->default(true);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        } else {
            Schema::table('gym_locations', function (Blueprint $table) {
                if (!Schema::hasColumn('gym_locations', 'description')) $table->text('description')->nullable()->after('address');
                if (!Schema::hasColumn('gym_locations', 'phone')) $table->string('phone', 40)->nullable()->after('description');
                if (!Schema::hasColumn('gym_locations', 'email')) $table->string('email')->nullable()->after('phone');
                if (!Schema::hasColumn('gym_locations', 'working_hours')) $table->string('working_hours')->nullable()->after('email');
                if (!Schema::hasColumn('gym_locations', 'weekend_hours')) $table->string('weekend_hours')->nullable()->after('working_hours');
                if (!Schema::hasColumn('gym_locations', 'features')) $table->json('features')->nullable()->after('weekend_hours');
                if (!Schema::hasColumn('gym_locations', 'latitude')) $table->decimal('latitude', 10, 6)->nullable()->after('features');
                if (!Schema::hasColumn('gym_locations', 'longitude')) $table->decimal('longitude', 10, 6)->nullable()->after('latitude');
                if (!Schema::hasColumn('gym_locations', 'map_url')) $table->text('map_url')->nullable()->after('longitude');
                if (!Schema::hasColumn('gym_locations', 'is_active')) $table->boolean('is_active')->default(true)->after('map_url');
                if (!Schema::hasColumn('gym_locations', 'sort_order')) $table->unsignedSmallInteger('sort_order')->default(0)->after('is_active');
            });
        }

        $now = now();
        $locations = [
            [
                'name' => 'НашФит Центр',
                'address' => 'ул. Спортивная, 10',
                'description' => 'Флагманский клуб НашФит: большая силовая зона, кардио-линия, зона функционального тренинга и вводные тренировки для новичков.',
                'phone' => '+7 (999) 000-00-00',
                'email' => 'center@nashfit.ru',
                'working_hours' => 'Пн–Пт: 07:00–23:00',
                'weekend_hours' => 'Сб–Вс: 08:00–22:00',
                'features' => json_encode(['Силовая зона', 'Кардио', 'Функциональная зона', 'Групповые классы'], JSON_UNESCAPED_UNICODE),
                'latitude' => 55.755864,
                'longitude' => 37.617698,
                'map_url' => 'https://yandex.ru/map-widget/v1/?text=%D0%9D%D0%B0%D1%88%D0%A4%D0%B8%D1%82%20%D0%A6%D0%B5%D0%BD%D1%82%D1%80&z=14',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'НашФит Север',
                'address' => 'пр. Ленина, 45',
                'description' => 'Клуб для регулярных тренировок рядом с домом: тренажёры, свободные веса, зона растяжки и персональные занятия.',
                'phone' => '+7 (999) 100-20-30',
                'email' => 'north@nashfit.ru',
                'working_hours' => 'Ежедневно: 08:00–22:00',
                'weekend_hours' => 'Сб–Вс: 09:00–21:00',
                'features' => json_encode(['Свободные веса', 'Растяжка', 'Персональные тренировки', 'Душевые'], JSON_UNESCAPED_UNICODE),
                'latitude' => 55.790000,
                'longitude' => 37.560000,
                'map_url' => 'https://yandex.ru/map-widget/v1/?text=%D0%9D%D0%B0%D1%88%D0%A4%D0%B8%D1%82%20%D0%A1%D0%B5%D0%B2%D0%B5%D1%80&z=14',
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'name' => 'НашФит Юг',
                'address' => 'ул. Атлетов, 7',
                'description' => 'Компактный зал для силовых тренировок, восстановления и консультаций тренера по программе.',
                'phone' => '+7 (999) 300-40-50',
                'email' => 'south@nashfit.ru',
                'working_hours' => 'Пн–Пт: 07:30–22:30',
                'weekend_hours' => 'Сб–Вс: 09:00–21:00',
                'features' => json_encode(['Силовой зал', 'Кардио', 'Массажный ролл', 'Парковка'], JSON_UNESCAPED_UNICODE),
                'latitude' => 55.700000,
                'longitude' => 37.620000,
                'map_url' => 'https://yandex.ru/map-widget/v1/?text=%D0%9D%D0%B0%D1%88%D0%A4%D0%B8%D1%82%20%D0%AE%D0%B3&z=14',
                'is_active' => true,
                'sort_order' => 30,
            ],
        ];

        foreach ($locations as $location) {
            DB::table('gym_locations')->updateOrInsert(
                ['name' => $location['name']],
                array_merge($location, ['updated_at' => $now, 'created_at' => $now])
            );
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('gym_locations')) return;
        Schema::table('gym_locations', function (Blueprint $table) {
            foreach (['description', 'phone', 'email', 'working_hours', 'weekend_hours', 'features', 'latitude', 'longitude', 'map_url', 'is_active', 'sort_order'] as $column) {
                if (Schema::hasColumn('gym_locations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
