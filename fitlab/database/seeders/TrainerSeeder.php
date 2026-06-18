<?php

namespace Database\Seeders;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TrainerSeeder extends Seeder
{
    public function run(): void
    {
        if (Schema::hasTable('trainer_schedules')) {
            DB::table('trainer_schedules')->delete();
        }

        Trainer::query()->delete();

        $trainers = [
            ['login' => 'trainer_anna', 'name' => 'Анна Кузнецова', 'email' => 'anna@nashfit.local', 'phone' => '+79990000002', 'specialization' => 'Функциональный тренинг и снижение веса', 'experience_years' => 7, 'age' => 28, 'bio' => 'Помогает безопасно снизить вес, развить выносливость и выстроить регулярный режим тренировок без перегруза.', 'instagram' => '@anna.nashfit', 'photo_url' => '/seed-images/trainers/anna-kuznetsova.webp', 'avatar_url' => '/seed-images/users/anna-kuznetsova.webp'],
            ['login' => 'trainer_dmitry', 'name' => 'Дмитрий Сильнов', 'email' => 'dmitry@nashfit.local', 'phone' => '+79990000003', 'specialization' => 'Силовая подготовка и набор массы', 'experience_years' => 10, 'age' => 35, 'bio' => 'Специалист по технике базовых движений, силовому прогрессу и набору качественной мышечной массы.', 'instagram' => '@dmitry.nashfit', 'photo_url' => '/seed-images/trainers/dmitry-silnov.webp', 'avatar_url' => '/seed-images/users/dmitry-silnov.webp'],
            ['login' => 'trainer_sofia', 'name' => 'София Морозова', 'email' => 'sofia@nashfit.local', 'phone' => '+79990000004', 'specialization' => 'Женский фитнес и mobility', 'experience_years' => 6, 'age' => 29, 'bio' => 'Работает с мобильностью, осанкой и мягкой коррекцией фигуры. Помогает почувствовать тело и двигаться свободнее.', 'instagram' => '@sofia.nashfit', 'photo_url' => '/seed-images/trainers/sofia-morozova.webp', 'avatar_url' => '/seed-images/users/sofia-morozova.webp'],
            ['login' => 'trainer_pavel', 'name' => 'Павел Орлов', 'email' => 'pavel@nashfit.local', 'phone' => '+79990000005', 'specialization' => 'Гипертрофия и бодибилдинг', 'experience_years' => 9, 'age' => 33, 'bio' => 'Составляет прогрессирующие планы тренировок и питания под набор массы, рельеф и уверенный силовой рост.', 'instagram' => '@pavel.nashfit', 'photo_url' => '/seed-images/trainers/pavel-orlov.webp', 'avatar_url' => '/seed-images/users/pavel-orlov.webp'],
            ['login' => 'trainer_alina', 'name' => 'Алина Ветрова', 'email' => 'alina@nashfit.local', 'phone' => '+79990000006', 'specialization' => 'Пилатес и stretch', 'experience_years' => 5, 'age' => 27, 'bio' => 'Ведёт занятия по пилатесу, стретчингу и мягкому восстановлению. Помогает снять зажимы и улучшить гибкость.', 'instagram' => '@alina.nashfit', 'photo_url' => '/seed-images/trainers/alina-vetrova.webp', 'avatar_url' => '/seed-images/users/alina-vetrova.webp'],
            ['login' => 'trainer_roman', 'name' => 'Роман Белов', 'email' => 'roman@nashfit.local', 'phone' => '+79990000007', 'specialization' => 'Cross-training и выносливость', 'experience_years' => 8, 'age' => 31, 'bio' => 'Тренер по интервальным нагрузкам и общей физической подготовке. Помогает стать сильнее, быстрее и выносливее.', 'instagram' => '@roman.nashfit', 'photo_url' => '/seed-images/trainers/roman-belov.webp', 'avatar_url' => '/seed-images/users/roman-belov.webp'],
            ['login' => 'trainer_maksim', 'name' => 'Максим Козлов', 'email' => 'maksim@nashfit.local', 'phone' => '+79990000008', 'specialization' => 'Бокс, кондиция и координация', 'experience_years' => 7, 'age' => 30, 'bio' => 'Сочетает кардио, бокс и координационные тренировки. Подходит тем, кто хочет заряд, технику и заметный тонус.', 'instagram' => '@maksim.nashfit', 'photo_url' => '/seed-images/trainers/maksim-kozlov.webp', 'avatar_url' => '/seed-images/users/maksim-kozlov.webp'],
            ['login' => 'trainer_andrey', 'name' => 'Андрей Соколов', 'email' => 'andrey@nashfit.local', 'phone' => '+79990000009', 'specialization' => 'TRX и функциональная сила', 'experience_years' => 11, 'age' => 39, 'bio' => 'Эксперт по TRX, функциональной силе и эффективным программам для занятых клиентов.', 'instagram' => '@andrey.nashfit', 'photo_url' => '/seed-images/trainers/andrey-sokolov.webp', 'avatar_url' => '/seed-images/users/andrey-sokolov.webp'],
            ['login' => 'trainer_ksenia', 'name' => 'Ксения Романова', 'email' => 'ksenia@nashfit.local', 'phone' => '+79990000010', 'specialization' => 'Фитнес для начинающих', 'experience_years' => 4, 'age' => 26, 'bio' => 'Помогает новичкам без стресса войти в тренировки, поставить технику и удержать мотивацию на старте.', 'instagram' => '@ksenia.nashfit', 'photo_url' => '/seed-images/trainers/ksenia-romanova.webp', 'avatar_url' => '/seed-images/users/ksenia-romanova.webp'],
            ['login' => 'trainer_igor', 'name' => 'Игорь Устинов', 'email' => 'igor@nashfit.local', 'phone' => '+79990000011', 'specialization' => 'Силовая выносливость', 'experience_years' => 12, 'age' => 41, 'bio' => 'Специалист по длительному силовому прогрессу, грамотной периодизации и устойчивому прогрессу без выгорания.', 'instagram' => '@igor.nashfit', 'photo_url' => '/seed-images/trainers/igor-ustinov.webp', 'avatar_url' => '/seed-images/users/igor-ustinov.webp'],
            ['login' => 'trainer_elena', 'name' => 'Елена Фитнесова', 'email' => 'elena@nashfit.local', 'phone' => '+79990000012', 'specialization' => 'Йога и восстановление', 'experience_years' => 8, 'age' => 32, 'bio' => 'Ведёт практики по йоге, дыханию и восстановлению. Помогает снизить стресс и выстроить комфортную активность.', 'instagram' => '@elena.nashfit', 'photo_url' => '/seed-images/trainers/elena-fitnessova.webp', 'avatar_url' => '/seed-images/users/elena-fitnessova.webp'],
        ];

        $locations = $this->seedLocations();

        foreach ($trainers as $index => $trainerData) {
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

            $trainer = Trainer::updateOrCreate(
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

            $this->seedSchedulesForTrainer($trainer->id, $index, $locations);
            $this->seedServicesForTrainer($trainer, $index);
        }
    }

    private function seedLocations(): array
    {
        if (!class_exists('App\\Models\\GymLocation') || !Schema::hasTable('gym_locations')) {
            return [];
        }

        $class = 'App\\Models\\GymLocation';
        $rows = [
            ['name' => 'НашФит Центр', 'address' => 'ул. Спортивная, 10'],
            ['name' => 'НашФит Север', 'address' => 'пр. Победы, 28'],
            ['name' => 'НашФит Riverside', 'address' => 'наб. Фитнеса, 7'],
        ];

        $result = [];
        foreach ($rows as $row) {
            $result[] = $class::updateOrCreate(['name' => $row['name']], $row);
        }
        return $result;
    }

    private function seedSchedulesForTrainer(int $trainerId, int $index, array $locations): void
    {
        if (!class_exists('App\\Models\\TrainerSchedule') || !Schema::hasTable('trainer_schedules')) {
            return;
        }

        $scheduleClass = 'App\\Models\\TrainerSchedule';
        $scheduleClass::query()->where('trainer_id', $trainerId)->delete();

        $templates = [
            [[1, '09:00', '18:00'], [3, '09:00', '18:00'], [5, '10:00', '19:00']],
            [[2, '08:00', '17:00'], [4, '08:00', '17:00'], [6, '10:00', '16:00']],
            [[1, '12:00', '20:00'], [4, '12:00', '20:00'], [6, '09:00', '14:00']],
            [[2, '10:00', '19:00'], [3, '10:00', '19:00'], [5, '09:00', '15:00']],
        ];

        $template = $templates[$index % count($templates)];

        foreach ($template as $offset => [$day, $start, $end]) {
            $location = !empty($locations) ? $locations[($index + $offset) % count($locations)] : null;
            $scheduleClass::create([
                'trainer_id' => $trainerId,
                'location_id' => $location?->id,
                'day_of_week' => $day,
                'start_time' => $start,
                'end_time' => $end,
                'slot_duration_minutes' => 60,
            ]);
        }
    }


    private function seedServicesForTrainer(Trainer $trainer, int $index): void
    {
        if (!class_exists('App\\Models\\TrainerService') || !Schema::hasTable('trainer_services')) {
            return;
        }

        $serviceClass = 'App\\Models\\TrainerService';

        $specialized = [
            ['name' => 'Функциональная тренировка', 'description' => 'Интенсивная работа на выносливость, технику движений и снижение веса без перегруза.', 'duration_minutes' => 60, 'price' => 240000, 'badge' => 'Функционал'],
            ['name' => 'Силовая тренировка', 'description' => 'Техника базовых упражнений, прогрессия нагрузки и безопасный набор силы.', 'duration_minutes' => 75, 'price' => 290000, 'badge' => 'Сила'],
            ['name' => 'Mobility и осанка', 'description' => 'Мягкая работа с мобильностью, осанкой, суставами и качеством движения.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Mobility'],
            ['name' => 'Гипертрофия и техника', 'description' => 'Тренировка на мышечный рост, технику упражнений и контроль прогресса.', 'duration_minutes' => 75, 'price' => 300000, 'badge' => 'Масса'],
            ['name' => 'Пилатес и stretch', 'description' => 'Пилатес, растяжка, гибкость и восстановление после сидячего дня или нагрузок.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Stretch'],
            ['name' => 'Cross-training', 'description' => 'Интервальная тренировка на общую физическую подготовку, выносливость и тонус.', 'duration_minutes' => 60, 'price' => 260000, 'badge' => 'Cross'],
            ['name' => 'Бокс и координация', 'description' => 'Удары, лапы, footwork, координация и энергозатратная тренировка без спарринга.', 'duration_minutes' => 60, 'price' => 270000, 'badge' => 'Бокс'],
            ['name' => 'TRX-функционал', 'description' => 'Работа с петлями TRX, корпусом, балансом и функциональной силой.', 'duration_minutes' => 60, 'price' => 260000, 'badge' => 'TRX'],
            ['name' => 'Фитнес-старт для новичков', 'description' => 'Безопасный вход в тренировки: техника, простая нагрузка и понятный план.', 'duration_minutes' => 60, 'price' => 220000, 'badge' => 'Новичкам'],
            ['name' => 'Силовая выносливость', 'description' => 'Силовые круги, периодизация и устойчивый прогресс без выгорания.', 'duration_minutes' => 75, 'price' => 290000, 'badge' => 'Выносливость'],
            ['name' => 'Йога и восстановление', 'description' => 'Йога, дыхание, расслабление и восстановление после тренировок или стресса.', 'duration_minutes' => 60, 'price' => 230000, 'badge' => 'Йога'],
        ];

        $profileService = $specialized[$index % count($specialized)];

        $services = [
            [
                'name' => 'Вводная диагностика',
                'slug' => 'intro-diagnostics',
                'description' => 'Знакомство с тренером, разбор цели, ограничений и первичный план занятий.',
                'duration_minutes' => 30,
                'price' => 0,
                'badge' => 'Старт',
                'is_intro' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Персональная тренировка',
                'slug' => 'personal-training',
                'description' => 'Индивидуальное занятие с контролем техники, подбором нагрузки и рекомендациями.',
                'duration_minutes' => 60,
                'price' => 250000,
                'badge' => '1 на 1',
                'is_intro' => false,
                'sort_order' => 20,
            ],
            array_merge($profileService, [
                'slug' => 'profile-format',
                'is_intro' => false,
                'sort_order' => 30,
            ]),
        ];

        foreach ($services as $service) {
            $serviceClass::updateOrCreate(
                [
                    'trainer_id' => $trainer->id,
                    'slug' => $service['slug'],
                ],
                [
                    'name' => $service['name'],
                    'description' => $service['description'],
                    'duration_minutes' => $service['duration_minutes'],
                    'price' => $service['price'],
                    'badge' => $service['badge'],
                    'is_intro' => $service['is_intro'],
                    'is_active' => true,
                    'sort_order' => $service['sort_order'],
                ]
            );
        }
    }

}
