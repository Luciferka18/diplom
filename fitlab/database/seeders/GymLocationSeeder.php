<?php

namespace Database\Seeders;

use App\Models\GymLocation;
use Illuminate\Database\Seeder;

class GymLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            ['name' => 'FitLab Центр', 'address' => 'ул. Спортивная, 10'],
            ['name' => 'FitLab Север', 'address' => 'пр. Ленина, 45'],
            ['name' => 'FitLab Юг', 'address' => 'ул. Гагарина, 22'],
            ['name' => 'FitLab Запад', 'address' => 'ул. Мира, 88'],
        ];

        foreach ($locations as $locationData) {
            GymLocation::firstOrCreate(
                ['name' => $locationData['name']],
                $locationData
            );
        }
    }
}
