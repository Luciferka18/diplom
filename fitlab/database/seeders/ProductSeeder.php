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
        if (Schema::hasTable('cart_items')) {
            \Illuminate\Support\Facades\DB::table('cart_items')->delete();
        }
        if (Schema::hasTable('product_variants')) {
            ProductVariant::query()->delete();
        }
        Product::query()->delete();

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

        $tagRows = [
            ['name' => 'Восстановление', 'slug' => 'recovery'],
            ['name' => 'Набор массы', 'slug' => 'muscle-gain'],
            ['name' => 'Снижение веса', 'slug' => 'fat-loss'],
            ['name' => 'Домашние тренировки', 'slug' => 'home-workout'],
            ['name' => 'Выбор тренера', 'slug' => 'trainer-pick'],
        ];
        foreach ($tagRows as $tagData) {
            Tag::firstOrCreate(['slug' => $tagData['slug']], $tagData);
        }

        $categories = Category::all()->keyBy('slug');
        $tagIds = Tag::pluck('id')->toArray();

        $products = [
            [
                'slug' => 'whey-protein-gold-standard', 'name' => 'Whey Protein Gold Standard',
                'short_description' => 'Сывороточный протеин для добора белка после тренировки и в течение дня.',
                'description' => 'Сывороточный протеин премиум-класса. 24 г белка на порцию, быстрое усвоение и удобные варианты вкуса.',
                'brand' => 'NashFit', 'sku' => 'NF-WHEY-GS', 'price' => 4990, 'old_price' => 5490, 'stock' => 50,
                'category_id' => $categories['protein']->id, 'image_url' => '/seed-images/products/whey-protein-gold-standard/main.png',
                'gallery' => ['/seed-images/products/whey-protein-gold-standard/main.png', '/seed-images/products/whey-protein-gold-standard/lifestyle.png'],
                'attributes' => ['Белок' => '24 г', 'Формат' => 'порошок', 'Цель' => 'восстановление и набор белка'],
                'badges' => ['Выбор тренера', 'Для прогресса'], 'is_featured' => true, 'trainer_pick' => true, 'home_use' => true,
                'tags' => [2, 5],
                'variants' => [
                    ['name' => 'Chocolate 900 г', 'sku' => 'NF-WHEY-GS-CHOC-900', 'options' => ['flavor' => 'Chocolate', 'size' => '900 г'], 'price' => 4990, 'stock' => 24, 'image_url' => '/seed-images/products/whey-protein-gold-standard/main.png', 'sort_order' => 1],
                    ['name' => 'Vanilla 2 кг', 'sku' => 'NF-WHEY-GS-VAN-2KG', 'options' => ['flavor' => 'Vanilla', 'size' => '2 кг'], 'price' => 7990, 'stock' => 18, 'image_url' => '/seed-images/products/whey-protein-gold-standard/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'casein-protein', 'name' => 'Casein Protein',
                'short_description' => 'Казеин для ночного восстановления и длительного насыщения аминокислотами.',
                'description' => 'Казеиновый протеин для вечернего приёма и спокойного восстановления.',
                'brand' => 'NashFit', 'sku' => 'NF-CASEIN', 'price' => 4490, 'old_price' => 4990, 'stock' => 30,
                'category_id' => $categories['protein']->id, 'image_url' => '/seed-images/products/casein-protein/main.png',
                'gallery' => ['/seed-images/products/casein-protein/main.png', '/seed-images/products/casein-protein/lifestyle.png'],
                'attributes' => ['Тип' => 'мицеллярный казеин', 'Цель' => 'ночное восстановление'],
                'badges' => ['Восстановление'], 'is_featured' => true, 'trainer_pick' => true, 'home_use' => true,
                'tags' => [1, 2],
                'variants' => [
                    ['name' => 'Vanilla 900 г', 'sku' => 'NF-CASEIN-VAN-900', 'options' => ['flavor' => 'Vanilla', 'size' => '900 г'], 'price' => 4490, 'stock' => 16, 'image_url' => '/seed-images/products/casein-protein/main.png', 'sort_order' => 1],
                    ['name' => 'Recovery Set', 'sku' => 'NF-CASEIN-SET', 'options' => ['format' => 'банка + шейкер'], 'price' => 4990, 'stock' => 12, 'image_url' => '/seed-images/products/casein-protein/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'mass-gainer-pro', 'name' => 'Mass Gainer Pro',
                'short_description' => 'Высококалорийный гейнер для набора массы и восполнения энергии.',
                'description' => 'Подходит для силовых циклов и тех, кому сложно добрать калории обычной едой.',
                'brand' => 'NashFit', 'sku' => 'NF-GAINER', 'price' => 3990, 'old_price' => 4490, 'stock' => 45,
                'category_id' => $categories['gainers']->id, 'image_url' => '/seed-images/products/mass-gainer-pro/main.png',
                'gallery' => ['/seed-images/products/mass-gainer-pro/main.png', '/seed-images/products/mass-gainer-pro/lifestyle.png'],
                'attributes' => ['Калории' => '380 ккал', 'Белок' => '28 г', 'Углеводы' => '52 г'],
                'badges' => ['Масса'], 'is_featured' => true, 'home_use' => true,
                'tags' => [2],
                'variants' => [
                    ['name' => 'Chocolate 1.5 кг', 'sku' => 'NF-GAINER-CHOC-1500', 'options' => ['flavor' => 'Chocolate', 'size' => '1.5 кг'], 'price' => 3990, 'stock' => 25, 'image_url' => '/seed-images/products/mass-gainer-pro/main.png', 'sort_order' => 1],
                    ['name' => 'Vanilla 3 кг', 'sku' => 'NF-GAINER-VAN-3000', 'options' => ['flavor' => 'Vanilla', 'size' => '3 кг'], 'price' => 6490, 'stock' => 20, 'image_url' => '/seed-images/products/mass-gainer-pro/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'bcaa-5000', 'name' => 'BCAA 5000',
                'short_description' => 'BCAA для восстановления, выносливости и защиты мышц при нагрузке.',
                'description' => 'Классическая формула BCAA 2:1:1 для тренировочных циклов с большим объёмом.',
                'brand' => 'NashFit', 'sku' => 'NF-BCAA-5000', 'price' => 2490, 'old_price' => 2790, 'stock' => 100,
                'category_id' => $categories['amino-acids']->id, 'image_url' => '/seed-images/products/bcaa-5000/main.png',
                'gallery' => ['/seed-images/products/bcaa-5000/main.png', '/seed-images/products/bcaa-5000/lifestyle.png'],
                'attributes' => ['Соотношение' => '2:1:1', 'Порций' => '30'],
                'badges' => ['Выбор тренера', 'Новинка'], 'is_featured' => true, 'is_new' => true, 'trainer_pick' => true, 'home_use' => true,
                'tags' => [1, 5],
                'variants' => [
                    ['name' => 'Orange 300 г', 'sku' => 'NF-BCAA-ORG-300', 'options' => ['flavor' => 'Orange', 'size' => '300 г'], 'price' => 2490, 'stock' => 60, 'image_url' => '/seed-images/products/bcaa-5000/main.png', 'sort_order' => 1],
                    ['name' => 'Black Edition', 'sku' => 'NF-BCAA-BLACK', 'options' => ['edition' => 'Black'], 'price' => 2690, 'stock' => 40, 'image_url' => '/seed-images/products/bcaa-5000/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'l-glutamine', 'name' => 'L-Glutamine',
                'short_description' => 'Глютамин для поддержки восстановления, иммунитета и объёма тренировок.',
                'description' => 'Удобная формула для приёма после нагрузки и в восстановительные периоды.',
                'brand' => 'NashFit', 'sku' => 'NF-GLUTA', 'price' => 1590, 'old_price' => 1890, 'stock' => 80,
                'category_id' => $categories['amino-acids']->id, 'image_url' => '/seed-images/products/l-glutamine/main.png',
                'gallery' => ['/seed-images/products/l-glutamine/main.png', '/seed-images/products/l-glutamine/lifestyle.png'],
                'attributes' => ['Формат' => 'порошок', 'Порций' => '40'],
                'badges' => ['Восстановление'], 'home_use' => true,
                'tags' => [1],
                'variants' => [
                    ['name' => 'Unflavored 300 г', 'sku' => 'NF-GLUTA-300', 'options' => ['flavor' => 'Unflavored', 'size' => '300 г'], 'price' => 1590, 'stock' => 50, 'image_url' => '/seed-images/products/l-glutamine/main.png', 'sort_order' => 1],
                    ['name' => 'Recovery Mix', 'sku' => 'NF-GLUTA-MIX', 'options' => ['format' => 'лайфстайл'], 'price' => 1690, 'stock' => 30, 'image_url' => '/seed-images/products/l-glutamine/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'omega-3-ultra', 'name' => 'Omega-3 Ultra',
                'short_description' => 'Омега-3 для поддержки суставов, сердца и общего здоровья.',
                'description' => 'Незаменимые жирные кислоты для активных людей.',
                'brand' => 'NashFit', 'sku' => 'NF-OMEGA', 'price' => 1490, 'old_price' => 1690, 'stock' => 150,
                'category_id' => $categories['vitamins']->id, 'image_url' => '/seed-images/products/omega-3-ultra/main.png',
                'gallery' => ['/seed-images/products/omega-3-ultra/main.png', '/seed-images/products/omega-3-ultra/lifestyle.png'],
                'attributes' => ['Дозировка' => '1000 мг', 'Количество' => '120 капсул'],
                'badges' => ['Здоровье'], 'home_use' => true,
                'tags' => [1],
                'variants' => [
                    ['name' => '120 softgels', 'sku' => 'NF-OMEGA-120', 'options' => ['count' => '120 softgels'], 'price' => 1490, 'stock' => 80, 'image_url' => '/seed-images/products/omega-3-ultra/main.png', 'sort_order' => 1],
                    ['name' => 'Wellness Pack', 'sku' => 'NF-OMEGA-WELLNESS', 'options' => ['format' => 'wellness'], 'price' => 1690, 'stock' => 70, 'image_url' => '/seed-images/products/omega-3-ultra/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'multivitamin-sport', 'name' => 'Multivitamin Sport',
                'short_description' => 'Комплекс витаминов и минералов для активных людей.',
                'description' => 'Ежедневная поддержка энергии, иммунитета и общего самочувствия.',
                'brand' => 'NashFit', 'sku' => 'NF-MULTI-SPORT', 'price' => 1790, 'old_price' => 1990, 'stock' => 120,
                'category_id' => $categories['vitamins']->id, 'image_url' => '/seed-images/products/multivitamin-sport/main.png',
                'gallery' => ['/seed-images/products/multivitamin-sport/main.png', '/seed-images/products/multivitamin-sport/lifestyle.png'],
                'attributes' => ['Формат' => 'таблетки', 'Поддержка' => 'энергия, иммунитет'],
                'badges' => ['Новинка'], 'is_featured' => true, 'is_new' => true, 'home_use' => true,
                'tags' => [1],
                'variants' => [
                    ['name' => '90 tablets', 'sku' => 'NF-MULTI-90T', 'options' => ['count' => '90 tablets'], 'price' => 1790, 'stock' => 80, 'image_url' => '/seed-images/products/multivitamin-sport/main.png', 'sort_order' => 1],
                    ['name' => '60 capsules', 'sku' => 'NF-MULTI-60C', 'options' => ['count' => '60 capsules'], 'price' => 1590, 'stock' => 40, 'image_url' => '/seed-images/products/multivitamin-sport/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'rezinovyy-espander', 'name' => 'Резиновый эспандер',
                'short_description' => 'Набор эспандеров разной жёсткости для дома, зала и разминки.',
                'description' => 'Комплект эспандеров с несколькими уровнями сопротивления и удобной сумкой.',
                'brand' => 'NashFit', 'sku' => 'NF-BANDS-SET', 'price' => 990, 'old_price' => 1290, 'stock' => 200,
                'category_id' => $categories['equipment']->id, 'image_url' => '/seed-images/products/rezinovyy-espander/main.png',
                'gallery' => ['/seed-images/products/rezinovyy-espander/main.png', '/seed-images/products/rezinovyy-espander/lifestyle.png'],
                'attributes' => ['Уровни' => '10–50 lbs', 'Назначение' => 'домашние тренировки'],
                'badges' => ['Выбор тренера'], 'is_featured' => true, 'trainer_pick' => true, 'home_use' => true,
                'tags' => [4, 5],
                'variants' => [
                    ['name' => '5 уровней сопротивления', 'sku' => 'NF-BANDS-5', 'options' => ['levels' => '10/20/30/40/50 lbs'], 'price' => 990, 'stock' => 140, 'image_url' => '/seed-images/products/rezinovyy-espander/main.png', 'sort_order' => 1],
                    ['name' => 'Home Set', 'sku' => 'NF-BANDS-HOME', 'options' => ['format' => 'комплект'], 'price' => 1290, 'stock' => 60, 'image_url' => '/seed-images/products/rezinovyy-espander/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'kovrik-dlya-yogi', 'name' => 'Коврик для йоги',
                'short_description' => 'Противоскользящий коврик 6 мм для йоги, растяжки и домашней практики.',
                'description' => 'Плотный коврик с текстурной поверхностью и ремнём для переноски.',
                'brand' => 'NashFit', 'sku' => 'NF-YOGA-MAT', 'price' => 2490, 'old_price' => 2790, 'stock' => 60,
                'category_id' => $categories['equipment']->id, 'image_url' => '/seed-images/products/kovrik-dlya-yogi/main.png',
                'gallery' => ['/seed-images/products/kovrik-dlya-yogi/main.png', '/seed-images/products/kovrik-dlya-yogi/lifestyle.png'],
                'attributes' => ['Толщина' => '6 мм', 'Поверхность' => 'anti-slip'],
                'badges' => ['Йога'], 'is_featured' => true, 'home_use' => true,
                'tags' => [4],
                'variants' => [
                    ['name' => 'Sage 6 мм', 'sku' => 'NF-YOGA-SAGE', 'options' => ['color' => 'Sage', 'thickness' => '6 мм'], 'price' => 2490, 'stock' => 35, 'image_url' => '/seed-images/products/kovrik-dlya-yogi/main.png', 'sort_order' => 1],
                    ['name' => 'Charcoal 6 мм', 'sku' => 'NF-YOGA-CHAR', 'options' => ['color' => 'Charcoal', 'thickness' => '6 мм'], 'price' => 2490, 'stock' => 25, 'image_url' => '/seed-images/products/kovrik-dlya-yogi/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'butylka-dlya-vody-1l', 'name' => 'Бутылка для воды 1л',
                'short_description' => 'Спортивная бутылка 1 л с мерной шкалой и герметичной крышкой.',
                'description' => 'BPA-free бутылка для тренировок с удобной шкалой и ремешком.',
                'brand' => 'NashFit', 'sku' => 'NF-WATER-BOTTLE-1L', 'price' => 590, 'old_price' => 790, 'stock' => 300,
                'category_id' => $categories['equipment']->id, 'image_url' => '/seed-images/products/butylka-dlya-vody-1l/main.png',
                'gallery' => ['/seed-images/products/butylka-dlya-vody-1l/main.png', '/seed-images/products/butylka-dlya-vody-1l/lifestyle.png'],
                'attributes' => ['Объём' => '1 л', 'Материал' => 'BPA-free пластик'],
                'badges' => ['1 литр'], 'home_use' => true,
                'tags' => [4],
                'variants' => [
                    ['name' => 'Smoke 1 л', 'sku' => 'NF-BOTTLE-SMOKE', 'options' => ['color' => 'Smoke', 'volume' => '1 л'], 'price' => 590, 'stock' => 160, 'image_url' => '/seed-images/products/butylka-dlya-vody-1l/main.png', 'sort_order' => 1],
                    ['name' => 'Black Gym 1 л', 'sku' => 'NF-BOTTLE-BLACK', 'options' => ['color' => 'Black', 'volume' => '1 л'], 'price' => 690, 'stock' => 140, 'image_url' => '/seed-images/products/butylka-dlya-vody-1l/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'magniy-recovery', 'name' => 'Магний Recovery',
                'short_description' => 'Магний для вечернего восстановления, режима сна и уменьшения мышечного напряжения.',
                'description' => 'Формула для тех, кто тренируется регулярно и хочет поддержать восстановление, сон и общее самочувствие.',
                'brand' => 'NashFit', 'sku' => 'NF-MAG-RECOVERY', 'price' => 890, 'old_price' => 1090, 'stock' => 24,
                'category_id' => $categories['vitamins']->id, 'image_url' => '/seed-images/products/magniy-recovery/main.png',
                'gallery' => ['/seed-images/products/magniy-recovery/main.png', '/seed-images/products/magniy-recovery/lifestyle.png'],
                'attributes' => ['Форма' => 'цитрат', 'Порций' => '60'],
                'badges' => ['Восстановление'], 'is_featured' => true, 'home_use' => true,
                'tags' => [1],
                'variants' => [
                    ['name' => '60 capsules', 'sku' => 'NF-MAG-60', 'options' => ['count' => '60 capsules'], 'price' => 890, 'stock' => 12, 'image_url' => '/seed-images/products/magniy-recovery/main.png', 'sort_order' => 1],
                    ['name' => 'Recovery Scene', 'sku' => 'NF-MAG-SCENE', 'options' => ['format' => 'lifestyle'], 'price' => 990, 'stock' => 12, 'image_url' => '/seed-images/products/magniy-recovery/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'preworkout-focus', 'name' => 'Предтренировочный комплекс Focus',
                'short_description' => 'Предтренировочный комплекс для концентрации, энергии и бодрого старта.',
                'description' => 'Подходит для силовых и функциональных тренировок, когда нужен тонус и фокус.',
                'brand' => 'NashFit', 'sku' => 'NF-FOCUS', 'price' => 1890, 'old_price' => 2290, 'stock' => 23,
                'category_id' => $categories['sports-nutrition']->id, 'image_url' => '/seed-images/products/preworkout-focus/main.png',
                'gallery' => ['/seed-images/products/preworkout-focus/main.png', '/seed-images/products/preworkout-focus/lifestyle.png'],
                'attributes' => ['Эффект' => 'энергия и фокус', 'Порций' => '25'],
                'badges' => ['Выбор тренера'], 'is_featured' => true, 'trainer_pick' => true, 'home_use' => true,
                'tags' => [5],
                'variants' => [
                    ['name' => 'Berry 300 г', 'sku' => 'NF-FOCUS-BERRY', 'options' => ['flavor' => 'Berry', 'size' => '300 г'], 'price' => 1890, 'stock' => 12, 'image_url' => '/seed-images/products/preworkout-focus/main.png', 'sort_order' => 1],
                    ['name' => 'Studio Shot', 'sku' => 'NF-FOCUS-STUDIO', 'options' => ['format' => 'studio'], 'price' => 1990, 'stock' => 11, 'image_url' => '/seed-images/products/preworkout-focus/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'protein-bars-12', 'name' => 'Протеиновые батончики, 12 шт.',
                'short_description' => 'Коробка белковых батончиков для перекуса после тренировки, работы и поездок.',
                'description' => 'Удобный формат для тех, кто хочет держать белок под рукой в офисе, дороге или после тренировки.',
                'brand' => 'NashFit', 'sku' => 'NF-BARS-12', 'price' => 1690, 'old_price' => 1890, 'stock' => 31,
                'category_id' => $categories['sports-nutrition']->id, 'image_url' => '/seed-images/products/protein-bars-12/main.png',
                'gallery' => ['/seed-images/products/protein-bars-12/main.png', '/seed-images/products/protein-bars-12/lifestyle.png'],
                'attributes' => ['Белок' => '16 г', 'Количество' => '12 шт.'],
                'badges' => ['Новинка'], 'is_featured' => true, 'is_new' => true, 'home_use' => true,
                'tags' => [3],
                'variants' => [
                    ['name' => 'Chocolate Mix', 'sku' => 'NF-BARS-CHOC', 'options' => ['flavor' => 'Chocolate mix'], 'price' => 1690, 'stock' => 16, 'image_url' => '/seed-images/products/protein-bars-12/main.png', 'sort_order' => 1],
                    ['name' => 'Gym Snack Box', 'sku' => 'NF-BARS-SNACK', 'options' => ['format' => 'box'], 'price' => 1790, 'stock' => 15, 'image_url' => '/seed-images/products/protein-bars-12/lifestyle.png', 'sort_order' => 2],
                ],
            ],
            [
                'slug' => 'creatine-monohydrate', 'name' => 'Креатин моногидрат',
                'short_description' => 'Классический креатин моногидрат для силового прогресса и лучшей работы в базовых движениях.',
                'description' => 'Надёжный базовый продукт для роста силовых показателей, объёма работы и качества восстановления.',
                'brand' => 'NashFit', 'sku' => 'NF-CREATINE', 'price' => 1290, 'old_price' => 1490, 'stock' => 36,
                'category_id' => $categories['sports-nutrition']->id, 'image_url' => '/seed-images/products/creatine-monohydrate/main.png',
                'gallery' => ['/seed-images/products/creatine-monohydrate/main.png', '/seed-images/products/creatine-monohydrate/lifestyle.png'],
                'attributes' => ['Формат' => 'порошок', 'Порций' => '50'],
                'badges' => ['Хит'], 'is_featured' => true, 'home_use' => true,
                'tags' => [2],
                'variants' => [
                    ['name' => '300 г', 'sku' => 'NF-CREATINE-300', 'options' => ['size' => '300 г'], 'price' => 1290, 'stock' => 20, 'image_url' => '/seed-images/products/creatine-monohydrate/main.png', 'sort_order' => 1],
                    ['name' => 'Strength Scene', 'sku' => 'NF-CREATINE-SCENE', 'options' => ['format' => 'scene'], 'price' => 1390, 'stock' => 16, 'image_url' => '/seed-images/products/creatine-monohydrate/lifestyle.png', 'sort_order' => 2],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $productTags = $productData['tags'] ?? [];
            $variants = $productData['variants'] ?? [];
            unset($productData['tags'], $productData['variants']);

            $payload = $this->filterColumns('products', $productData);
            $lookup = Schema::hasColumn('products', 'slug') ? ['slug' => $productData['slug']] : ['name' => $productData['name']];
            $product = Product::updateOrCreate($lookup, $payload);

            if (!empty($productTags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($productTags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $product->tags()->sync($selectedTags);
                }
            }

            if (class_exists(ProductVariant::class) && Schema::hasTable('product_variants')) {
                foreach ($variants as $variantData) {
                    $variantData['product_id'] = $product->id;
                    ProductVariant::updateOrCreate(['sku' => $variantData['sku']], $this->filterColumns('product_variants', $variantData));
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
