<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\User;
use App\Models\Trainer;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $trainers = Trainer::all();
        $products = Product::all();

        // Отзывы о тренерах
        $trainerReviews = [
            [
                'reviewable_type' => Trainer::class,
                'reviewable_id' => $trainers->first()?->id ?? 1,
                'user_id' => $users->first()?->id ?? 1,
                'rating' => 5,
                'text' => 'Отличный тренер! Анна очень внимательно относится к технике выполнения упражнений. За 2 месяца достиг отличных результатов.',
            ],
            [
                'reviewable_type' => Trainer::class,
                'reviewable_id' => $trainers->first()?->id ?? 1,
                'user_id' => $users->skip(1)->first()?->id ?? 2,
                'rating' => 5,
                'text' => 'Профессиональный подход и индивидуальный план тренировок. Рекомендую!',
            ],
            [
                'reviewable_type' => Trainer::class,
                'reviewable_id' => $trainers->skip(1)->first()?->id ?? 2,
                'user_id' => $users->skip(2)->first()?->id ?? 3,
                'rating' => 4,
                'text' => 'Дмитрий — сильный тренер. Помог увеличить рабочие веса. Иногда бывает слишком строгим.',
            ],
            [
                'reviewable_type' => Trainer::class,
                'reviewable_id' => $trainers->skip(2)->first()?->id ?? 3,
                'user_id' => $users->skip(3)->first()?->id ?? 4,
                'rating' => 5,
                'text' => 'Йога с Еленой — это нечто особенное. После занятий чувствую себя обновлённым.',
            ],
        ];

        foreach ($trainerReviews as $reviewData) {
            Review::create($reviewData);
        }

        // Отзывы о продуктах
        $productReviews = [
            [
                'reviewable_type' => Product::class,
                'reviewable_id' => 1,
                'user_id' => $users->first()?->id ?? 1,
                'rating' => 5,
                'text' => 'Лучший протеин, который я пробовал. Отлично растворяется, приятный вкус.',
            ],
            [
                'reviewable_type' => Product::class,
                'reviewable_id' => 1,
                'user_id' => $users->skip(1)->first()?->id ?? 2,
                'rating' => 4,
                'text' => 'Хороший протеин, но дороговат. Качество на высоте.',
            ],
            [
                'reviewable_type' => Product::class,
                'reviewable_id' => 4,
                'user_id' => $users->skip(2)->first()?->id ?? 3,
                'rating' => 5,
                'text' => 'BCAA работают отлично. Восстановление после тренировок заметно улучшилось.',
            ],
            [
                'reviewable_type' => Product::class,
                'reviewable_id' => 8,
                'user_id' => $users->skip(3)->first()?->id ?? 4,
                'rating' => 5,
                'text' => 'Набор эспандеров — отличная альтернатива тренажёрному залу для домашних тренировок.',
            ],
            [
                'reviewable_type' => Product::class,
                'reviewable_id' => 9,
                'user_id' => $users->skip(4)->first()?->id ?? 5,
                'rating' => 4,
                'text' => 'Коврик хороший, не скользит. Единственный минус — первое время был запах.',
            ],
        ];

        foreach ($productReviews as $reviewData) {
            Review::create($reviewData);
        }

        // Отзывы о сайте
        $siteReviews = [
            [
                'reviewable_type' => 'site',
                'reviewable_id' => 1,
                'user_id' => $users->first()?->id ?? 1,
                'rating' => 5,
                'text' => 'Удобный сайт, легко найти нужную информацию. Заказ оформил за пару минут.',
            ],
            [
                'reviewable_type' => 'site',
                'reviewable_id' => 1,
                'user_id' => $users->skip(1)->first()?->id ?? 2,
                'rating' => 4,
                'text' => 'Всё понравилось, быстрая доставка. Хотелось бы больше способов оплаты.',
            ],
        ];

        foreach ($siteReviews as $reviewData) {
            Review::create($reviewData);
        }
    }
}
