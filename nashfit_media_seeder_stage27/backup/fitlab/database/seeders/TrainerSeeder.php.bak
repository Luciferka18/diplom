<?php

namespace Database\Seeders;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;

class TrainerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainers = User::where('role', 'trainer')->get();

        $trainerData = [
            [
                'specialization' => 'Функциональный тренинг',
                'experience_years' => 7,
                'age' => 28,
                'bio' => 'Сертифицированный тренер по функциональному тренингу. Помогаю клиентам безопасно снизить вес и повысить выносливость.',
                'instagram' => '@anna_nashfit_vk',
                'phone' => '+79990000002',
            ],
            [
                'specialization' => 'Силовая подготовка',
                'experience_years' => 10,
                'age' => 35,
                'bio' => 'Мастер спорта по пауэрлифтингу. Обучаю правильной технике базовых упражнений и помогаю набрать мышечную массу.',
                'instagram' => '@dmitry_strength_vk',
                'phone' => '+79990000003',
            ],
            [
                'specialization' => 'Йога и стретчинг',
                'experience_years' => 5,
                'age' => 26,
                'bio' => 'Инструктор по йоге с 5-летним стажем. Помогаю развить гибкость, снять стресс и найти внутреннее равновесие.',
                'instagram' => '@elena_yoga_vk',
                'phone' => '+79990000004',
            ],
        ];

        foreach ($trainers as $index => $trainerUser) {
            Trainer::updateOrCreate(
                ['user_id' => $trainerUser->id],
                [
                    'name' => $trainerUser->name,
                    'specialization' => $trainerData[$index]['specialization'] ?? 'Фитнес-тренер',
                    'experience_years' => $trainerData[$index]['experience_years'] ?? 3,
                    'age' => $trainerData[$index]['age'] ?? null,
                    'bio' => $trainerData[$index]['bio'] ?? 'Опытный тренер',
                    'instagram' => $trainerData[$index]['instagram'] ?? '',
                    'phone' => $trainerData[$index]['phone'] ?? null,
                ]
            );
        }
    }
}
