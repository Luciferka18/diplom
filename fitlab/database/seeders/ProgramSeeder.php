<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Tag;
use App\Models\Trainer;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Создаем теги
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
                'trainer_id' => $trainers->first()?->id ?? 1,
                'title' => 'Функциональный старт',
                'description' => 'Программа для начинающих. Базовые упражнения для укрепления всех групп мышц. Подходит для тех, кто никогда не тренировался.',
                'level' => 'beginner',
                'duration_weeks' => 4,
                'price' => 3900,
                'tags' => [1, 5],
            ],
            [
                'trainer_id' => $trainers->first()?->id ?? 1,
                'title' => 'Похудение за 8 недель',
                'description' => 'Интенсивная программа для снижения веса. Сочетание кардио и силовых упражнений.',
                'level' => 'intermediate',
                'duration_weeks' => 8,
                'price' => 7900,
                'tags' => [1, 3],
            ],
            [
                'trainer_id' => $trainers->skip(1)->first()?->id ?? 2,
                'title' => 'Силовая база',
                'description' => 'Программа для набора мышечной массы. Работа с весами, базовые упражнения: присед, жим, тяга.',
                'level' => 'intermediate',
                'duration_weeks' => 12,
                'price' => 12900,
                'tags' => [2, 6],
            ],
            [
                'trainer_id' => $trainers->skip(1)->first()?->id ?? 2,
                'title' => 'Мощь и сила',
                'description' => 'Продвинутая программа для опытных атлетов. Увеличение силовых показателей в основных движениях.',
                'level' => 'advanced',
                'duration_weeks' => 16,
                'price' => 18900,
                'tags' => [2, 6],
            ],
            [
                'trainer_id' => $trainers->skip(2)->first()?->id ?? 3,
                'title' => 'Йога для начинающих',
                'description' => 'Мягкое введение в мир йоги. Базовые асаны, дыхательные практики, медитация.',
                'level' => 'beginner',
                'duration_weeks' => 6,
                'price' => 5900,
                'tags' => [4, 5],
            ],
            [
                'trainer_id' => $trainers->skip(2)->first()?->id ?? 3,
                'title' => 'Стретчинг плюс',
                'description' => 'Глубокая растяжка всего тела. Улучшение гибкости и подвижности суставов.',
                'level' => 'intermediate',
                'duration_weeks' => 8,
                'price' => 7200,
                'tags' => [4, 3],
            ],
        ];

        foreach ($programs as $programData) {
            $tags = $programData['tags'] ?? [];
            unset($programData['tags']);
            
            $program = Program::create($programData);
            if (!empty($tags)) {
                $program->tags()->attach($tags);
            }
        }
    }
}
