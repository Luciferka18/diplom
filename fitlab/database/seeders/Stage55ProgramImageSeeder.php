<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class Stage55ProgramImageSeeder extends Seeder
{
    public function run(): void
    {
        if (!Schema::hasTable('programs') || !Schema::hasColumn('programs', 'image_url')) {
            $this->command?->warn('programs table or image_url column not found. Skipping program image update.');
            return;
        }

        $images = [
            'Функциональный старт' => '/seed-images/programs/funktsionalnyy-start.png',
            'Сильное тело' => '/seed-images/programs/moshch-i-sila.png',
            'Основа набора массы' => '/seed-images/programs/silovaya-baza.png',
            'Похудение за 8 недель' => '/seed-images/programs/pokhudenie-za-8-nedel.png',
            'Йога для начинающих' => '/seed-images/programs/yoga-dlya-nachinayushchikh.png',
            'Стретчинг плюс' => '/seed-images/programs/stretching-plus.png',
        ];

        foreach ($images as $title => $imageUrl) {
            DB::table('programs')->where('title', $title)->update([
                'image_url' => $imageUrl,
                'updated_at' => now(),
            ]);
        }

        $this->command?->info('Stage55 program images updated.');
    }
}
