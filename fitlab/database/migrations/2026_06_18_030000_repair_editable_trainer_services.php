<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $this->ensureServicesTable();
        $this->ensureBookingsColumns();
        $this->seedServicesForAllTrainers();
        $this->seedSchedulesForAllTrainers();
    }

    public function down(): void
    {
        // Не откатываем пользовательские услуги: тренеры и администратор могли уже их изменить через интерфейс.
    }

    private function ensureServicesTable(): void
    {
        if (!Schema::hasTable('trainer_services')) {
            Schema::create('trainer_services', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('trainer_id')->nullable()->index();
                $table->string('name');
                $table->string('slug');
                $table->text('description')->nullable();
                $table->unsignedInteger('duration_minutes')->default(60);
                $table->unsignedBigInteger('price')->default(0);
                $table->string('badge')->nullable();
                $table->boolean('is_intro')->default(false)->index();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['trainer_id', 'slug']);
            });
            return;
        }

        $columns = [
            'trainer_id' => fn (Blueprint $table) => $table->unsignedBigInteger('trainer_id')->nullable()->index(),
            'name' => fn (Blueprint $table) => $table->string('name')->default('Услуга'),
            'slug' => fn (Blueprint $table) => $table->string('slug')->default('service'),
            'description' => fn (Blueprint $table) => $table->text('description')->nullable(),
            'duration_minutes' => fn (Blueprint $table) => $table->unsignedInteger('duration_minutes')->default(60),
            'price' => fn (Blueprint $table) => $table->unsignedBigInteger('price')->default(0),
            'badge' => fn (Blueprint $table) => $table->string('badge')->nullable(),
            'is_intro' => fn (Blueprint $table) => $table->boolean('is_intro')->default(false)->index(),
            'is_active' => fn (Blueprint $table) => $table->boolean('is_active')->default(true)->index(),
            'sort_order' => fn (Blueprint $table) => $table->unsignedInteger('sort_order')->default(0),
        ];

        foreach ($columns as $column => $callback) {
            if (!Schema::hasColumn('trainer_services', $column)) {
                Schema::table('trainer_services', $callback);
            }
        }

        if (!Schema::hasColumn('trainer_services', 'created_at')) {
            Schema::table('trainer_services', fn (Blueprint $table) => $table->timestamps());
        }
    }

    private function ensureBookingsColumns(): void
    {
        if (!Schema::hasTable('bookings')) {
            return;
        }

        if (!Schema::hasColumn('bookings', 'trainer_service_id')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->unsignedBigInteger('trainer_service_id')->nullable()->after('trainer_id')->index();
            });
        }
    }

    private function seedServicesForAllTrainers(): void
    {
        if (!Schema::hasTable('trainers') || !Schema::hasTable('trainer_services')) {
            return;
        }

        $now = now();
        $trainers = DB::table('trainers')->orderBy('id')->get(['id', 'name', 'specialization']);

        foreach ($trainers as $index => $trainer) {
            foreach ($this->defaultsFor($trainer, $index) as $service) {
                DB::table('trainer_services')->updateOrInsert(
                    [
                        'trainer_id' => $trainer->id,
                        'slug' => $service['slug'],
                    ],
                    [
                        'name' => $service['name'],
                        'description' => $service['description'],
                        'duration_minutes' => $service['duration_minutes'],
                        'price' => $service['price'],
                        'badge' => $service['badge'],
                        'is_intro' => $service['is_intro'],
                        'is_active' => true,
                        'sort_order' => $service['sort_order'],
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
            }
        }
    }

    private function seedSchedulesForAllTrainers(): void
    {
        if (!Schema::hasTable('trainers') || !Schema::hasTable('trainer_schedules')) {
            return;
        }

        $now = now();
        $trainers = DB::table('trainers')->orderBy('id')->get(['id']);
        $locationIds = Schema::hasTable('gym_locations')
            ? DB::table('gym_locations')->orderBy('id')->pluck('id')->values()->all()
            : [];

        $templates = [
            [[1, '09:00', '18:00'], [3, '09:00', '18:00'], [5, '10:00', '19:00'], [6, '10:00', '15:00']],
            [[2, '08:00', '17:00'], [4, '08:00', '17:00'], [5, '13:00', '21:00'], [6, '10:00', '16:00']],
            [[1, '12:00', '20:00'], [2, '12:00', '20:00'], [4, '12:00', '20:00'], [6, '09:00', '14:00']],
            [[1, '16:00', '21:00'], [3, '10:00', '19:00'], [5, '09:00', '15:00'], [6, '11:00', '16:00']],
            [[2, '10:00', '18:00'], [3, '15:00', '21:00'], [4, '10:00', '18:00'], [6, '10:00', '14:00']],
        ];

        foreach ($trainers as $index => $trainer) {
            $hasSchedule = DB::table('trainer_schedules')->where('trainer_id', $trainer->id)->exists();
            if ($hasSchedule) {
                continue;
            }

            foreach ($templates[$index % count($templates)] as $offset => [$day, $start, $end]) {
                $locationId = count($locationIds) ? $locationIds[($index + $offset) % count($locationIds)] : null;
                DB::table('trainer_schedules')->updateOrInsert(
                    [
                        'trainer_id' => $trainer->id,
                        'day_of_week' => $day,
                        'start_time' => $start,
                        'end_time' => $end,
                    ],
                    [
                        'location_id' => $locationId,
                        'slot_duration_minutes' => 60,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
            }
        }
    }

    private function defaultsFor(object $trainer, int $index): array
    {
        $profile = $this->profileService($trainer, $index);

        return [
            [
                'name' => 'Вводная диагностика',
                'slug' => 'intro-diagnostics',
                'description' => 'Знакомство с тренером, разбор цели, ограничений и первичный план занятий.',
                'duration_minutes' => 30,
                'price' => 0,
                'badge' => 'Старт',
                'is_intro' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Персональная тренировка',
                'slug' => 'personal-training',
                'description' => 'Индивидуальное занятие с контролем техники, подбором нагрузки и рекомендациями.',
                'duration_minutes' => 60,
                'price' => 250000,
                'badge' => '1 на 1',
                'is_intro' => false,
                'sort_order' => 20,
            ],
            array_merge($profile, [
                'slug' => 'profile-format',
                'is_intro' => false,
                'sort_order' => 30,
            ]),
        ];
    }

    private function profileService(object $trainer, int $index): array
    {
        $text = mb_strtolower(($trainer->name ?? '') . ' ' . ($trainer->specialization ?? ''));

        $variants = [
            ['функцион', 'Функциональная тренировка', 'Интенсивная работа на выносливость, технику движений и снижение веса без перегруза.', 60, 240000, 'Функционал'],
            ['сил', 'Силовая тренировка', 'Техника базовых упражнений, прогрессия нагрузки и безопасный набор силы.', 75, 290000, 'Сила'],
            ['йог', 'Йога и восстановление', 'Йога, дыхание, расслабление и восстановление после тренировок или стресса.', 60, 230000, 'Йога'],
            ['пилат', 'Пилатес и stretch', 'Пилатес, растяжка, гибкость и восстановление после сидячего дня или нагрузок.', 60, 230000, 'Stretch'],
            ['бокс', 'Бокс и координация', 'Удары, лапы, footwork, координация и энергозатратная тренировка без спарринга.', 60, 270000, 'Бокс'],
            ['trx', 'TRX-функционал', 'Работа с петлями TRX, корпусом, балансом и функциональной силой.', 60, 260000, 'TRX'],
            ['мобил', 'Mobility и осанка', 'Мягкая работа с мобильностью, осанкой, суставами и качеством движения.', 60, 230000, 'Mobility'],
        ];

        foreach ($variants as [$needle, $name, $description, $duration, $price, $badge]) {
            if (Str::contains($text, $needle)) {
                return compact('name', 'description') + ['duration_minutes' => $duration, 'price' => $price, 'badge' => $badge];
            }
        }

        [$needle, $name, $description, $duration, $price, $badge] = $variants[$index % count($variants)];
        return compact('name', 'description') + ['duration_minutes' => $duration, 'price' => $price, 'badge' => $badge];
    }
};
