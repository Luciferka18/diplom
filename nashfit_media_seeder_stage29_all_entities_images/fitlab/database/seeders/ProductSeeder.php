<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
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
                'slug' => 'whey-protein-gold-standard',
                'name' => 'Whey Protein Gold Standard',
                'short_description' => 'Сывороточный протеин для добора белка после тренировки и в течение дня.',
                'description' => 'Сывороточный протеин премиум-класса. 24 г белка на порцию, быстрое усвоение, мягкая текстура и удобные варианты вкуса.',
                'brand' => 'NashFit',
                'sku' => 'NF-WHEY-GS',
                'price' => 4990,
                'old_price' => 5490,
                'stock' => 50,
                'category_id' => $categories['protein']->id,
                'image_url' => '/seed-images/products/whey-protein-gold-standard/main.webp',
                'gallery' => [
                    '/seed-images/products/whey-protein-gold-standard/main.webp',
                    '/seed-images/products/whey-protein-gold-standard/variant-vanilla-2kg.webp',
                ],
                'attributes' => [
                    'Белок' => '24 г на порцию',
                    'Формат' => 'порошок',
                    'Цель' => 'набор белка и восстановление',
                    'Вкусы' => 'Chocolate / Vanilla',
                ],
                'badges' => ['Хит', 'Для силы', 'Проверено тренерами'],
                'is_featured' => true,
                'is_new' => false,
                'trainer_pick' => true,
                'home_use' => true,
                'tags' => [2],
                'variants' => [
                    ['name' => 'Chocolate 900 г', 'sku' => 'NF-WHEY-GS-CHOC-900', 'options' => ['flavor' => 'Chocolate', 'size' => '900 г'], 'price' => 4990, 'stock' => 24, 'image_url' => '/seed-images/products/whey-protein-gold-standard/main.webp', 'sort_order' => 1],
                    ['name' => 'Vanilla 2 кг', 'sku' => 'NF-WHEY-GS-VAN-2KG', 'options' => ['flavor' => 'Vanilla', 'size' => '2 кг'], 'price' => 7990, 'stock' => 18, 'image_url' => '/seed-images/products/whey-protein-gold-standard/variant-vanilla-2kg.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'casein-protein',
                'name' => 'Casein Protein',
                'short_description' => 'Казеин для медленного высвобождения аминокислот и ночного восстановления.',
                'description' => 'Казеиновый протеин для вечернего приёма. Помогает закрыть белок на ночь и поддержать восстановление после нагрузки.',
                'brand' => 'NashFit',
                'sku' => 'NF-CASEIN',
                'price' => 4490,
                'old_price' => 4990,
                'stock' => 30,
                'category_id' => $categories['protein']->id,
                'image_url' => '/seed-images/products/casein-protein/main.webp',
                'gallery' => [
                    '/seed-images/products/casein-protein/main.webp',
                    '/seed-images/products/casein-protein/lifestyle.webp',
                ],
                'attributes' => ['Тип' => 'мицеллярный казеин', 'Цель' => 'ночное восстановление', 'Вкус' => 'Vanilla'],
                'badges' => ['Восстановление', 'Перед сном'],
                'is_featured' => true,
                'trainer_pick' => true,
                'home_use' => true,
                'tags' => [2],
                'variants' => [
                    ['name' => 'Vanilla 900 г', 'sku' => 'NF-CASEIN-VAN-900', 'options' => ['flavor' => 'Vanilla', 'size' => '900 г'], 'price' => 4490, 'stock' => 16, 'image_url' => '/seed-images/products/casein-protein/main.webp', 'sort_order' => 1],
                    ['name' => 'Night Recovery Set', 'sku' => 'NF-CASEIN-RECOVERY-SET', 'options' => ['format' => 'банка + шейкер'], 'price' => 4990, 'stock' => 12, 'image_url' => '/seed-images/products/casein-protein/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'mass-gainer-pro',
                'name' => 'Mass Gainer Pro',
                'short_description' => 'Высококалорийный гейнер для набора массы и восстановления энергии.',
                'description' => 'Гейнер для атлетов, которым сложно добирать калории. Содержит белки и углеводы для роста массы и восстановления.',
                'brand' => 'NashFit',
                'sku' => 'NF-GAINER-PRO',
                'price' => 5490,
                'old_price' => 5990,
                'stock' => 25,
                'category_id' => $categories['gainers']->id,
                'image_url' => '/seed-images/products/mass-gainer-pro/main.webp',
                'gallery' => [
                    '/seed-images/products/mass-gainer-pro/main.webp',
                    '/seed-images/products/mass-gainer-pro/lifestyle.webp',
                ],
                'attributes' => ['Калорийность' => '1250 ккал на порцию', 'Белок' => '50 г', 'Вкус' => 'Chocolate'],
                'badges' => ['Масса', '1250 ккал'],
                'is_featured' => true,
                'trainer_pick' => true,
                'home_use' => false,
                'tags' => [2],
                'variants' => [
                    ['name' => 'Chocolate 3 кг', 'sku' => 'NF-GAINER-CHOC-3KG', 'options' => ['flavor' => 'Chocolate', 'size' => '3 кг'], 'price' => 5490, 'stock' => 15, 'image_url' => '/seed-images/products/mass-gainer-pro/main.webp', 'sort_order' => 1],
                    ['name' => 'Mass Fuel Kit', 'sku' => 'NF-GAINER-FUEL-KIT', 'options' => ['format' => 'гейнер + шейкер'], 'price' => 5990, 'stock' => 10, 'image_url' => '/seed-images/products/mass-gainer-pro/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'bcaa-5000',
                'name' => 'BCAA 5000',
                'short_description' => 'BCAA для восстановления, выносливости и поддержки мышц во время нагрузки.',
                'description' => 'Аминокислоты с разветвлённой цепью. 5 г на порцию, яркий вкус и удобный формат для тренировки.',
                'brand' => 'NashFit',
                'sku' => 'NF-BCAA-5000',
                'price' => 2490,
                'old_price' => 2790,
                'stock' => 100,
                'category_id' => $categories['amino-acids']->id,
                'image_url' => '/seed-images/products/bcaa-5000/main.webp',
                'gallery' => [
                    '/seed-images/products/bcaa-5000/main.webp',
                    '/seed-images/products/bcaa-5000/lifestyle.webp',
                ],
                'attributes' => ['BCAA' => '5 г', 'Вкус' => 'Berry Blast / Fruit Punch', 'Цель' => 'восстановление'],
                'badges' => ['Для тренировки', 'В наличии'],
                'is_featured' => true,
                'is_new' => true,
                'trainer_pick' => true,
                'home_use' => true,
                'tags' => [1, 3],
                'variants' => [
                    ['name' => 'Berry Blast 400 г', 'sku' => 'NF-BCAA-BERRY-400', 'options' => ['flavor' => 'Berry Blast', 'size' => '400 г'], 'price' => 2490, 'stock' => 60, 'image_url' => '/seed-images/products/bcaa-5000/main.webp', 'sort_order' => 1],
                    ['name' => 'Fruit Punch 390 г', 'sku' => 'NF-BCAA-FRUIT-390', 'options' => ['flavor' => 'Fruit Punch', 'size' => '390 г'], 'price' => 2490, 'stock' => 40, 'image_url' => '/seed-images/products/bcaa-5000/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'l-glutamine',
                'name' => 'L-Glutamine',
                'short_description' => 'Глютамин для восстановления после интенсивных тренировок.',
                'description' => 'Глютамин 5 г на порцию. Подходит для восстановления, поддержки иммунитета и режима после тяжёлых тренировок.',
                'brand' => 'NashFit',
                'sku' => 'NF-GLUTAMINE',
                'price' => 1990,
                'old_price' => 2290,
                'stock' => 80,
                'category_id' => $categories['amino-acids']->id,
                'image_url' => '/seed-images/products/l-glutamine/main.webp',
                'gallery' => [
                    '/seed-images/products/l-glutamine/main.webp',
                    '/seed-images/products/l-glutamine/lifestyle.webp',
                ],
                'attributes' => ['Порция' => '5 г', 'Вкус' => 'Unflavored', 'Формат' => 'порошок'],
                'badges' => ['Восстановление', 'Без вкуса'],
                'is_featured' => false,
                'trainer_pick' => true,
                'home_use' => true,
                'tags' => [3],
                'variants' => [
                    ['name' => 'Unflavored 300 г', 'sku' => 'NF-GLUTA-UNF-300', 'options' => ['flavor' => 'Unflavored', 'size' => '300 г'], 'price' => 1990, 'stock' => 45, 'image_url' => '/seed-images/products/l-glutamine/main.webp', 'sort_order' => 1],
                    ['name' => 'Recovery Kit', 'sku' => 'NF-GLUTA-REC-KIT', 'options' => ['format' => 'порошок + шейкер'], 'price' => 2490, 'stock' => 20, 'image_url' => '/seed-images/products/l-glutamine/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'omega-3-ultra',
                'name' => 'Omega-3 Ultra',
                'short_description' => 'Омега-3 высокой концентрации для сердца, суставов и общего здоровья.',
                'description' => 'Рыбий жир высокой концентрации. Поддерживает сердце, сосуды и суставы в период регулярных тренировок.',
                'brand' => 'NashFit',
                'sku' => 'NF-OMEGA-3',
                'price' => 1490,
                'old_price' => 1690,
                'stock' => 150,
                'category_id' => $categories['vitamins']->id,
                'image_url' => '/seed-images/products/omega-3-ultra/main.webp',
                'gallery' => [
                    '/seed-images/products/omega-3-ultra/main.webp',
                    '/seed-images/products/omega-3-ultra/lifestyle.webp',
                ],
                'attributes' => ['Дозировка' => '1000 мг', 'Формат' => 'softgels', 'Количество' => '120 капсул'],
                'badges' => ['Здоровье', 'Суставы'],
                'is_featured' => false,
                'trainer_pick' => false,
                'home_use' => true,
                'tags' => [1],
                'variants' => [
                    ['name' => '120 softgels', 'sku' => 'NF-OMEGA-120', 'options' => ['count' => '120 softgels'], 'price' => 1490, 'stock' => 80, 'image_url' => '/seed-images/products/omega-3-ultra/main.webp', 'sort_order' => 1],
                    ['name' => 'Wellness Pack', 'sku' => 'NF-OMEGA-WELLNESS', 'options' => ['format' => 'банка + wellness-сцена'], 'price' => 1690, 'stock' => 70, 'image_url' => '/seed-images/products/omega-3-ultra/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'multivitamin-sport',
                'name' => 'Multivitamin Sport',
                'short_description' => 'Комплекс витаминов и минералов для активных людей.',
                'description' => 'Ежедневная поддержка энергии, иммунитета и общего самочувствия при регулярных тренировках.',
                'brand' => 'NashFit',
                'sku' => 'NF-MULTI-SPORT',
                'price' => 1790,
                'old_price' => 1990,
                'stock' => 120,
                'category_id' => $categories['vitamins']->id,
                'image_url' => '/seed-images/products/multivitamin-sport/main.webp',
                'gallery' => [
                    '/seed-images/products/multivitamin-sport/main.webp',
                    '/seed-images/products/multivitamin-sport/lifestyle.webp',
                ],
                'attributes' => ['Формат' => 'таблетки / капсулы', 'Поддержка' => 'энергия, иммунитет, восстановление', 'Порций' => '30'],
                'badges' => ['Ежедневно', 'Витамины'],
                'is_featured' => true,
                'is_new' => true,
                'trainer_pick' => false,
                'home_use' => true,
                'tags' => [1],
                'variants' => [
                    ['name' => '90 tablets', 'sku' => 'NF-MULTI-90T', 'options' => ['count' => '90 tablets'], 'price' => 1790, 'stock' => 80, 'image_url' => '/seed-images/products/multivitamin-sport/main.webp', 'sort_order' => 1],
                    ['name' => '60 capsules lifestyle', 'sku' => 'NF-MULTI-60C-LIFE', 'options' => ['count' => '60 capsules'], 'price' => 1590, 'stock' => 40, 'image_url' => '/seed-images/products/multivitamin-sport/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'rezinovyy-espander',
                'name' => 'Резиновый эспандер',
                'short_description' => 'Набор эспандеров разной жёсткости для дома, зала и разминки.',
                'description' => 'Комплект эспандеров с несколькими уровнями сопротивления, ручками, креплением и сумкой для хранения.',
                'brand' => 'NashFit',
                'sku' => 'NF-BANDS-SET',
                'price' => 990,
                'old_price' => 1290,
                'stock' => 200,
                'category_id' => $categories['equipment']->id,
                'image_url' => '/seed-images/products/rezinovyy-espander/main.webp',
                'gallery' => [
                    '/seed-images/products/rezinovyy-espander/main.webp',
                    '/seed-images/products/rezinovyy-espander/lifestyle.webp',
                ],
                'attributes' => ['Уровни' => '10–50 lbs', 'Комплект' => 'ленты, ручки, крепление, мешок', 'Назначение' => 'домашние тренировки'],
                'badges' => ['Дом', 'Инвентарь'],
                'is_featured' => true,
                'trainer_pick' => true,
                'home_use' => true,
                'tags' => [5],
                'variants' => [
                    ['name' => '5 уровней сопротивления', 'sku' => 'NF-BANDS-5LEVELS', 'options' => ['levels' => '10/20/30/40/50 lbs'], 'price' => 990, 'stock' => 140, 'image_url' => '/seed-images/products/rezinovyy-espander/main.webp', 'sort_order' => 1],
                    ['name' => 'Home Workout Set', 'sku' => 'NF-BANDS-HOME-SET', 'options' => ['format' => 'комплект для дома'], 'price' => 1290, 'stock' => 60, 'image_url' => '/seed-images/products/rezinovyy-espander/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'kovrik-dlya-yogi',
                'name' => 'Коврик для йоги',
                'short_description' => 'Противоскользящий коврик 6 мм для йоги, растяжки и домашней практики.',
                'description' => 'Плотный коврик с текстурной поверхностью, ремнём для переноски и спокойным премиальным дизайном.',
                'brand' => 'NashFit',
                'sku' => 'NF-YOGA-MAT',
                'price' => 2490,
                'old_price' => 2790,
                'stock' => 60,
                'category_id' => $categories['equipment']->id,
                'image_url' => '/seed-images/products/kovrik-dlya-yogi/main.webp',
                'gallery' => [
                    '/seed-images/products/kovrik-dlya-yogi/main.webp',
                    '/seed-images/products/kovrik-dlya-yogi/lifestyle.webp',
                ],
                'attributes' => ['Толщина' => '6 мм', 'Поверхность' => 'anti-slip', 'Цвета' => 'sage / charcoal'],
                'badges' => ['Йога', 'Anti-slip'],
                'is_featured' => true,
                'trainer_pick' => false,
                'home_use' => true,
                'tags' => [4],
                'variants' => [
                    ['name' => 'Sage 6 мм', 'sku' => 'NF-YOGA-SAGE-6MM', 'options' => ['color' => 'Sage', 'thickness' => '6 мм'], 'price' => 2490, 'stock' => 35, 'image_url' => '/seed-images/products/kovrik-dlya-yogi/main.webp', 'sort_order' => 1],
                    ['name' => 'Charcoal 6 мм', 'sku' => 'NF-YOGA-CHARCOAL-6MM', 'options' => ['color' => 'Charcoal', 'thickness' => '6 мм'], 'price' => 2490, 'stock' => 25, 'image_url' => '/seed-images/products/kovrik-dlya-yogi/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'butylka-dlya-vody-1l',
                'name' => 'Бутылка для воды 1л',
                'short_description' => 'Спортивная бутылка 1 л с мерной шкалой и герметичной крышкой.',
                'description' => 'BPA-free бутылка для тренировок с удобной шкалой, ремешком и надёжной крышкой.',
                'brand' => 'NashFit',
                'sku' => 'NF-WATER-BOTTLE-1L',
                'price' => 590,
                'old_price' => 790,
                'stock' => 300,
                'category_id' => $categories['equipment']->id,
                'image_url' => '/seed-images/products/butylka-dlya-vody-1l/main.webp',
                'gallery' => [
                    '/seed-images/products/butylka-dlya-vody-1l/main.webp',
                    '/seed-images/products/butylka-dlya-vody-1l/lifestyle.webp',
                ],
                'attributes' => ['Объём' => '1 л', 'Материал' => 'BPA-free пластик', 'Шкала' => 'ml / oz'],
                'badges' => ['BPA-free', '1 литр'],
                'is_featured' => false,
                'trainer_pick' => false,
                'home_use' => true,
                'tags' => [5],
                'variants' => [
                    ['name' => 'Smoke 1 л', 'sku' => 'NF-BOTTLE-SMOKE-1L', 'options' => ['color' => 'Smoke', 'volume' => '1 л'], 'price' => 590, 'stock' => 160, 'image_url' => '/seed-images/products/butylka-dlya-vody-1l/main.webp', 'sort_order' => 1],
                    ['name' => 'Black Gym 1 л', 'sku' => 'NF-BOTTLE-BLACK-1L', 'options' => ['color' => 'Black', 'volume' => '1 л'], 'price' => 690, 'stock' => 140, 'image_url' => '/seed-images/products/butylka-dlya-vody-1l/lifestyle.webp', 'sort_order' => 2],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $tags = $productData['tags'] ?? [];
            $variants = $productData['variants'] ?? [];
            unset($productData['tags'], $productData['variants']);

            $payload = $this->filterColumns('products', $productData);
            $lookup = Schema::hasColumn('products', 'slug') ? ['slug' => $productData['slug']] : ['name' => $productData['name']];

            $product = Product::updateOrCreate($lookup, $payload);

            if (!empty($tags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($tags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $product->tags()->syncWithoutDetaching($selectedTags);
                }
            }

            if (class_exists(ProductVariant::class) && Schema::hasTable('product_variants')) {
                foreach ($variants as $variantData) {
                    $variantData['product_id'] = $product->id;
                    ProductVariant::updateOrCreate(
                        ['sku' => $variantData['sku']],
                        $this->filterColumns('product_variants', $variantData)
                    );
                }
            }
        }
    }

    private function filterColumns(string $table, array $payload): array
    {
        return collect($payload)
            ->filter(fn ($value, $key) => Schema::hasColumn($table, $key))
            ->all();
    }
}
