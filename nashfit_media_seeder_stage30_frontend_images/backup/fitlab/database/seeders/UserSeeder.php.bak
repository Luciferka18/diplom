<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Администраторы
        User::create([
            'login' => 'admin',
            'name' => 'Александр Администраторов',
            'phone' => '+79990000001',
            'email' => 'admin@nashfit.local',
            'role' => 'admin',
            'password' => Hash::make('admin123'),
        ]);

        // Тренеры
        $trainers = [
            [
                'login' => 'trainer_anna',
                'name' => 'Анна Кузнецова',
                'phone' => '+79990000002',
                'email' => 'anna@nashfit.local',
                'role' => 'trainer',
                'password' => Hash::make('trainer123'),
            ],
            [
                'login' => 'trainer_dmitry',
                'name' => 'Дмитрий Сильнов',
                'phone' => '+79990000003',
                'email' => 'dmitry@nashfit.local',
                'role' => 'trainer',
                'password' => Hash::make('trainer123'),
            ],
            [
                'login' => 'trainer_elena',
                'name' => 'Елена Фитнесова',
                'phone' => '+79990000004',
                'email' => 'elena@nashfit.local',
                'role' => 'trainer',
                'password' => Hash::make('trainer123'),
            ],
        ];

        foreach ($trainers as $trainer) {
            User::create($trainer);
        }

        // Клиенты
        $clients = [
            [
                'login' => 'user_ivan',
                'name' => 'Иван Петров',
                'phone' => '+79990000010',
                'email' => 'ivan@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
            ],
            [
                'login' => 'user_maria',
                'name' => 'Мария Сидорова',
                'phone' => '+79990000011',
                'email' => 'maria@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
            ],
            [
                'login' => 'user_sergey',
                'name' => 'Сергей Волков',
                'phone' => '+79990000012',
                'email' => 'sergey@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
            ],
            [
                'login' => 'user_olga',
                'name' => 'Ольга Морозова',
                'phone' => '+79990000013',
                'email' => 'olga@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
            ],
            [
                'login' => 'user_alexey',
                'name' => 'Алексей Новиков',
                'phone' => '+79990000014',
                'email' => 'alexey@example.com',
                'role' => 'user',
                'password' => Hash::make('user123'),
            ],
        ];

        foreach ($clients as $client) {
            User::create($client);
        }
    }
}
