<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;

class ProgramSeeder extends Seeder
{
    public function run()
    {
        Program::insert([
            [
                'title' => 'Сушка тела',
                'level' => 'Средний',
                'duration_weeks' => 4,
                'short_description' => 'Программа для снижения жира и улучшения рельефа.',
                'description' => 'Полный план тренировок и питания для сушки тела.',
            ],
            [
                'title' => 'Набор массы',
                'level' => 'Начальный',
                'duration_weeks' => 6,
                'short_description' => 'Программа для роста мышц.',
                'description' => 'Силовые тренировки и рацион для роста массы.',
            ],
            [
                'title' => 'Домашний фитнес',
                'level' => 'Любой',
                'duration_weeks' => 4,
                'short_description' => 'Тренировки без зала.',
                'description' => 'Комплекс упражнений для дома без оборудования.',
            ],
        ]);
    }
}
