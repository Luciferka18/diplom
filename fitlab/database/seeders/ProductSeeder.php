<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        Product::insert([
            [
                'title' => 'Протеин Whey',
                'price' => 2490,
                'description' => 'Высококачественный сывороточный протеин.',
            ],
            [
                'title' => 'BCAA',
                'price' => 1590,
                'description' => 'Аминокислоты для восстановления.',
            ],
            [
                'title' => 'Креатин',
                'price' => 1290,
                'description' => 'Повышает силу и выносливость.',
            ],
        ]);
    }
}
