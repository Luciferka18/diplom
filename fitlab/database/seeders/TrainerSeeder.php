<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trainer;

class TrainerSeeder extends Seeder
{
    public function run()
    {
        Trainer::insert([
            [
                'name' => 'Алексей Иванов',
                'specialization' => 'Силовой тренинг',
                'experience_years' => 8,
                'bio' => 'Специалист по набору мышечной массы и силовым программам.',
            ],
            [
                'name' => 'Мария Кузнецова',
                'specialization' => 'Фитнес и похудение',
                'experience_years' => 6,
                'bio' => 'Работает с клиентами на снижение веса и тонус тела.',
            ],
            [
                'name' => 'Дмитрий Орлов',
                'specialization' => 'Кроссфит',
                'experience_years' => 5,
                'bio' => 'Функциональные тренировки и выносливость.',
            ],
        ]);
    }
}
