<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        DB::table('programs')->update(['price' => 0]);

        $needsWeek = !Schema::hasColumn('workouts', 'week_number');
        $needsDay = !Schema::hasColumn('workouts', 'day_number');
        $needsDuration = !Schema::hasColumn('workouts', 'duration_minutes');
        $needsSort = !Schema::hasColumn('workouts', 'sort_order');
        $needsGenerated = !Schema::hasColumn('workouts', 'is_generated');

        if ($needsWeek || $needsDay || $needsDuration || $needsSort || $needsGenerated) {
            Schema::table('workouts', function (Blueprint $table) use ($needsWeek, $needsDay, $needsDuration, $needsSort, $needsGenerated) {
                if ($needsWeek) {
                    $table->unsignedSmallInteger('week_number')->nullable()->after('program_id');
                }
                if ($needsDay) {
                    $table->unsignedTinyInteger('day_number')->nullable()->after('week_number');
                }
                if ($needsDuration) {
                    $table->unsignedSmallInteger('duration_minutes')->nullable()->after('day_number');
                }
                if ($needsSort) {
                    $table->unsignedInteger('sort_order')->default(0)->after('duration_minutes');
                }
                if ($needsGenerated) {
                    $table->boolean('is_generated')->default(false)->after('sort_order');
                }
            });
        }

        $programs = DB::table('programs')->orderBy('id')->get();
        $now = now();

        foreach ($programs as $program) {
            $weeks = max(1, (int) ($program->duration_weeks ?: 4));
            $level = in_array($program->level, ['beginner', 'intermediate', 'advanced'], true)
                ? $program->level
                : 'beginner';

            $unassigned = DB::table('workouts')
                ->where('program_id', $program->id)
                ->whereNull('week_number')
                ->orderBy('id')
                ->get();

            foreach ($unassigned as $index => $workout) {
                $position = $index + 1;
                $week = min((int) ceil($position / 3), $weeks);
                $day = (($position - 1) % 3) + 1;

                DB::table('workouts')->where('id', $workout->id)->update([
                    'week_number' => $week,
                    'day_number' => $day,
                    'duration_minutes' => $workout->duration_minutes ?: $this->duration($level, $day, $week),
                    'sort_order' => (($week - 1) * 3) + $day,
                    'is_generated' => false,
                    'updated_at' => $now,
                ]);
            }

            $slots = DB::table('workouts')
                ->where('program_id', $program->id)
                ->whereNotNull('week_number')
                ->get()
                ->mapWithKeys(fn ($workout) => [($workout->week_number . ':' . $workout->day_number) => true]);

            for ($week = 1; $week <= $weeks; $week++) {
                for ($day = 1; $day <= 3; $day++) {
                    $key = $week . ':' . $day;
                    if ($slots->has($key)) {
                        continue;
                    }

                    [$title, $description] = $this->content($program->title, $level, $week, $day, $weeks);

                    DB::table('workouts')->insert([
                        'program_id' => $program->id,
                        'week_number' => $week,
                        'day_number' => $day,
                        'duration_minutes' => $this->duration($level, $day, $week),
                        'sort_order' => (($week - 1) * 3) + $day,
                        'is_generated' => true,
                        'title' => $title,
                        'description' => $description,
                        'video_path' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('workouts', 'is_generated')) {
            DB::table('workouts')->where('is_generated', true)->delete();
        }

        $columns = collect(['week_number', 'day_number', 'duration_minutes', 'sort_order', 'is_generated'])
            ->filter(fn (string $column) => Schema::hasColumn('workouts', $column))
            ->all();

        if ($columns) {
            Schema::table('workouts', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }

    private function content(string $programTitle, string $level, int $week, int $day, int $totalWeeks): array
    {
        $templates = [
            'beginner' => [
                1 => ['Техника и разминка', 'Спокойная тренировка на освоение техники, суставную разминку и базовые движения.'],
                2 => ['Силовая база', 'Упражнения на ноги, спину, грудь и мышцы кора в безопасном темпе.'],
                3 => ['Лёгкое кардио и мобильность', 'Низкоударное кардио, растяжка и восстановление после силовой нагрузки.'],
            ],
            'intermediate' => [
                1 => ['Функциональная сила', 'Круговая силовая работа на основные группы мышц с контролем техники.'],
                2 => ['Интервальная выносливость', 'Интервальные блоки средней интенсивности для развития выносливости.'],
                3 => ['Кор, баланс и мобильность', 'Укрепление кора, координация, баланс и восстановительная растяжка.'],
            ],
            'advanced' => [
                1 => ['Силовой комплекс', 'Интенсивная силовая сессия с прогрессией нагрузки и сложными связками.'],
                2 => ['Высокоинтенсивная работа', 'Темповая интервальная тренировка для мощности и общей выносливости.'],
                3 => ['Контроль, кор и восстановление', 'Стабилизация, работа с кором, мобильность и активное восстановление.'],
            ],
        ];

        [$baseTitle, $baseDescription] = $templates[$level][$day];
        $ratio = $week / max(1, $totalWeeks);
        $phase = $ratio <= 0.25
            ? 'адаптация и техника'
            : ($ratio <= 0.75 ? 'постепенное увеличение нагрузки' : 'закрепление результата');

        return [
            "Неделя {$week}. {$baseTitle}",
            "{$baseDescription} Этап: {$phase}. Программа «{$programTitle}». Выполняйте упражнения без боли и сохраняйте ровное дыхание.",
        ];
    }

    private function duration(string $level, int $day, int $week): int
    {
        $base = [
            'beginner' => [1 => 30, 2 => 35, 3 => 25],
            'intermediate' => [1 => 45, 2 => 40, 3 => 35],
            'advanced' => [1 => 60, 2 => 50, 3 => 40],
        ][$level][$day];

        return min($base + (($week - 1) * 2), $base + 12);
    }
};
