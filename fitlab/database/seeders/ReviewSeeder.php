<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;

class ReviewSeeder extends Seeder
{
    public function run()
    {
        Review::insert([
            [
                'user_name' => 'Иван',
                'rating' => 5,
                'comment' => 'Отличный зал и тренеры!',
            ],
            [
                'user_name' => 'Анна',
                'rating' => 4,
                'comment' => 'Очень удобные онлайн-программы.',
            ],
            [
                'user_name' => 'Сергей',
                'rating' => 5,
                'comment' => 'Результат заметен уже через месяц.',
            ],
        ]);
    }
}
