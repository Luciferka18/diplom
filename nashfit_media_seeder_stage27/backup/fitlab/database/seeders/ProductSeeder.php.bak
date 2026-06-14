<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Категории
        $categories = [
            ['name' => 'Протеин', 'slug' => 'protein'],
            ['name' => 'Гейнеры', 'slug' => 'gainers'],
            ['name' => 'Аминокислоты', 'slug' => 'amino-acids'],
            ['name' => 'Витамины', 'slug' => 'vitamins'],
            ['name' => 'Спортивное питание', 'slug' => 'sports-nutrition'],
            ['name' => 'Инвентарь', 'slug' => 'equipment'],
        ];

        foreach ($categories as $catData) {
            Category::firstOrCreate(['slug' => $catData['slug']], $catData);
        }

        $categories = Category::all()->keyBy('slug');
        $tagIds = Tag::pluck('id')->toArray();

        $products = [
            [
                'name' => 'Whey Protein Gold Standard',
                'description' => 'Сывороточный протеин премиум класса. 24г белка на порцию. Быстрое усвоение.',
                'price' => 4990,
                'stock' => 50,
                'category_id' => $categories['protein']->id,
                'tags' => [2],
            ],
            [
                'name' => 'Casein Protein',
                'description' => 'Казеиновый протеин для ночного восстановления. Медленное высвобождение аминокислот.',
                'price' => 4490,
                'stock' => 30,
                'category_id' => $categories['protein']->id,
                'tags' => [2],
            ],
            [
                'name' => 'Mass Gainer Pro',
                'description' => 'Высококалорийный гейнер для набора массы. 1250 ккал на порцию.',
                'price' => 5490,
                'stock' => 25,
                'category_id' => $categories['gainers']->id,
                'tags' => [2],
            ],
            [
                'name' => 'BCAA 5000',
                'description' => 'Аминокислоты с разветвленной цепью. 5г на порцию. Восстановление и защита мышц.',
                'price' => 2490,
                'stock' => 100,
                'category_id' => $categories['amino-acids']->id,
                'tags' => [1, 3],
            ],
            [
                'name' => 'L-Glutamine',
                'description' => 'Глютамин для восстановления и иммунитета. 5г на порцию.',
                'price' => 1990,
                'stock' => 80,
                'category_id' => $categories['amino-acids']->id,
                'tags' => [3],
            ],
            [
                'name' => 'Omega-3 Ultra',
                'description' => 'Рыбий жир высокой концентрации. Поддержка сердца и сосудов.',
                'price' => 1490,
                'stock' => 150,
                'category_id' => $categories['vitamins']->id,
                'tags' => [1],
            ],
            [
                'name' => 'Multivitamin Sport',
                'description' => 'Комплекс витаминов и минералов для активных людей.',
                'price' => 1790,
                'stock' => 120,
                'category_id' => $categories['vitamins']->id,
                'tags' => [1],
            ],
            [
                'name' => 'Резиновый эспандер',
                'description' => 'Набор эспандеров разной жесткости. Для домашних тренировок.',
                'price' => 990,
                'stock' => 200,
                'category_id' => $categories['equipment']->id,
                'tags' => [5],
            ],
            [
                'name' => 'Коврик для йоги',
                'description' => 'Противоскользящий коврик толщиной 6мм. Экологичный материал.',
                'price' => 2490,
                'stock' => 60,
                'category_id' => $categories['equipment']->id,
                'tags' => [4],
            ],
            [
                'name' => 'Бутылка для воды 1л',
                'description' => 'Спортивная бутылка с мерной шкалой. BPA-free пластик.',
                'price' => 590,
                'stock' => 300,
                'category_id' => $categories['equipment']->id,
                'tags' => [5],
            ],
        ];

        foreach ($products as $productData) {
            $tags = $productData['tags'] ?? [];
            unset($productData['tags']);
            
            $product = Product::create($productData);
            if (!empty($tags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($tags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $product->tags()->attach($selectedTags);
                }
            }
        }
    }
}
