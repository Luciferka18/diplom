<?php

namespace App\Services;

use App\Models\Program;
use App\Models\Workout;
use Illuminate\Support\Facades\Schema;

class ProgramPlanGenerator
{
    private const WORKOUTS_PER_WEEK = 3;

    public function ensure(Program $program): void
    {
        if (!Schema::hasTable('workouts') || !Schema::hasColumn('workouts', 'week_number')) {
            return;
        }

        $weeks = max(1, (int) ($program->duration_weeks ?: 4));
        $level = in_array($program->level, ['beginner', 'intermediate', 'advanced'], true)
            ? $program->level
            : 'beginner';

        Workout::query()
            ->where('program_id', $program->id)
            ->where('is_generated', true)
            ->where('week_number', '>', $weeks)
            ->delete();

        $unassigned = Workout::query()
            ->where('program_id', $program->id)
            ->whereNull('week_number')
            ->orderBy('id')
            ->get();

        foreach ($unassigned as $index => $workout) {
            $position = $index + 1;
            $week = min((int) ceil($position / self::WORKOUTS_PER_WEEK), $weeks);
            $day = (($position - 1) % self::WORKOUTS_PER_WEEK) + 1;

            $workout->update([
                'week_number' => $week,
                'day_number' => $day,
                'duration_minutes' => $workout->duration_minutes ?: $this->duration($level, $day, $week),
                'sort_order' => (($week - 1) * self::WORKOUTS_PER_WEEK) + $day,
                'is_generated' => false,
            ]);
        }

        $existing = Workout::query()
            ->where('program_id', $program->id)
            ->whereNotNull('week_number')
            ->get()
            ->keyBy(fn (Workout $workout) => $workout->week_number . ':' . $workout->day_number);

        for ($week = 1; $week <= $weeks; $week++) {
            for ($day = 1; $day <= self::WORKOUTS_PER_WEEK; $day++) {
                $key = $week . ':' . $day;
                $content = $this->content($program, $level, $week, $day, $weeks);

                if ($existing->has($key)) {
                    $workout = $existing->get($key);
                    $updates = [
                        'sort_order' => (($week - 1) * self::WORKOUTS_PER_WEEK) + $day,
                    ];

                    if ($workout->is_generated) {
                        $updates += [
                            'title' => $content['title'],
                            'description' => $content['description'],
                            'duration_minutes' => $content['duration_minutes'],
                        ];
                    }

                    $workout->update($updates);
                    continue;
                }

                Workout::create([
                    'program_id' => $program->id,
                    'week_number' => $week,
                    'day_number' => $day,
                    'duration_minutes' => $content['duration_minutes'],
                    'sort_order' => (($week - 1) * self::WORKOUTS_PER_WEEK) + $day,
                    'is_generated' => true,
                    'title' => $content['title'],
                    'description' => $content['description'],
                ]);
            }
        }
    }

    private function content(Program $program, string $level, int $week, int $day, int $totalWeeks): array
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
        $phase = $this->phase($week, $totalWeeks);

        return [
            'title' => "Неделя {$week}. {$baseTitle}",
            'description' => "{$baseDescription} Этап: {$phase}. Программа «{$program->title}». Выполняйте упражнения без боли и сохраняйте ровное дыхание.",
            'duration_minutes' => $this->duration($level, $day, $week),
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

    private function phase(int $week, int $totalWeeks): string
    {
        $ratio = $week / max(1, $totalWeeks);

        if ($ratio <= 0.25) {
            return 'адаптация и техника';
        }

        if ($ratio <= 0.75) {
            return 'постепенное увеличение нагрузки';
        }

        return 'закрепление результата';
    }
}
