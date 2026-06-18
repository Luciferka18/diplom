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
            ['login' => 'admin', 'name' => 'Александр Администраторов', 'phone' => '+79990000001', 'email' => 'admin@nashfit.local', 'role' => 'admin', 'password' => 'admin123', 'avatar_url' => '/seed-images/users/aleksandr-administratorov.webp'],

            ['login' => 'trainer_anna', 'name' => 'Анна Кузнецова', 'phone' => '+79990000002', 'email' => 'anna@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/anna-kuznetsova.webp'],
            ['login' => 'trainer_dmitry', 'name' => 'Дмитрий Сильнов', 'phone' => '+79990000003', 'email' => 'dmitry@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/dmitry-silnov.webp'],
            ['login' => 'trainer_sofia', 'name' => 'София Морозова', 'phone' => '+79990000004', 'email' => 'sofia@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/sofia-morozova.webp'],
            ['login' => 'trainer_pavel', 'name' => 'Павел Орлов', 'phone' => '+79990000005', 'email' => 'pavel@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/pavel-orlov.webp'],
            ['login' => 'trainer_alina', 'name' => 'Алина Ветрова', 'phone' => '+79990000006', 'email' => 'alina@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/alina-vetrova.webp'],
            ['login' => 'trainer_roman', 'name' => 'Роман Белов', 'phone' => '+79990000007', 'email' => 'roman@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/roman-belov.webp'],
            ['login' => 'trainer_maksim', 'name' => 'Максим Козлов', 'phone' => '+79990000008', 'email' => 'maksim@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/maksim-kozlov.webp'],
            ['login' => 'trainer_andrey', 'name' => 'Андрей Соколов', 'phone' => '+79990000009', 'email' => 'andrey@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/andrey-sokolov.webp'],
            ['login' => 'trainer_ksenia', 'name' => 'Ксения Романова', 'phone' => '+79990000010', 'email' => 'ksenia@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/ksenia-romanova.webp'],
            ['login' => 'trainer_igor', 'name' => 'Игорь Устинов', 'phone' => '+79990000011', 'email' => 'igor@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/igor-ustinov.webp'],
            ['login' => 'trainer_elena', 'name' => 'Елена Фитнесова', 'phone' => '+79990000012', 'email' => 'elena@nashfit.local', 'role' => 'trainer', 'password' => 'trainer123', 'avatar_url' => '/seed-images/users/elena-fitnessova.webp'],

            ['login' => 'user_ivan', 'name' => 'Иван Петров', 'phone' => '+79990000020', 'email' => 'ivan@example.com', 'role' => 'user', 'password' => 'user123', 'avatar_url' => '/seed-images/users/ivan-petrov.webp'],
            ['login' => 'user_maria', 'name' => 'Мария Сидорова', 'phone' => '+79990000021', 'email' => 'maria@example.com', 'role' => 'user', 'password' => 'user123', 'avatar_url' => '/seed-images/users/maria-sidorova.webp'],
            ['login' => 'user_sergey', 'name' => 'Сергей Волков', 'phone' => '+79990000022', 'email' => 'sergey@example.com', 'role' => 'user', 'password' => 'user123', 'avatar_url' => '/seed-images/users/sergey-volkov.webp'],
            ['login' => 'user_olga', 'name' => 'Ольга Морозова', 'phone' => '+79990000023', 'email' => 'olga@example.com', 'role' => 'user', 'password' => 'user123', 'avatar_url' => '/seed-images/users/olga-morozova.webp'],
            ['login' => 'user_alexey', 'name' => 'Алексей Новиков', 'phone' => '+79990000024', 'email' => 'alexey@example.com', 'role' => 'user', 'password' => 'user123', 'avatar_url' => '/seed-images/users/alexey-novikov.webp'],
        ];

        foreach ($users as $userData) {
            $userData['password'] = Hash::make($userData['password']);
            User::updateOrCreate(['email' => $userData['email']], $userData);
        }
    }
}
