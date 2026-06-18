<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TrainerSeeder::class,
            ProgramSeeder::class,
            ProductSeeder::class,
            ArticleSeeder::class,
            MuscleExerciseSeeder::class,
        ]);
    }
}
