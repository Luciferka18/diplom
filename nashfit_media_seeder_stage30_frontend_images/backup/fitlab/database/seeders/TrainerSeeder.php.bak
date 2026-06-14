<?php

namespace Database\Seeders;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TrainerSeeder extends Seeder
{
    public function run(): void
    {
        $trainers = [
            [
                'login' => 'trainer_anna',
                'name' => 'Анна Кузнецова',
                'email' => 'anna@nashfit.local',
                'phone' => '+79990000002',
                'specialization' => 'Функциональный тренинг',
                'experience_years' => 7,
                'age' => 28,
                'bio' => 'Сертифицированный тренер по функциональному тренингу. Помогает безопасно снизить вес, укрепить корпус и повысить выносливость.',
                'instagram' => '@anna_nashfit_vk',
                'photo_url' => '/seed-images/trainers/anna-kuznetsova.webp',
            ],
            [
                'login' => 'trainer_dmitry',
                'name' => 'Дмитрий Сильнов',
                'email' => 'dmitry@nashfit.local',
                'phone' => '+79990000003',
                'specialization' => 'Силовая подготовка',
                'experience_years' => 10,
                'age' => 35,
                'bio' => 'Мастер спорта по пауэрлифтингу. Обучает технике базовых упражнений и помогает набрать мышечную массу без лишнего риска.',
                'instagram' => '@dmitry_strength_vk',
                'photo_url' => '/seed-images/trainers/dmitry-silnov.webp',
            ],
            [
                'login' => 'trainer_elena',
                'name' => 'Елена Фитнесова',
                'email' => 'elena@nashfit.local',
                'phone' => '+79990000004',
                'specialization' => 'Йога и стретчинг',
                'experience_years' => 5,
                'age' => 26,
                'bio' => 'Инструктор по йоге и растяжке. Помогает развить гибкость, снять напряжение и восстановить подвижность после тренировок.',
                'instagram' => '@elena_yoga_vk',
                'photo_url' => '/seed-images/trainers/elena-fitnessova.webp',
            ],
        ];

        foreach ($trainers as $trainerData) {
            $user = User::updateOrCreate(
                ['email' => $trainerData['email']],
                [
                    'login' => $trainerData['login'],
                    'name' => $trainerData['name'],
                    'phone' => $trainerData['phone'],
                    'role' => 'trainer',
                    'password' => Hash::make('trainer123'),
                ]
            );

            Trainer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $trainerData['name'],
                    'specialization' => $trainerData['specialization'],
                    'experience_years' => $trainerData['experience_years'],
                    'age' => $trainerData['age'],
                    'bio' => $trainerData['bio'],
                    'photo_url' => $trainerData['photo_url'],
                    'instagram' => $trainerData['instagram'],
                    'phone' => $trainerData['phone'],
                ]
            );
        }
    }
}
