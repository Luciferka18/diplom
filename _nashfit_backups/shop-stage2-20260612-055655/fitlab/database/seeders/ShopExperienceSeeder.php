<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ShopCollection;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShopExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Спортивное питание', 'slug' => 'nutrition'],
            ['name' => 'Инвентарь', 'slug' => 'equipment'],
            ['name' => 'Восстановление', 'slug' => 'recovery'],
            ['name' => 'Одежда и аксессуары', 'slug' => 'apparel'],
            ['name' => 'Для дома', 'slug' => 'home-fitness'],
        ])->mapWithKeys(function ($item) {
            $category = Category::updateOrCreate(['slug' => $item['slug']], ['name' => $item['name']]);
            return [$item['slug'] => $category];
        });

        $items = [
            ['slug'=>'whey-protein-pro','name'=>'Сывороточный протеин Pro','short'=>'25 г белка в порции без лишнего сахара.','desc'=>'Протеин для восстановления после силовых и функциональных тренировок. Хорошо растворяется и подходит для ежедневного рациона.','brand'=>'НашФит Nutrition','price'=>2490,'old'=>2790,'cat'=>'nutrition','image'=>'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80','featured'=>1,'new'=>0,'trainer'=>1,'home'=>1,'badges'=>['Хит','Выбор тренера'],'attrs'=>['Белок'=>'25 г','Порций'=>'30','Без сахара'=>'Да'],'variants'=>[
                ['name'=>'Шоколад · 900 г','sku'=>'NF-WHEY-CHO-900','options'=>['Вкус'=>'Шоколад','Объём'=>'900 г'],'price'=>2490,'old_price'=>2790,'stock'=>18],
                ['name'=>'Ваниль · 900 г','sku'=>'NF-WHEY-VAN-900','options'=>['Вкус'=>'Ваниль','Объём'=>'900 г'],'price'=>2490,'stock'=>14],
                ['name'=>'Клубника · 450 г','sku'=>'NF-WHEY-STR-450','options'=>['Вкус'=>'Клубника','Объём'=>'450 г'],'price'=>1490,'stock'=>9],
            ]],
            ['slug'=>'plant-protein','name'=>'Растительный протеин','short'=>'Гороховый и рисовый белок для тех, кто избегает лактозы.','desc'=>'Мягкая формула на растительной основе. Подходит для восстановления и увеличения белка в рационе.','brand'=>'НашФит Nutrition','price'=>2190,'old'=>null,'cat'=>'nutrition','image'=>'https://images.unsplash.com/photo-1622484212110-0c65f49e6ec6?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>1,'trainer'=>0,'home'=>1,'badges'=>['Новинка'],'attrs'=>['Белок'=>'22 г','Веганский'=>'Да'],'variants'=>[
                ['name'=>'Какао · 700 г','sku'=>'NF-PLANT-COC-700','options'=>['Вкус'=>'Какао','Объём'=>'700 г'],'price'=>2190,'stock'=>12],
                ['name'=>'Банан · 700 г','sku'=>'NF-PLANT-BAN-700','options'=>['Вкус'=>'Банан','Объём'=>'700 г'],'price'=>2190,'stock'=>8],
            ]],
            ['slug'=>'creatine-mono','name'=>'Креатин моногидрат','short'=>'Чистый креатин для силы и мощности.','desc'=>'Классический креатин моногидрат без вкусовых добавок. Подходит для регулярных силовых тренировок.','brand'=>'НашФит Nutrition','price'=>1290,'old'=>1490,'cat'=>'nutrition','image'=>'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80','featured'=>1,'new'=>0,'trainer'=>1,'home'=>1,'badges'=>['Хит'],'attrs'=>['Состав'=>'100% креатин','Порций'=>'60'],'variants'=>[
                ['name'=>'300 г','sku'=>'NF-CREATINE-300','options'=>['Объём'=>'300 г'],'price'=>1290,'old_price'=>1490,'stock'=>25],
                ['name'=>'500 г','sku'=>'NF-CREATINE-500','options'=>['Объём'=>'500 г'],'price'=>1890,'stock'=>11],
            ]],
            ['slug'=>'shaker-steel','name'=>'Стальной шейкер 750 мл','short'=>'Герметичный шейкер с мерной шкалой.','desc'=>'Не впитывает запахи, легко моется и сохраняет температуру напитка.','brand'=>'НашФит','price'=>1190,'old'=>null,'cat'=>'apparel','image'=>'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>1,'trainer'=>0,'home'=>1,'badges'=>['Новинка'],'attrs'=>['Объём'=>'750 мл','Материал'=>'Сталь'],'variants'=>[
                ['name'=>'Графит','sku'=>'NF-SHAKER-GRAPHITE','options'=>['Цвет'=>'Графит'],'price'=>1190,'stock'=>16],
                ['name'=>'Бирюзовый','sku'=>'NF-SHAKER-MINT','options'=>['Цвет'=>'Бирюзовый'],'price'=>1190,'stock'=>10],
            ]],
            ['slug'=>'fitness-mat-pro','name'=>'Коврик для фитнеса Pro','short'=>'Плотный нескользящий коврик для дома и зала.','desc'=>'Комфортная толщина, устойчивое покрытие и ремень для переноски.','brand'=>'НашФит Gear','price'=>2290,'old'=>2690,'cat'=>'equipment','image'=>'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=1200&q=80','featured'=>1,'new'=>0,'trainer'=>1,'home'=>1,'badges'=>['Выбор тренера','Для дома'],'attrs'=>['Толщина'=>'8 мм','Длина'=>'183 см'],'variants'=>[
                ['name'=>'Тёмно-синий','sku'=>'NF-MAT-NAVY','options'=>['Цвет'=>'Тёмно-синий'],'price'=>2290,'old_price'=>2690,'stock'=>20],
                ['name'=>'Мятный','sku'=>'NF-MAT-MINT','options'=>['Цвет'=>'Мятный'],'price'=>2290,'stock'=>7],
            ]],
            ['slug'=>'resistance-bands-set','name'=>'Набор фитнес-резинок','short'=>'Пять уровней сопротивления для всего тела.','desc'=>'Комплект для разминки, силовой работы и реабилитационных упражнений.','brand'=>'НашФит Gear','price'=>1590,'old'=>1890,'cat'=>'equipment','image'=>'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=1200&q=80','featured'=>1,'new'=>0,'trainer'=>1,'home'=>1,'badges'=>['Хит','Для программы'],'attrs'=>['Уровней'=>'5','Чехол'=>'В комплекте'],'variants'=>[
                ['name'=>'Латексные','sku'=>'NF-BANDS-LATEX','options'=>['Материал'=>'Латекс'],'price'=>1590,'old_price'=>1890,'stock'=>31],
                ['name'=>'Тканевые','sku'=>'NF-BANDS-FABRIC','options'=>['Материал'=>'Ткань'],'price'=>2190,'stock'=>15],
            ]],
            ['slug'=>'adjustable-dumbbell','name'=>'Разборная гантель','short'=>'Компактная гантель для домашней силовой тренировки.','desc'=>'Удобный набор дисков с надёжными замками. Вес меняется за несколько секунд.','brand'=>'НашФит Gear','price'=>3990,'old'=>4490,'cat'=>'home-fitness','image'=>'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&w=1200&q=80','featured'=>1,'new'=>0,'trainer'=>0,'home'=>1,'badges'=>['Для дома'],'attrs'=>['Покрытие'=>'Неопрен','Замки'=>'Резьбовые'],'variants'=>[
                ['name'=>'До 10 кг','sku'=>'NF-DUMB-10','options'=>['Максимальный вес'=>'10 кг'],'price'=>3990,'old_price'=>4490,'stock'=>8],
                ['name'=>'До 20 кг','sku'=>'NF-DUMB-20','options'=>['Максимальный вес'=>'20 кг'],'price'=>6990,'stock'=>5],
            ]],
            ['slug'=>'kettlebell-soft','name'=>'Мягкая гиря','short'=>'Безопасная гиря для функциональных тренировок дома.','desc'=>'Мягкое внешнее покрытие защищает пол и делает тренировки комфортнее.','brand'=>'НашФит Gear','price'=>2490,'old'=>null,'cat'=>'home-fitness','image'=>'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>1,'trainer'=>0,'home'=>1,'badges'=>['Новинка','Для дома'],'attrs'=>['Покрытие'=>'Мягкое'],'variants'=>[
                ['name'=>'6 кг','sku'=>'NF-KETTLE-6','options'=>['Вес'=>'6 кг'],'price'=>2490,'stock'=>12],
                ['name'=>'10 кг','sku'=>'NF-KETTLE-10','options'=>['Вес'=>'10 кг'],'price'=>3290,'stock'=>7],
                ['name'=>'14 кг','sku'=>'NF-KETTLE-14','options'=>['Вес'=>'14 кг'],'price'=>4190,'stock'=>4],
            ]],
            ['slug'=>'foam-roller','name'=>'Массажный ролл','short'=>'Ролл средней жёсткости для восстановления мышц.','desc'=>'Помогает снять напряжение после тренировки и улучшить мобильность.','brand'=>'НашФит Recovery','price'=>1690,'old'=>1990,'cat'=>'recovery','image'=>'https://images.unsplash.com/photo-1616699002805-0741e1e4a9c5?auto=format&fit=crop&w=1200&q=80','featured'=>1,'new'=>0,'trainer'=>1,'home'=>1,'badges'=>['Восстановление','Выбор тренера'],'attrs'=>['Длина'=>'45 см','Жёсткость'=>'Средняя'],'variants'=>[
                ['name'=>'Чёрный','sku'=>'NF-ROLLER-BLACK','options'=>['Цвет'=>'Чёрный'],'price'=>1690,'old_price'=>1990,'stock'=>19],
                ['name'=>'Бирюзовый','sku'=>'NF-ROLLER-MINT','options'=>['Цвет'=>'Бирюзовый'],'price'=>1690,'stock'=>9],
            ]],
            ['slug'=>'massage-ball-set','name'=>'Набор массажных мячей','short'=>'Точечная работа с напряжёнными мышцами.','desc'=>'Два мяча разной жёсткости для стоп, спины, плеч и ягодичных мышц.','brand'=>'НашФит Recovery','price'=>890,'old'=>null,'cat'=>'recovery','image'=>'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>0,'trainer'=>1,'home'=>1,'badges'=>['Выбор тренера'],'attrs'=>['Количество'=>'2 шт.'],'variants'=>[]],
            ['slug'=>'lifting-straps','name'=>'Лямки для тяги','short'=>'Помогают удерживать штангу и гантели в тяжёлых подходах.','desc'=>'Плотная ткань и мягкая подкладка для комфортного хвата.','brand'=>'НашФит Gear','price'=>790,'old'=>990,'cat'=>'apparel','image'=>'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>0,'trainer'=>1,'home'=>0,'badges'=>['Силовой тренинг'],'attrs'=>['Материал'=>'Хлопок'],'variants'=>[
                ['name'=>'Чёрные','sku'=>'NF-STRAPS-BLACK','options'=>['Цвет'=>'Чёрный'],'price'=>790,'old_price'=>990,'stock'=>27],
                ['name'=>'Красные','sku'=>'NF-STRAPS-RED','options'=>['Цвет'=>'Красный'],'price'=>790,'stock'=>13],
            ]],
            ['slug'=>'training-gloves','name'=>'Перчатки для тренировок','short'=>'Защита ладоней и уверенный хват.','desc'=>'Дышащая ткань, регулируемая застёжка и нескользящая ладонь.','brand'=>'НашФит Gear','price'=>1390,'old'=>null,'cat'=>'apparel','image'=>'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>1,'trainer'=>0,'home'=>0,'badges'=>['Новинка'],'attrs'=>['Материал'=>'Синтетика'],'variants'=>[
                ['name'=>'S','sku'=>'NF-GLOVES-S','options'=>['Размер'=>'S'],'price'=>1390,'stock'=>8],
                ['name'=>'M','sku'=>'NF-GLOVES-M','options'=>['Размер'=>'M'],'price'=>1390,'stock'=>14],
                ['name'=>'L','sku'=>'NF-GLOVES-L','options'=>['Размер'=>'L'],'price'=>1390,'stock'=>10],
            ]],
            ['slug'=>'sports-bottle','name'=>'Спортивная бутылка 1 л','short'=>'Удобная бутылка с отметками времени.','desc'=>'Помогает поддерживать питьевой режим в течение дня и тренировки.','brand'=>'НашФит','price'=>990,'old'=>1190,'cat'=>'apparel','image'=>'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>0,'trainer'=>0,'home'=>1,'badges'=>['Хит'],'attrs'=>['Объём'=>'1 л','BPA free'=>'Да'],'variants'=>[
                ['name'=>'Прозрачная','sku'=>'NF-BOTTLE-CLEAR','options'=>['Цвет'=>'Прозрачный'],'price'=>990,'old_price'=>1190,'stock'=>22],
                ['name'=>'Дымчатая','sku'=>'NF-BOTTLE-SMOKE','options'=>['Цвет'=>'Дымчатый'],'price'=>990,'stock'=>17],
            ]],
            ['slug'=>'jump-rope-speed','name'=>'Скоростная скакалка','short'=>'Регулируемая скакалка для кардио и разминки.','desc'=>'Лёгкий трос и подшипники для быстрых вращений.','brand'=>'НашФит Gear','price'=>1290,'old'=>null,'cat'=>'equipment','image'=>'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>0,'trainer'=>0,'home'=>1,'badges'=>['Кардио'],'attrs'=>['Длина'=>'Регулируемая'],'variants'=>[]],
            ['slug'=>'yoga-blocks','name'=>'Блоки для йоги, 2 шт.','short'=>'Опора для растяжки, баланса и мобильности.','desc'=>'Лёгкие и плотные EVA-блоки с приятной поверхностью.','brand'=>'НашФит Gear','price'=>1190,'old'=>null,'cat'=>'home-fitness','image'=>'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>1,'trainer'=>0,'home'=>1,'badges'=>['Для дома'],'attrs'=>['Материал'=>'EVA'],'variants'=>[
                ['name'=>'Мятные','sku'=>'NF-YOGA-BLOCK-MINT','options'=>['Цвет'=>'Мятный'],'price'=>1190,'stock'=>12],
                ['name'=>'Графитовые','sku'=>'NF-YOGA-BLOCK-GRAPH','options'=>['Цвет'=>'Графитовый'],'price'=>1190,'stock'=>11],
            ]],
            ['slug'=>'electrolyte-mix','name'=>'Электролиты без сахара','short'=>'Минеральный напиток для интенсивных тренировок.','desc'=>'Поддерживает водно-солевой баланс во время продолжительной нагрузки.','brand'=>'НашФит Nutrition','price'=>1090,'old'=>null,'cat'=>'nutrition','image'=>'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80','featured'=>0,'new'=>1,'trainer'=>1,'home'=>1,'badges'=>['Новинка'],'attrs'=>['Порций'=>'20','Сахар'=>'0 г'],'variants'=>[
                ['name'=>'Лимон','sku'=>'NF-ELECTRO-LEMON','options'=>['Вкус'=>'Лимон'],'price'=>1090,'stock'=>21],
                ['name'=>'Малина','sku'=>'NF-ELECTRO-RASP','options'=>['Вкус'=>'Малина'],'price'=>1090,'stock'=>16],
            ]],
        ];

        $products = collect();
        foreach ($items as $item) {
            $product = Product::updateOrCreate(['slug' => $item['slug']], [
                'name'=>$item['name'],'short_description'=>$item['short'],'description'=>$item['desc'],'brand'=>$item['brand'],
                'sku'=>'NF-'.Str::upper(substr(str_replace('-', '', $item['slug']), 0, 12)),'price'=>$item['price'],'old_price'=>$item['old'],
                'image_url'=>$item['image'],'gallery'=>[$item['image']],'attributes'=>$item['attrs'],'badges'=>$item['badges'],
                'category_id'=>$categories[$item['cat']]->id,'is_featured'=>(bool)$item['featured'],'is_new'=>(bool)$item['new'],
                'trainer_pick'=>(bool)$item['trainer'],'home_use'=>(bool)$item['home'],'is_active'=>true,
            ]);
            $keep = [];
            foreach ($item['variants'] as $index => $variant) {
                $model = $product->variants()->updateOrCreate(['sku'=>$variant['sku']], array_merge($variant, ['sort_order'=>$index,'is_active'=>true]));
                $keep[] = $model->id;
            }
            if ($keep) $product->variants()->whereNotIn('id', $keep)->delete();
            $stock = $product->variants()->sum('stock');
            $product->update(['stock' => $stock ?: max(8, (int) $product->stock)]);
            $products->put($item['slug'], $product);
        }

        $collections = [
            ['slug'=>'home-start','name'=>'Стартовый набор для дома','subtitle'=>'Всё необходимое для первых тренировок без зала.','products'=>['fitness-mat-pro','resistance-bands-set','adjustable-dumbbell','sports-bottle']],
            ['slug'=>'recovery','name'=>'Восстановление после нагрузки','subtitle'=>'Инвентарь и питание для комфортного восстановления.','products'=>['whey-protein-pro','foam-roller','massage-ball-set','electrolyte-mix']],
            ['slug'=>'trainer-choice','name'=>'Выбор тренеров НашФит','subtitle'=>'То, чем пользуются наши специалисты.','products'=>['whey-protein-pro','creatine-mono','fitness-mat-pro','resistance-bands-set','foam-roller','lifting-straps']],
        ];
        foreach ($collections as $index => $item) {
            $collection = ShopCollection::updateOrCreate(['slug'=>$item['slug']], ['name'=>$item['name'],'subtitle'=>$item['subtitle'],'is_active'=>true,'sort_order'=>$index]);
            $sync = [];
            foreach ($item['products'] as $sort => $slug) if ($products->has($slug)) $sync[$products[$slug]->id] = ['sort_order'=>$sort];
            $collection->products()->sync($sync);
        }

        $relationSets = [
            'fitness-mat-pro'=>['resistance-bands-set','sports-bottle','yoga-blocks'],
            'whey-protein-pro'=>['shaker-steel','creatine-mono','electrolyte-mix'],
            'foam-roller'=>['massage-ball-set','fitness-mat-pro','electrolyte-mix'],
            'adjustable-dumbbell'=>['training-gloves','fitness-mat-pro','resistance-bands-set'],
        ];
        foreach ($relationSets as $source => $related) {
            if (!$products->has($source)) continue;
            foreach ($related as $sort => $slug) if ($products->has($slug)) {
                DB::table('product_relations')->updateOrInsert(
                    ['product_id'=>$products[$source]->id,'related_product_id'=>$products[$slug]->id,'type'=>'related'],
                    ['sort_order'=>$sort,'updated_at'=>now(),'created_at'=>now()]
                );
            }
        }

        $trainers = Trainer::query()->limit(3)->get();
        $picks = $products->filter(fn ($product) => $product->trainer_pick)->values();
        foreach ($trainers as $index => $trainer) {
            foreach ($picks->slice($index * 2, 3) as $product) {
                DB::table('trainer_product_recommendations')->updateOrInsert(
                    ['trainer_id'=>$trainer->id,'product_id'=>$product->id],
                    ['comment'=>'Использую и рекомендую клиентам для безопасного прогресса.','is_featured'=>true,'updated_at'=>now(),'created_at'=>now()]
                );
            }
        }
    }
}
