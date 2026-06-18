<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Tag;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        Program::query()->delete();

        $tags = [
            ['name' => 'Похудение', 'slug' => 'fat-loss'],
            ['name' => 'Набор массы', 'slug' => 'muscle-gain'],
            ['name' => 'Выносливость', 'slug' => 'endurance'],
            ['name' => 'Гибкость', 'slug' => 'flexibility'],
            ['name' => 'Для новичков', 'slug' => 'beginner'],
            ['name' => 'Продвинутый', 'slug' => 'advanced'],
            ['name' => 'Восстановление', 'slug' => 'recovery'],
        ];

        foreach ($tags as $tagData) {
            Tag::firstOrCreate(['slug' => $tagData['slug']], $tagData);
        }

        $trainers = Trainer::query()->get()->values();
        $tagIds = Tag::pluck('id')->toArray();

        $programs = [
            [
                'title' => 'Функциональный старт',
                'description' => 'Четырёхнедельный вход в тренировки без перегруза: базовые движения, лёгкие круги, кор и привычка заниматься регулярно.',
                'level' => 'beginner',
                'duration_weeks' => 4,
                'price' => 0,
                'trainer_id' => $trainers->get(0)?->id,
                'image_url' => '/seed-images/programs/funktsionalnyy-start.png',
                'tags' => [1, 5],
            ],
            [
                'title' => 'Сильное тело',
                'description' => 'Силовая программа на восемь недель: ноги, спина, грудь, плечи и корпус. Внутри — прогрессия нагрузки и понятная структура.',
                'level' => 'intermediate',
                'duration_weeks' => 8,
                'price' => 0,
                'trainer_id' => $trainers->get(1)?->id,
                'image_url' => '/seed-images/programs/moshch-i-sila.png',
                'tags' => [2, 6],
            ],
            [
                'title' => 'Основа набора массы',
                'description' => 'Десятинедельный план гипертрофии для тех, кто хочет системно набрать мышечную массу: объём, техника и восстановление.',
                'level' => 'intermediate',
                'duration_weeks' => 10,
                'price' => 0,
                'trainer_id' => $trainers->get(3)?->id,
                'image_url' => '/seed-images/programs/silovaya-baza.png',
                'tags' => [2, 6],
            ],
            [
                'title' => 'Похудение за 8 недель',
                'description' => 'Комбинация кардио, силовых тренировок и умеренного дефицита калорий. Подходит для тех, кто хочет устойчивого снижения веса.',
                'level' => 'intermediate',
                'duration_weeks' => 8,
                'price' => 0,
                'trainer_id' => $trainers->get(0)?->id,
                'image_url' => '/seed-images/programs/pokhudenie-za-8-nedel.png',
                'tags' => [1, 3],
            ],
            [
                'title' => 'Йога для начинающих',
                'description' => 'Мягкое введение в практику: дыхание, базовые асаны, подвижность и спокойная работа с телом без спешки.',
                'level' => 'beginner',
                'duration_weeks' => 6,
                'price' => 0,
                'trainer_id' => $trainers->last()?->id,
                'image_url' => '/seed-images/programs/yoga-dlya-nachinayushchikh.png',
                'tags' => [4, 5, 7],
            ],
            [
                'title' => 'Стретчинг плюс',
                'description' => 'Улучшение гибкости, подвижности суставов и восстановления после офисной нагрузки. Отличный вариант для общего самочувствия.',
                'level' => 'beginner',
                'duration_weeks' => 6,
                'price' => 0,
                'trainer_id' => $trainers->get(4)?->id,
                'image_url' => '/seed-images/programs/stretching-plus.png',
                'tags' => [4, 5, 7],
            ],
        ];

        foreach ($programs as $programData) {
            $programTags = $programData['tags'] ?? [];
            unset($programData['tags']);

            $payload = $this->filterColumns('programs', $programData);
            $program = Program::updateOrCreate(['title' => $programData['title']], $payload);

            if (!empty($programTags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($programTags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $program->tags()->sync($selectedTags);
                }
            }
        }
    }

    private function filterColumns(string $table, array $payload): array
    {
        return collect($payload)
            ->filter(fn ($value, $key) => Schema::hasColumn($table, $key))
            ->all();
    }
}
