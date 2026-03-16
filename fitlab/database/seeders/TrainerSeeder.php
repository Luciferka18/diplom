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
                'bio' => 'Сертифицированный тренер по функциональному тренингу. Помогаю клиентам безопасно снизить вес и повысить выносливость.',
                'instagram' => '@anna_fitlab',
            ],
            [
                'specialization' => 'Силовая подготовка',
                'experience_years' => 10,
                'bio' => 'Мастер спорта по пауэрлифтингу. Обучаю правильной технике базовых упражнений и помогаю набрать мышечную массу.',
                'instagram' => '@dmitry_strength',
            ],
            [
                'specialization' => 'Йога и стретчинг',
                'experience_years' => 5,
                'bio' => 'Инструктор по йоге с 5-летним стажем. Помогаю развить гибкость, снять стресс и найти внутреннее равновесие.',
                'instagram' => '@elena_yoga',
            ],
        ];

        foreach ($trainers as $index => $trainerUser) {
            Trainer::create([
                'user_id' => $trainerUser->id,
                'name' => $trainerUser->name,
                'specialization' => $trainerData[$index]['specialization'] ?? 'Фитнес-тренер',
                'experience_years' => $trainerData[$index]['experience_years'] ?? 3,
                'bio' => $trainerData[$index]['bio'] ?? 'Опытный тренер',
                'instagram' => $trainerData[$index]['instagram'] ?? '',
            ]);
        }
    }
}
