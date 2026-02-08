<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\GymLocation;
use App\Models\Product;
use App\Models\Program;
use App\Models\Review;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FitlabSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin1@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('123123123'),
                'is_admin' => true,
            ]
        );
        Trainer::insert([
            [
                'name' => 'Иван Стальной',
                'specialization' => 'Силовой тренинг',
                'experience_years' => 7,
                'bio' => 'Помогает клиентам становиться сильнее и увереннее в себе.',
                'photo_url' => null,
                'instagram' => '@ivan_strong',
            ],
            [
                'name' => 'Анна Форма',
                'specialization' => 'Функциональный тренинг, похудение',
                'experience_years' => 5,
                'bio' => 'Сочетает тренировки с грамотным подходом к питанию.',
                'photo_url' => null,
                'instagram' => '@anna_fit',
            ],
        ]);

        Program::insert([
            [
                'title' => 'Старт в фитнесе за 4 недели',
                'level' => 'Начальный',
                'duration_weeks' => 4,
                'focus' => 'общая подготовка',
                'slug' => 'start-v-fitnese',
                'short_description' => 'Онлайн-программа для тех, кто только начинает.',
                'description' => 'Пошаговые тренировки дома или в зале, без сложного оборудования.',
                'muscle_groups' => 'Все тело, акцент на спину и ягодицы.',
                'diet_recommendations' => 'Слегка пониженный дефицит калорий, упор на белок и овощи.',
                'supplement_recommendations' => 'Базовый whey-протеин, витамин D, омега-3.',
                'workout_plan' => '3 тренировки в неделю, 40–50 минут каждая.',
                'price' => 1490,
                'is_active' => true,
            ],
            [
                'title' => 'Сушка и рельеф',
                'level' => 'Средний',
                'duration_weeks' => 6,
                'focus' => 'похудение',
                'slug' => 'sushka-i-relef',
                'short_description' => 'Для тех, кто хочет убрать лишний жир и подчеркнуть мышцы.',
                'description' => 'Сочетание силовых и интервальных тренировок.',
                'muscle_groups' => 'Всё тело, акцент на пресс и плечевой пояс.',
                'diet_recommendations' => 'Дефицит калорий, контроль углеводов, достаточный белок.',
                'supplement_recommendations' => 'Протеин, BCAA по необходимости, жиросжигатели по согласованию с врачом.',
                'workout_plan' => '4 тренировки в неделю, включая HIIT.',
                'price' => 1990,
                'is_active' => true,
            ],
        ]);

        Product::insert([
            [
                'name' => 'Сывороточный протеин 1 кг',
                'slug' => 'syvorotochnyi-protein-1kg',
                'category' => 'Протеин',
                'price' => 2490,
                'description' => 'Классический whey для восстановления мышц.',
                'image_url' => null,
                'in_stock' => true,
            ],
            [
                'name' => 'BCAA 2:1:1',
                'slug' => 'bcaa-2-1-1',
                'category' => 'Аминокислоты',
                'price' => 1490,
                'description' => 'Защита мышц и поддержка выносливости.',
                'image_url' => null,
                'in_stock' => true,
            ],
        ]);

        Article::insert([
            [
                'title' => 'Питание для набора мышечной массы',
                'slug' => 'pitanie-dlya-nabora-massy',
                'excerpt' => 'Базовые принципы питания для набора массы.',
                'content' => 'Набор массы — это сочетание силовых тренировок и калорийного, но сбалансированного рациона...',
                'published_at' => now()->subDays(5),
            ],
        ]);

        Review::insert([
            [
                'user_name' => 'Алексей',
                'rating' => 5,
                'comment' => 'Зал топ, тренеры объясняют понятно, онлайн-программа зашла.',
            ],
            [
                'user_name' => 'Мария',
                'rating' => 5,
                'comment' => 'Очень комфортная атмосфера и удобный график.',
            ],
        ]);

        GymLocation::insert([
            [
                'name' => 'FitLab Центр',
                'address' => 'Ул. Спортивная, 10',
                'schedule' => 'Пн–Вс: 7:00–23:00',
                'phone' => '+7 (900) 000-00-01',
                'map_embed_url' => null,
            ],
        ]);
    }
}


