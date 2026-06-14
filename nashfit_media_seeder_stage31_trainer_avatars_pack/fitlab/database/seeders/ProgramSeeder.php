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
        $tags = [
            ['name' => 'Похудение', 'slug' => 'fat-loss'],
            ['name' => 'Набор массы', 'slug' => 'muscle-gain'],
            ['name' => 'Выносливость', 'slug' => 'endurance'],
            ['name' => 'Гибкость', 'slug' => 'flexibility'],
            ['name' => 'Для новичков', 'slug' => 'beginner'],
            ['name' => 'Продвинутый', 'slug' => 'advanced'],
        ];

        foreach ($tags as $tagData) {
            Tag::firstOrCreate(['slug' => $tagData['slug']], $tagData);
        }

        $trainers = Trainer::all();
        $tagIds = Tag::pluck('id')->toArray();

        $programs = [
            [
                'title' => 'Функциональный старт',
                'description' => 'Программа для начинающих. Базовые упражнения для укрепления всех групп мышц. Подходит для тех, кто никогда не тренировался.',
                'level' => 'beginner',
                'duration_weeks' => 4,
                'price' => 0,
                'trainer_id' => $trainers->first()?->id ?? 1,
                'image_url' => '/seed-images/programs/funktsionalnyy-start.webp',
                'tags' => [1, 5],
            ],
            [
                'title' => 'Похудение за 8 недель',
                'description' => 'Интенсивная программа для снижения веса. Сочетание кардио и силовых упражнений.',
                'level' => 'intermediate',
                'duration_weeks' => 8,
                'price' => 0,
                'trainer_id' => $trainers->first()?->id ?? 1,
                'image_url' => '/seed-images/programs/pokhudenie-za-8-nedel.webp',
                'tags' => [1, 3],
            ],
            [
                'title' => 'Силовая база',
                'description' => 'Программа для набора мышечной массы. Работа с весами, базовые упражнения: присед, жим, тяга.',
                'level' => 'intermediate',
                'duration_weeks' => 12,
                'price' => 0,
                'trainer_id' => $trainers->skip(1)->first()?->id ?? 2,
                'image_url' => '/seed-images/programs/silovaya-baza.webp',
                'tags' => [2, 6],
            ],
            [
                'title' => 'Мощь и сила',
                'description' => 'Продвинутая программа для опытных атлетов. Увеличение силовых показателей в основных движениях.',
                'level' => 'advanced',
                'duration_weeks' => 16,
                'price' => 0,
                'trainer_id' => $trainers->skip(1)->first()?->id ?? 2,
                'image_url' => '/seed-images/programs/moshch-i-sila.webp',
                'tags' => [2, 6],
            ],
            [
                'title' => 'Йога для начинающих',
                'description' => 'Мягкое введение в мир йоги. Базовые асаны, дыхательные практики, медитация.',
                'level' => 'beginner',
                'duration_weeks' => 6,
                'price' => 0,
                'trainer_id' => $trainers->skip(2)->first()?->id ?? 3,
                'image_url' => '/seed-images/programs/yoga-dlya-nachinayushchikh.webp',
                'tags' => [4, 5],
            ],
            [
                'title' => 'Стретчинг плюс',
                'description' => 'Глубокая растяжка всего тела. Улучшение гибкости и подвижности суставов.',
                'level' => 'intermediate',
                'duration_weeks' => 8,
                'price' => 0,
                'trainer_id' => $trainers->skip(2)->first()?->id ?? 3,
                'image_url' => '/seed-images/programs/stretching-plus.webp',
                'tags' => [4, 3],
            ],
        ];

        foreach ($programs as $programData) {
            $tags = $programData['tags'] ?? [];
            unset($programData['tags']);

            $payload = $this->filterColumns('programs', $programData);

            $program = Program::updateOrCreate(
                ['title' => $programData['title']],
                $payload
            );

            if (!empty($tags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($tags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $program->tags()->syncWithoutDetaching($selectedTags);
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
