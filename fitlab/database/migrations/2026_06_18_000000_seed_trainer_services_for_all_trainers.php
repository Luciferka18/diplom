<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('trainers') || !Schema::hasTable('trainer_services')) {
            return;
        }

        $trainers = DB::table('trainers')->orderBy('id')->get(['id', 'name', 'specialization']);
        $now = now();

        foreach ($trainers as $index => $trainer) {
            foreach ($this->servicesFor($trainer, $index) as $service) {
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

    public function down(): void
    {
        if (!Schema::hasTable('trainer_services')) {
            return;
        }

        DB::table('trainer_services')
            ->whereNotNull('trainer_id')
            ->whereIn('slug', ['intro-diagnostics', 'personal-training', 'profile-format'])
            ->delete();
    }

    private function servicesFor(object $trainer, int $index): array
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
        $name = mb_strtolower(($trainer->name ?? '') . ' ' . ($trainer->specialization ?? ''));

        if (str_contains($name, 'алину') || str_contains($name, 'алина') || str_contains($name, 'пилатес') || str_contains($name, 'stretch')) {
            return ['name' => 'Пилатес и stretch', 'description' => 'Пилатес, растяжка, гибкость и восстановление после сидячего дня или нагрузок.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Stretch'];
        }

        if (str_contains($name, 'дмитрий') || str_contains($name, 'силов')) {
            return ['name' => 'Силовая тренировка', 'description' => 'Техника базовых упражнений, прогрессия нагрузки и безопасный набор силы.', 'duration_minutes' => 75, 'price' => 290000, 'badge' => 'Сила'];
        }

        if (str_contains($name, 'софия') || str_contains($name, 'mobility')) {
            return ['name' => 'Mobility и осанка', 'description' => 'Мягкая работа с мобильностью, осанкой, суставами и качеством движения.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Mobility'];
        }

        if (str_contains($name, 'павел') || str_contains($name, 'гипертроф')) {
            return ['name' => 'Гипертрофия и техника', 'description' => 'Тренировка на мышечный рост, технику упражнений и контроль прогресса.', 'duration_minutes' => 75, 'price' => 300000, 'badge' => 'Масса'];
        }

        if (str_contains($name, 'роман') || str_contains($name, 'cross')) {
            return ['name' => 'Cross-training', 'description' => 'Интервальная тренировка на общую физическую подготовку, выносливость и тонус.', 'duration_minutes' => 60, 'price' => 260000, 'badge' => 'Cross'];
        }

        if (str_contains($name, 'максим') || str_contains($name, 'бокс')) {
            return ['name' => 'Бокс и координация', 'description' => 'Удары, лапы, footwork, координация и энергозатратная тренировка без спарринга.', 'duration_minutes' => 60, 'price' => 270000, 'badge' => 'Бокс'];
        }

        if (str_contains($name, 'андрей') || str_contains($name, 'trx')) {
            return ['name' => 'TRX-функционал', 'description' => 'Работа с петлями TRX, корпусом, балансом и функциональной силой.', 'duration_minutes' => 60, 'price' => 260000, 'badge' => 'TRX'];
        }

        if (str_contains($name, 'ксения') || str_contains($name, 'начинающ')) {
            return ['name' => 'Фитнес-старт для новичков', 'description' => 'Безопасный вход в тренировки: техника, простая нагрузка и понятный план.', 'duration_minutes' => 60, 'price' => 220000, 'badge' => 'Новичкам'];
        }

        if (str_contains($name, 'игор') || str_contains($name, 'вынослив')) {
            return ['name' => 'Силовая выносливость', 'description' => 'Силовые круги, периодизация и устойчивый прогресс без выгорания.', 'duration_minutes' => 75, 'price' => 290000, 'badge' => 'Выносливость'];
        }

        if (str_contains($name, 'елена') || str_contains($name, 'йога')) {
            return ['name' => 'Йога и восстановление', 'description' => 'Йога, дыхание, расслабление и восстановление после тренировок или стресса.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Йога'];
        }

        if (str_contains($name, 'анна') || str_contains($name, 'функцион')) {
            return ['name' => 'Функциональная тренировка', 'description' => 'Интенсивная работа на выносливость, технику движений и снижение веса без перегруза.', 'duration_minutes' => 60, 'price' => 240000, 'badge' => 'Функционал'];
        }

        $fallback = [
            ['name' => 'Функциональная тренировка', 'description' => 'Интенсивная работа на выносливость, технику движений и снижение веса без перегруза.', 'duration_minutes' => 60, 'price' => 240000, 'badge' => 'Функционал'],
            ['name' => 'Силовая тренировка', 'description' => 'Техника базовых упражнений, прогрессия нагрузки и безопасный набор силы.', 'duration_minutes' => 75, 'price' => 290000, 'badge' => 'Сила'],
            ['name' => 'Йога и восстановление', 'description' => 'Йога, дыхание, расслабление и восстановление после тренировок или стресса.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Йога'],
        ];

        return $fallback[$index % count($fallback)];
    }
};
