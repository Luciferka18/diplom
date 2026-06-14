<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'login' => 'admin',
                'name' => 'Александр Администраторов',
                'phone' => '+79990000001',
                'email' => 'admin@nashfit.local',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
                'avatar_url' => '/seed-images/users/aleksandr-administratorov.webp',
            ],
            [
                'login' => 'trainer_anna',
                'name' => 'Анна Кузнецова',
                'phone' => '+79990000002',
                'email' => 'anna@nashfit.local',
                'role' => 'trainer',
                'password' => Hash::make('trainer123'),
                'avatar_url' => '/seed-images/users/anna-kuznetsova.webp',
            ],
            [
                'login' => 'trainer_dmitry',
                'name' => 'Дмитрий Сильнов',
                'phone' => '+79990000003',
                'email' => 'dmitry@nashfit.local',
                'role' => 'trainer',
                'password' => Hash::make('trainer123'),
                'avatar_url' => '/seed-images/users/dmitry-silnov.webp',
            ],
            [
                'login' => 'trainer_elena',
                'name' => 'Елена Фитнесова',
                'phone' => '+79990000004',
                'email' => 'elena@nashfit.local',
                'role' => 'trainer',
                'password' => Hash::make('trainer123'),
                'avatar_url' => '/seed-images/users/elena-fitnessova.webp',
            ],
            [
                'login' => 'user_ivan',
                'name' => 'Иван Петров',
                'phone' => '+79990000010',
                'email' => 'ivan@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
                'avatar_url' => '/seed-images/users/ivan-petrov.webp',
            ],
            [
                'login' => 'user_maria',
                'name' => 'Мария Сидорова',
                'phone' => '+79990000011',
                'email' => 'maria@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
                'avatar_url' => '/seed-images/users/maria-sidorova.webp',
            ],
            [
                'login' => 'user_sergey',
                'name' => 'Сергей Волков',
                'phone' => '+79990000012',
                'email' => 'sergey@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
                'avatar_url' => '/seed-images/users/sergey-volkov.webp',
            ],
            [
                'login' => 'user_olga',
                'name' => 'Ольга Морозова',
                'phone' => '+79990000013',
                'email' => 'olga@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
                'avatar_url' => '/seed-images/users/olga-morozova.webp',
            ],
            [
                'login' => 'user_alexey',
                'name' => 'Алексей Новиков',
                'phone' => '+79990000014',
                'email' => 'alexey@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
                'avatar_url' => '/seed-images/users/alexey-novikov.webp',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData,
            );
        }
    }
}
