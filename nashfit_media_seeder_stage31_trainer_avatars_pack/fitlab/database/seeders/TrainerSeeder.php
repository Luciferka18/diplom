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
                'bio' => 'Специалист по функциональному тренингу и безопасному снижению веса. Помогает укрепить корпус, улучшить выносливость и выстроить комфортный режим тренировок.',
                'instagram' => '@anna_nashfit_vk',
                'photo_url' => '/seed-images/trainers/anna-kuznetsova.webp',
                'avatar_url' => '/seed-images/users/anna-kuznetsova.webp',
            ],
            [
                'login' => 'trainer_dmitry',
                'name' => 'Дмитрий Сильнов',
                'email' => 'dmitry@nashfit.local',
                'phone' => '+79990000003',
                'specialization' => 'Силовая подготовка',
                'experience_years' => 10,
                'age' => 35,
                'bio' => 'Тренер по силовой подготовке и технике базовых движений. Помогает набрать мышечную массу и повысить силовые показатели без лишнего риска.',
                'instagram' => '@dmitry_strength_vk',
                'photo_url' => '/seed-images/trainers/dmitry-silnov.webp',
                'avatar_url' => '/seed-images/users/dmitry-silnov.webp',
            ],
            [
                'login' => 'trainer_sofia',
                'name' => 'София Морозова',
                'email' => 'sofia@nashfit.local',
                'phone' => '+79990000005',
                'specialization' => 'Женский фитнес и mobility',
                'experience_years' => 6,
                'age' => 29,
                'bio' => 'Работает с женским фитнесом, мобильностью и мягкой коррекцией осанки. Помогает улучшить тонус тела, координацию и качество движения.',
                'instagram' => '@sofia_move_vk',
                'photo_url' => '/seed-images/trainers/sofia-morozova.webp',
                'avatar_url' => '/seed-images/users/sofia-morozova.webp',
            ],
            [
                'login' => 'trainer_pavel',
                'name' => 'Павел Орлов',
                'email' => 'pavel@nashfit.local',
                'phone' => '+79990000006',
                'specialization' => 'Набор мышечной массы',
                'experience_years' => 9,
                'age' => 33,
                'bio' => 'Тренер по набору мышечной массы и классическому бодибилдингу. Составляет прогрессирующие планы тренировок и питания под цель.',
                'instagram' => '@pavel_mass_vk',
                'photo_url' => '/seed-images/trainers/pavel-orlov.webp',
                'avatar_url' => '/seed-images/users/pavel-orlov.webp',
            ],
            [
                'login' => 'trainer_alina',
                'name' => 'Алина Ветрова',
                'email' => 'alina@nashfit.local',
                'phone' => '+79990000007',
                'specialization' => 'Пилатес и stretch',
                'experience_years' => 5,
                'age' => 27,
                'bio' => 'Ведёт занятия по пилатесу, стретчингу и мягкому восстановлению. Помогает снять зажимы, улучшить гибкость и самочувствие.',
                'instagram' => '@alina_stretch_vk',
                'photo_url' => '/seed-images/trainers/alina-vetrova.webp',
                'avatar_url' => '/seed-images/users/alina-vetrova.webp',
            ],
            [
                'login' => 'trainer_roman',
                'name' => 'Роман Белов',
                'email' => 'roman@nashfit.local',
                'phone' => '+79990000008',
                'specialization' => 'Cross-training',
                'experience_years' => 8,
                'age' => 31,
                'bio' => 'Тренер по интервальным и кросс-тренировкам. Помогает развить общую физическую форму, выносливость и функциональную силу.',
                'instagram' => '@roman_cross_vk',
                'photo_url' => '/seed-images/trainers/roman-belov.webp',
                'avatar_url' => '/seed-images/users/roman-belov.webp',
            ],
            [
                'login' => 'trainer_maksim',
                'name' => 'Максим Козлов',
                'email' => 'maksim@nashfit.local',
                'phone' => '+79990000009',
                'specialization' => 'Единоборства и кондиция',
                'experience_years' => 7,
                'age' => 30,
                'bio' => 'Тренер по боксу, кардио-кондиции и координации. Подходит тем, кто хочет сочетать мощную тренировку, технику и выносливость.',
                'instagram' => '@maksim_box_vk',
                'photo_url' => '/seed-images/trainers/maksim-kozlov.webp',
                'avatar_url' => '/seed-images/users/maksim-kozlov.webp',
            ],
            [
                'login' => 'trainer_andrey',
                'name' => 'Андрей Соколов',
                'email' => 'andrey@nashfit.local',
                'phone' => '+79990000015',
                'specialization' => 'TRX и функциональная сила',
                'experience_years' => 11,
                'age' => 39,
                'bio' => 'Эксперт по TRX, функциональной силе и тренировкам для занятых людей. Умеет быстро собрать эффективную программу под график клиента.',
                'instagram' => '@andrey_trx_vk',
                'photo_url' => '/seed-images/trainers/andrey-sokolov.webp',
                'avatar_url' => '/seed-images/users/andrey-sokolov.webp',
            ],
            [
                'login' => 'trainer_ksenia',
                'name' => 'Ксения Романова',
                'email' => 'ksenia@nashfit.local',
                'phone' => '+79990000016',
                'specialization' => 'Фитнес для начинающих',
                'experience_years' => 4,
                'age' => 26,
                'bio' => 'Помогает новичкам без стресса войти в тренировки, освоить технику и удерживать мотивацию. Специализируется на мягком старте и дисциплине.',
                'instagram' => '@ksenia_start_vk',
                'photo_url' => '/seed-images/trainers/ksenia-romanova.webp',
                'avatar_url' => '/seed-images/users/ksenia-romanova.webp',
            ],
            [
                'login' => 'trainer_igor',
                'name' => 'Игорь Устинов',
                'email' => 'igor@nashfit.local',
                'phone' => '+79990000017',
                'specialization' => 'Силовая выносливость',
                'experience_years' => 12,
                'age' => 41,
                'bio' => 'Сочетает силовую выносливость, общефизическую подготовку и грамотную периодизацию нагрузок. Подходит для долгосрочного прогресса.',
                'instagram' => '@igor_power_vk',
                'photo_url' => '/seed-images/trainers/igor-ustinov.webp',
                'avatar_url' => '/seed-images/users/igor-ustinov.webp',
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
                    'avatar_url' => $trainerData['avatar_url'],
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
