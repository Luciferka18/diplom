<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Booking;
use App\Models\Category;
use App\Models\ContentRecommendation;
use App\Models\GymLocation;
use App\Models\Membership;
use App\Models\Payment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Program;
use App\Models\ProgramProgress;
use App\Models\PromoCode;
use App\Models\Promotion;
use App\Models\Review;
use App\Models\ShopCollection;
use App\Models\Tag;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\TrainerService;
use App\Models\User;
use App\Models\UserMembership;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class NashfitDemoContentSeeder extends Seeder
{
    private array $manifest = ['version' => 1, 'records' => []];
    private string $manifestPath;

    public function run(): void
    {
        $this->manifestPath = storage_path('app/nashfit-demo-manifest.json');
        if (is_file($this->manifestPath)) {
            $decoded = json_decode((string) file_get_contents($this->manifestPath), true);
            if (is_array($decoded)) $this->manifest = $decoded;
        }

        DB::transaction(function () {
            $tags = $this->seedTags();
            $locations = $this->seedLocations();
            [$users, $trainers] = $this->seedTrainers($tags, $locations);
            $customers = $this->seedCustomers();
            $memberships = $this->seedMembershipsAndPromos();
            $products = $this->seedProducts($tags, $trainers);
            $programs = $this->seedPrograms($tags, $trainers);
            $articles = $this->seedArticles($tags, $users);
            $this->seedReviews($customers, $trainers, $products, $programs);
            $this->seedProgressAndMemberships($customers, $programs, $memberships);
            $this->seedBookings($customers, $trainers, $locations);
            $this->seedOrders($customers, $products);
            $this->seedRecommendations($articles, $programs, $products, $trainers, $memberships);
        });

        if (!is_dir(dirname($this->manifestPath))) mkdir(dirname($this->manifestPath), 0775, true);
        file_put_contents($this->manifestPath, json_encode($this->manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->command?->info('NashFit demo content seeded safely.');
        $this->command?->line('Demo accounts password: Demo123!');
    }

    private function remember($model): void
    {
        if (!$model->wasRecentlyCreated) return;
        $key = get_class($model) . ':' . $model->getKey();
        $existing = collect($this->manifest['records'] ?? [])->contains(fn ($row) => ($row['key'] ?? '') === $key);
        if (!$existing) $this->manifest['records'][] = ['key' => $key, 'class' => get_class($model), 'id' => $model->getKey()];
    }

    private function upsert(string $class, array $identity, array $values)
    {
        $model = $class::updateOrCreate($identity, $values);
        $this->remember($model);
        return $model;
    }

    private function tableValues(string $table, array $values): array
    {
        if (!Schema::hasTable($table)) {
            return [];
        }

        return collect($values)
            ->filter(fn ($value, $column) => Schema::hasColumn($table, (string) $column))
            ->all();
    }

    private function timestampValues(string $table): array
    {
        $values = [];
        if (Schema::hasColumn($table, 'created_at')) $values['created_at'] = now();
        if (Schema::hasColumn($table, 'updated_at')) $values['updated_at'] = now();
        return $values;
    }

    private function seedTags(): array
    {
        $items = [
            'strength'=>'Сила','muscle'=>'Набор массы','weight-loss'=>'Снижение веса','functional'=>'Функциональный тренинг',
            'home'=>'Домашние тренировки','mobility'=>'Мобильность','yoga'=>'Йога','recovery'=>'Восстановление',
            'nutrition'=>'Питание','running'=>'Бег','boxing'=>'Бокс','core'=>'Пресс и корпус','back'=>'Здоровая спина',
        ];

        $result = [];

        foreach ($items as $slug => $name) {
            // Older project data may already contain the same unique tag name
            // under another slug. Reuse that record instead of inserting a
            // duplicate and breaking the entire transactional demo seeder.
            $tag = Tag::query()->where('slug', $slug)->first();

            if (!$tag) {
                $tag = Tag::query()->where('name', $name)->first();
            }

            if (!$tag) {
                $tag = Tag::query()->create([
                    'slug' => $slug,
                    'name' => $name,
                ]);
                $this->remember($tag);
            } elseif ($tag->slug === $slug && $tag->name !== $name) {
                $nameIsTaken = Tag::query()
                    ->where('name', $name)
                    ->whereKeyNot($tag->getKey())
                    ->exists();

                if (!$nameIsTaken) {
                    $tag->forceFill(['name' => $name])->save();
                }
            }

            $result[$slug] = $tag;
        }

        return $result;
    }

    private function seedLocations(): array
    {
        $items = [
            ['name'=>'НашФит Центр','address'=>'ул. Спортивная, 10'],
            ['name'=>'НашФит Север','address'=>'пр. Победы, 42'],
        ];
        $result = [];
        foreach ($items as $item) {
            $model = $this->upsert(GymLocation::class, ['name'=>$item['name']], ['address'=>$item['address']]);
            $result[] = $model;
        }
        return $result;
    }

    private function seedTrainers(array $tags, array $locations): array
    {
        $items = [
            ['slug'=>'anna-volkova','name'=>'Анна Волкова','spec'=>'Функциональный тренинг и снижение веса','exp'=>7,'age'=>31,'tag'=>['functional','weight-loss'],'bio'=>'Помогает начать тренироваться без перегрузки, выстроить привычку и улучшить композицию тела.','phone'=>'+79990001001'],
            ['slug'=>'dmitry-silnov','name'=>'Дмитрий Сильнов','spec'=>'Бодибилдинг и набор мышечной массы','exp'=>10,'age'=>35,'tag'=>['strength','muscle'],'bio'=>'Специалист по силовой подготовке, гипертрофии и безопасной технике базовых упражнений.','phone'=>'+79990001002'],
            ['slug'=>'elena-orlova','name'=>'Елена Орлова','spec'=>'Йога, растяжка и мобильность','exp'=>9,'age'=>34,'tag'=>['yoga','mobility'],'bio'=>'Развивает мобильность, баланс и контроль тела. Практики подходят новичкам и опытным спортсменам.','phone'=>'+79990001003'],
            ['slug'=>'maksim-romanov','name'=>'Максим Романов','spec'=>'Бокс и функциональная выносливость','exp'=>8,'age'=>33,'tag'=>['boxing','functional'],'bio'=>'Тренировки с элементами бокса, координации и интервальной нагрузки для яркого прогресса.','phone'=>'+79990001004'],
            ['slug'=>'sofia-belova','name'=>'Софья Белова','spec'=>'Восстановление и здоровая спина','exp'=>11,'age'=>38,'tag'=>['recovery','back'],'bio'=>'Помогает вернуться к активности после перерывов и уменьшить дискомфорт через корректное движение.','phone'=>'+79990001005'],
            ['slug'=>'artem-lebedev','name'=>'Артём Лебедев','spec'=>'Бег и развитие выносливости','exp'=>6,'age'=>29,'tag'=>['running','weight-loss'],'bio'=>'Готовит к первым 5 и 10 километрам, учит распределять нагрузку и бегать без травм.','phone'=>'+79990001006'],
            ['slug'=>'victoria-morozova','name'=>'Виктория Морозова','spec'=>'Пилатес и тренировки для женщин','exp'=>8,'age'=>32,'tag'=>['core','mobility'],'bio'=>'Фокус на осанке, мышцах корпуса и бережном укреплении всего тела.','phone'=>'+79990001007'],
            ['slug'=>'ilya-kovalev','name'=>'Илья Ковалёв','spec'=>'Пауэрлифтинг и силовая подготовка','exp'=>12,'age'=>39,'tag'=>['strength','back'],'bio'=>'Ставит технику приседа, жима и тяги, помогает системно увеличивать силовые показатели.','phone'=>'+79990001008'],
        ];
        $users = []; $trainers = [];
        foreach ($items as $index => $item) {
            $email = 'demo.trainer'.($index+1).'@nashfit.local';
            $user = $this->upsert(User::class, ['email'=>$email], [
                'login'=>'demo_trainer_'.($index+1),'name'=>$item['name'],'phone'=>$item['phone'],'role'=>'trainer',
                'password'=>Hash::make('Demo123!'),'email_verified_at'=>now(),
            ]);
            $trainer = $this->upsert(Trainer::class, ['user_id'=>$user->id], [
                'name'=>$item['name'],'specialization'=>$item['spec'],'experience_years'=>$item['exp'],'age'=>$item['age'],
                'bio'=>$item['bio'],'photo_url'=>'/demo/trainers/'.$item['slug'].'.svg','instagram'=>'@'.str_replace('-','_',$item['slug']).'_nashfit','phone'=>$item['phone'],
            ]);
            $trainer->tags()->syncWithoutDetaching(collect($item['tag'])->map(fn ($slug) => $tags[$slug]->id)->all());

            $services = [
                ['slug'=>'intro','name'=>'Вводная тренировка','description'=>'Знакомство, диагностика движения и план следующих шагов.','duration_minutes'=>60,'price'=>0,'badge'=>'Первое занятие','is_intro'=>true],
                ['slug'=>'personal','name'=>'Персональная тренировка','description'=>'Индивидуальное занятие под вашу цель и уровень.','duration_minutes'=>60,'price'=>250000,'badge'=>'Популярно','is_intro'=>false],
                ['slug'=>'extended','name'=>'Расширенная тренировка','description'=>'90 минут техники, основной работы и восстановления.','duration_minutes'=>90,'price'=>340000,'badge'=>'90 минут','is_intro'=>false],
                ['slug'=>'consultation','name'=>'Консультация тренера','description'=>'Разбор целей, нагрузки, режима и тренировочного плана.','duration_minutes'=>45,'price'=>150000,'badge'=>'Консультация','is_intro'=>false],
            ];
            foreach ($services as $sort => $service) {
                $model = $this->upsert(TrainerService::class, ['trainer_id'=>$trainer->id,'slug'=>$service['slug']], array_merge($service,['sort_order'=>$sort,'is_active'=>true]));
            }
            foreach ([1,2,3,4,5] as $day) {
                $schedule = $this->upsert(TrainerSchedule::class,
                    ['trainer_id'=>$trainer->id,'day_of_week'=>$day,'start_time'=>'09:00:00','end_time'=>'18:00:00'],
                    ['location_id'=>$locations[$index % count($locations)]->id,'slot_duration_minutes'=>60]
                );
            }
            $users[$item['slug']] = $user; $trainers[$item['slug']] = $trainer;
        }
        return [$users, $trainers];
    }

    private function seedCustomers(): array
    {
        $names = ['Мария Соколова','Алексей Миронов','Ольга Никитина','Сергей Петров','Дарья Крылова','Никита Власов'];
        $result = [];
        foreach ($names as $index => $name) {
            $n = $index + 1;
            $user = $this->upsert(User::class, ['email'=>"demo.user{$n}@nashfit.local"], [
                'login'=>"demo_user_{$n}",'name'=>$name,'phone'=>'+7999000200'.$n,'role'=>'user',
                'password'=>Hash::make('Demo123!'),'email_verified_at'=>now(),
            ]);
            $result[] = $user;
        }
        return $result;
    }

    private function seedMembershipsAndPromos(): array
    {
        $sharedFeatures = [
            'Доступ в тренажёрный зал и функциональные зоны',
            'Бесплатные программы тренировок в приложении',
            'Прогресс, рекомендации и история активности',
            'Скидки на персональные тренировки и магазин',
        ];

        $plans = [
            [
                'slug' => 'trial-3-visits',
                'name' => '3 бесплатных посещения',
                'description' => 'Пробный формат для новых гостей: познакомьтесь с залом, тренерами и атмосферой без оплаты.',
                'duration_months' => null,
                'trial_visits' => 3,
                'price' => 0,
                'old_price' => null,
                'badge' => 'Пробный доступ',
                'featured' => false,
                'trial' => true,
                'features' => ['3 бесплатных визита', 'Доступ в зал и раздевалки', 'Можно подобрать тренера', 'Без привязки карты'],
            ],
            [
                'slug' => '1-month',
                'name' => '1 месяц',
                'description' => 'Короткий старт, чтобы протестировать режим тренировок и спокойно войти в график.',
                'duration_months' => 1,
                'trial_visits' => 0,
                'price' => 390000,
                'old_price' => null,
                'badge' => 'Старт',
                'featured' => false,
                'trial' => false,
                'features' => $sharedFeatures,
            ],
            [
                'slug' => '3-months',
                'name' => '3 месяца',
                'description' => 'Оптимальный вариант для первой заметной цели: привычка, техника и стабильность.',
                'duration_months' => 3,
                'trial_visits' => 0,
                'price' => 990000,
                'old_price' => 1170000,
                'badge' => 'Популярно',
                'featured' => true,
                'trial' => false,
                'features' => $sharedFeatures,
            ],
            [
                'slug' => '6-months',
                'name' => '6 месяцев',
                'description' => 'Для системного прогресса в силе, снижении веса, выносливости или наборе массы.',
                'duration_months' => 6,
                'trial_visits' => 0,
                'price' => 1690000,
                'old_price' => 2340000,
                'badge' => 'Лучший выбор',
                'featured' => true,
                'trial' => false,
                'features' => array_merge($sharedFeatures, ['Приоритетные рекомендации по программам']),
            ],
            [
                'slug' => '12-months',
                'name' => '12 месяцев',
                'description' => 'Годовой абонемент для тех, кто делает тренировки частью образа жизни.',
                'duration_months' => 12,
                'trial_visits' => 0,
                'price' => 2790000,
                'old_price' => 4680000,
                'badge' => 'Выгодно за год',
                'featured' => false,
                'trial' => false,
                'features' => array_merge($sharedFeatures, ['Максимальная экономия за месяц']),
            ],
            [
                'slug' => '24-months',
                'name' => '24 месяца',
                'description' => 'Самый выгодный долгосрочный формат для стабильных тренировок без лишних решений.',
                'duration_months' => 24,
                'trial_visits' => 0,
                'price' => 4590000,
                'old_price' => 9360000,
                'badge' => 'Максимальная выгода',
                'featured' => false,
                'trial' => false,
                'features' => array_merge($sharedFeatures, ['Самая низкая цена за месяц']),
            ],
        ];

        $result = [];
        foreach ($plans as $sort => $item) {
            $model = $this->upsert(Membership::class, ['slug' => $item['slug']], [
                'name' => $item['name'],
                'description' => $item['description'],
                'duration_months' => $item['duration_months'],
                'trial_visits' => $item['trial_visits'],
                'price' => $item['price'],
                'old_price' => $item['old_price'],
                'features' => $item['features'],
                'badge' => $item['badge'],
                'is_trial' => $item['trial'],
                'is_featured' => $item['featured'],
                'is_active' => true,
                'sort_order' => $sort,
            ]);
            $result[$item['slug']] = $model;
        }

        // Keep the showcase page clean: older demo tariff rows can remain in the
        // database for history, but they should not appear as active public plans.
        Membership::query()
            ->whereNotIn('slug', array_column($plans, 'slug'))
            ->where('is_trial', false)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        $promo = $this->upsert(Promotion::class, ['slug' => 'demo-season'], [
            'name' => 'Сезон сильных привычек',
            'description' => 'Демо-акция на абонементы, магазин и тренировки.',
            'discount_type' => 'percent',
            'discount_value' => 12,
            'applies_to' => ['shop', 'membership', 'booking'],
            'auto_apply' => false,
            'is_active' => true,
            'starts_at' => now()->subMonth(),
            'ends_at' => now()->addMonths(3),
            'badge' => '-12%',
            'banner_title' => 'Промокод FIT12',
            'banner_text' => 'Скидка 12% на магазин, абонемент или персональную тренировку.',
        ]);
        $this->upsert(PromoCode::class, ['code' => 'FIT12'], [
            'promotion_id' => $promo->id,
            'description' => 'Демо-промокод на все услуги НашФит',
            'discount_type' => 'percent',
            'discount_value' => 12,
            'applies_to' => ['shop', 'membership', 'booking'],
            'minimum_amount' => 0,
            'max_uses' => 500,
            'per_user_limit' => 2,
            'uses_count' => 0,
            'is_active' => true,
            'starts_at' => now()->subMonth(),
            'ends_at' => now()->addMonths(3),
        ]);

        return $result;
    }

    private function categoryBySlugOrName(string $slug, string $name): Category
    {
        $category = Category::query()->where('slug', $slug)->first()
            ?: Category::query()->where('name', $name)->first();

        if (!$category) {
            $category = Category::query()->create(['slug' => $slug, 'name' => $name]);
            $this->remember($category);
            return $category;
        }

        $dirty = [];
        if ($category->slug !== $slug && !Category::query()->where('slug', $slug)->whereKeyNot($category->getKey())->exists()) {
            $dirty['slug'] = $slug;
        }
        if ($category->name !== $name && !Category::query()->where('name', $name)->whereKeyNot($category->getKey())->exists()) {
            $dirty['name'] = $name;
        }
        if ($dirty) {
            $category->forceFill($dirty)->save();
        }

        return $category;
    }

    private function seedProducts(array $tags, array $trainers): array
    {
        $categoryData = [
            'nutrition'=>'Спортивное питание','equipment'=>'Инвентарь','recovery'=>'Восстановление','apparel'=>'Одежда и аксессуары','home-fitness'=>'Для дома',
        ];
        $categories = [];
        foreach ($categoryData as $slug => $name) {
            $categories[$slug] = $this->categoryBySlugOrName($slug, $name);
        }
        $items = [
            ['slug'=>'whey-protein-pro','name'=>'Сывороточный протеин Pro','cat'=>'nutrition','price'=>2490,'brand'=>'НашФит Nutrition','img'=>'nutrition','tags'=>['muscle','nutrition'],'variants'=>[['Шоколад · 900 г','WHEY-CHO-900',['Вкус'=>'Шоколад','Объём'=>'900 г'],18],['Ваниль · 900 г','WHEY-VAN-900',['Вкус'=>'Ваниль','Объём'=>'900 г'],14],['Клубника · 450 г','WHEY-STR-450',['Вкус'=>'Клубника','Объём'=>'450 г'],9]]],
            ['slug'=>'creatine-mono','name'=>'Креатин моногидрат','cat'=>'nutrition','price'=>1290,'brand'=>'НашФит Nutrition','img'=>'nutrition','tags'=>['strength','muscle'],'variants'=>[['300 г','CREATINE-300',['Объём'=>'300 г'],25],['500 г','CREATINE-500',['Объём'=>'500 г'],11]]],
            ['slug'=>'protein-bars-box','name'=>'Протеиновые батончики, 12 шт.','cat'=>'nutrition','price'=>1690,'brand'=>'НашФит Nutrition','img'=>'nutrition','tags'=>['nutrition'],'variants'=>[['Шоколад','BARS-CHO',['Вкус'=>'Шоколад'],18],['Кокос','BARS-COC',['Вкус'=>'Кокос'],13]]],
            ['slug'=>'preworkout-focus','name'=>'Предтренировочный комплекс Focus','cat'=>'nutrition','price'=>1890,'brand'=>'НашФит Nutrition','img'=>'nutrition','tags'=>['strength','running'],'variants'=>[['Цитрус · 250 г','PRE-CIT-250',['Вкус'=>'Цитрус','Объём'=>'250 г'],15],['Ягоды · 250 г','PRE-BER-250',['Вкус'=>'Ягоды','Объём'=>'250 г'],8]]],
            ['slug'=>'magnesium-recovery','name'=>'Магний Recovery','cat'=>'recovery','price'=>890,'brand'=>'НашФит Recovery','img'=>'recovery','tags'=>['recovery'],'variants'=>[['60 капсул','MAG-60',['Объём'=>'60 капсул'],24]]],
            ['slug'=>'foam-roller','name'=>'Массажный ролл','cat'=>'recovery','price'=>1690,'brand'=>'НашФит Recovery','img'=>'recovery','tags'=>['recovery','mobility'],'variants'=>[['Чёрный','ROLLER-BLACK',['Цвет'=>'Чёрный'],19],['Бирюзовый','ROLLER-MINT',['Цвет'=>'Бирюзовый'],9]]],
            ['slug'=>'massage-gun-mini','name'=>'Массажный пистолет Mini','cat'=>'recovery','price'=>5990,'brand'=>'НашФит Recovery','img'=>'recovery','tags'=>['recovery'],'variants'=>[['Графит','GUN-GRAPH',['Цвет'=>'Графит'],7]]],
            ['slug'=>'resistance-bands-set','name'=>'Набор фитнес-резинок','cat'=>'equipment','price'=>1490,'brand'=>'НашФит Gear','img'=>'equipment','tags'=>['home','functional'],'variants'=>[['Light','BANDS-LIGHT',['Сопротивление'=>'Light'],18],['Medium','BANDS-MED',['Сопротивление'=>'Medium'],15],['Heavy','BANDS-HEAVY',['Сопротивление'=>'Heavy'],10]]],
            ['slug'=>'adjustable-dumbbell','name'=>'Разборная гантель','cat'=>'equipment','price'=>4490,'brand'=>'НашФит Gear','img'=>'equipment','tags'=>['strength','home'],'variants'=>[['10 кг','DUMB-10',['Вес'=>'10 кг'],12],['20 кг','DUMB-20',['Вес'=>'20 кг'],6]]],
            ['slug'=>'kettlebell-home','name'=>'Гиря для дома','cat'=>'equipment','price'=>2490,'brand'=>'НашФит Gear','img'=>'equipment','tags'=>['strength','functional'],'variants'=>[['6 кг','KETTLE-6',['Вес'=>'6 кг'],12],['10 кг','KETTLE-10',['Вес'=>'10 кг'],7],['14 кг','KETTLE-14',['Вес'=>'14 кг'],4]]],
            ['slug'=>'yoga-strap','name'=>'Ремень для йоги','cat'=>'home-fitness','price'=>690,'brand'=>'НашФит Gear','img'=>'home','tags'=>['yoga','mobility'],'variants'=>[['Мятный','STRAP-MINT',['Цвет'=>'Мятный'],17],['Графитовый','STRAP-GRAPH',['Цвет'=>'Графитовый'],13]]],
            ['slug'=>'fitness-mat-pro','name'=>'Коврик для фитнеса Pro','cat'=>'home-fitness','price'=>2790,'brand'=>'НашФит Gear','img'=>'home','tags'=>['home','yoga'],'variants'=>[['6 мм · Мятный','MAT-MINT-6',['Толщина'=>'6 мм','Цвет'=>'Мятный'],11],['8 мм · Графит','MAT-GRAPH-8',['Толщина'=>'8 мм','Цвет'=>'Графит'],8]]],
            ['slug'=>'ankle-weights','name'=>'Утяжелители для ног','cat'=>'home-fitness','price'=>1990,'brand'=>'НашФит Gear','img'=>'home','tags'=>['home','weight-loss'],'variants'=>[['2 × 1 кг','ANKLE-1',['Вес'=>'2 × 1 кг'],13],['2 × 2 кг','ANKLE-2',['Вес'=>'2 × 2 кг'],7]]],
            ['slug'=>'training-gloves','name'=>'Перчатки для тренировок','cat'=>'apparel','price'=>1390,'brand'=>'НашФит Gear','img'=>'apparel','tags'=>['strength'],'variants'=>[['S','GLOVES-S',['Размер'=>'S'],8],['M','GLOVES-M',['Размер'=>'M'],14],['L','GLOVES-L',['Размер'=>'L'],10]]],
            ['slug'=>'gym-bag-city','name'=>'Спортивная сумка City','cat'=>'apparel','price'=>3490,'brand'=>'НашФит','img'=>'apparel','tags'=>['functional'],'variants'=>[['Чёрная','BAG-BLACK',['Цвет'=>'Чёрный'],9],['Оливковая','BAG-OLIVE',['Цвет'=>'Оливковый'],6]]],
            ['slug'=>'heart-rate-monitor','name'=>'Нагрудный пульсометр','cat'=>'equipment','price'=>5490,'brand'=>'НашФит Tech','img'=>'equipment','tags'=>['running','weight-loss'],'variants'=>[['Стандарт','HRM-STD',['Комплектация'=>'Стандарт'],8]]],
        ];
        $result = [];
        foreach ($items as $index=>$item) {
            $product = $this->upsert(Product::class,['slug'=>$item['slug']],[
                'name'=>$item['name'],'short_description'=>'Проверенный товар для регулярных тренировок и восстановления.',
                'description'=>'Разработан для пользователей НашФит. Удобен в использовании, подходит для дома и зала.',
                'brand'=>$item['brand'],'sku'=>'NF-'.Str::upper(substr(str_replace('-','',$item['slug']),0,12)),'price'=>$item['price'],'old_price'=>$index%3===0?$item['price']+400:null,
                'stock'=>0,'image_url'=>'/demo/products/'.$item['img'].'.svg','gallery'=>['/demo/products/'.$item['img'].'.svg'],
                'attributes'=>['Гарантия'=>'12 месяцев','Подходит для'=>'Дома и зала'],'badges'=>$index%4===0?['Выбор тренера']:($index%5===0?['Новинка']:[]),
                'category_id'=>$categories[$item['cat']]->id,'is_featured'=>$index<6,'is_new'=>$index%5===0,'trainer_pick'=>$index%4===0,
                'home_use'=>in_array($item['cat'],['home-fitness','equipment']),'is_active'=>true,'views_count'=>180-$index*5,
            ]);
            $product->tags()->syncWithoutDetaching(collect($item['tags'])->map(fn($slug)=>$tags[$slug]->id)->all());
            $variantIds=[];
            foreach ($item['variants'] as $sort=>$variant) {
                [$name,$sku,$options,$stock]=$variant;
                $model=$product->variants()->updateOrCreate(['sku'=>'NF-'.$sku],[
                    'name'=>$name,'options'=>$options,'price'=>$item['price'],'old_price'=>null,'stock'=>$stock,'image_url'=>'/demo/products/'.$item['img'].'.svg','is_active'=>true,'sort_order'=>$sort,
                ]);
                $this->remember($model); $variantIds[]=$model->id;
            }
            $product->update(['stock'=>$product->variants()->sum('stock')]);
            $result[$item['slug']]=$product;
        }
        $trainerList=array_values($trainers); $productList=array_values($result);
        if (Schema::hasTable('trainer_product_recommendations')) {
            foreach ($trainerList as $i=>$trainer) {
                foreach (array_slice($productList,$i%8,3) as $product) {
                    DB::table('trainer_product_recommendations')->updateOrInsert(
                        ['trainer_id'=>$trainer->id,'product_id'=>$product->id],
                        $this->tableValues('trainer_product_recommendations', array_merge([
                            'comment'=>'Использую в работе и рекомендую для безопасного прогресса.',
                            'is_featured'=>true,
                        ], $this->timestampValues('trainer_product_recommendations')))
                    );
                }
            }
        }
        $this->seedShopCollectionsAndRelations($result);

        return $result;
    }

    private function seedShopCollectionsAndRelations(array $products): void
    {
        if (!Schema::hasTable('shop_collections') || !Schema::hasTable('shop_collection_product')) {
            return;
        }

        $sets = [
            ['slug' => 'home-start-kit', 'name' => 'Стартовый набор для дома', 'subtitle' => 'Коврик, резинки и базовый инвентарь для первых тренировок.', 'items' => ['fitness-mat-pro', 'resistance-bands-set', 'ankle-weights']],
            ['slug' => 'muscle-growth-kit', 'name' => 'Для набора мышечной массы', 'subtitle' => 'Питание и силовой инвентарь для прогресса в зале.', 'items' => ['whey-protein-pro', 'creatine-mono', 'training-gloves']],
            ['slug' => 'recovery-kit', 'name' => 'Восстановление после нагрузки', 'subtitle' => 'Ролл, магний и массаж для стабильного режима.', 'items' => ['foam-roller', 'magnesium-recovery', 'massage-gun-mini']],
        ];

        foreach ($sets as $sort => $set) {
            $collection = $this->upsert(ShopCollection::class, ['slug' => $set['slug']], [
                'name' => $set['name'],
                'subtitle' => $set['subtitle'],
                'image_url' => '/demo/products/equipment.svg',
                'is_active' => true,
                'sort_order' => $sort,
            ]);

            foreach ($set['items'] as $itemSort => $slug) {
                if (!isset($products[$slug])) {
                    continue;
                }
                DB::table('shop_collection_product')->updateOrInsert(
                    ['shop_collection_id' => $collection->id, 'product_id' => $products[$slug]->id],
                    $this->tableValues('shop_collection_product', array_merge(['sort_order' => $itemSort], $this->timestampValues('shop_collection_product')))
                );
            }
        }

        if (!Schema::hasTable('product_relations')) {
            return;
        }

        $productList = array_values($products);
        foreach ($productList as $index => $product) {
            foreach ([$productList[($index + 1) % count($productList)] ?? null, $productList[($index + 5) % count($productList)] ?? null] as $relationIndex => $related) {
                if (!$related || $related->id === $product->id) {
                    continue;
                }
                DB::table('product_relations')->updateOrInsert(
                    ['product_id' => $product->id, 'related_product_id' => $related->id],
                    $this->tableValues('product_relations', array_merge([
                        'type' => $relationIndex === 0 ? 'also_bought' : 'recommended',
                        'sort_order' => $relationIndex,
                    ], $this->timestampValues('product_relations')))
                );
            }
        }
    }

    private function seedPrograms(array $tags, array $trainers): array
    {
        $items = [
            ['functional-start','Функциональный старт','Начальный',4,'functional','anna-volkova'],
            ['strong-body','Сильное тело','Средний',8,'strength','dmitry-silnov'],
            ['mass-foundation','Основа набора массы','Средний',10,'muscle','dmitry-silnov'],
            ['fat-burn-smart','Умное снижение веса','Начальный',8,'weight-loss','anna-volkova'],
            ['mobility-reset','Перезагрузка мобильности','Начальный',6,'mobility','elena-orlova'],
            ['morning-yoga','Утренняя йога','Начальный',4,'yoga','elena-orlova'],
            ['boxing-base','Основы бокса','Начальный',6,'boxing','maksim-romanov'],
            ['healthy-back','Здоровая спина','Начальный',6,'back','sofia-belova'],
            ['run-5k','Первые 5 километров','Начальный',8,'running','artem-lebedev'],
            ['core-control','Сильный корпус','Средний',6,'core','victoria-morozova'],
            ['home-strength','Сила дома','Средний',8,'home','ilya-kovalev'],
            ['recovery-week','Неделя восстановления','Начальный',2,'recovery','sofia-belova'],
        ];
        $result=[];
        foreach ($items as $index=>$item) {
            [$slug,$title,$level,$weeks,$tag,$trainerSlug]=$item;
            $program=$this->upsert(Program::class,['title'=>$title],[
                'description'=>'Пошаговая бесплатная программа НашФит: три занятия в неделю, понятная нагрузка и рекомендации по восстановлению.',
                'level'=>$level,'duration_weeks'=>$weeks,'price'=>0,'trainer_id'=>$trainers[$trainerSlug]->id,'image_url'=>'/demo/covers/'.$tag.'.svg',
            ]);
            $program->tags()->syncWithoutDetaching([$tags[$tag]->id]);
            $result[$slug]=$program;
        }
        return $result;
    }

    private function seedArticles(array $tags, array $trainerUsers): array
    {
        $items = [
            ['functional-training-start','Как начать функциональные тренировки','training','functional','anna-volkova'],
            ['strength-technique','Техника важнее веса: база силового тренинга','training','strength','dmitry-silnov'],
            ['protein-guide','Белок без мифов: сколько нужно именно вам','nutrition','nutrition','dmitry-silnov'],
            ['meal-before-workout','Что есть до и после тренировки','nutrition','nutrition','anna-volkova'],
            ['mobility-daily','10 минут мобильности каждый день','recovery','mobility','elena-orlova'],
            ['sleep-recovery','Сон и восстановление: главный скрытый ресурс','recovery','recovery','sofia-belova'],
            ['healthy-back-office','Здоровая спина при сидячей работе','health','back','sofia-belova'],
            ['first-5k','Как подготовиться к первым 5 километрам','training','running','artem-lebedev'],
            ['boxing-cardio','Почему бокс отлично развивает выносливость','training','boxing','maksim-romanov'],
            ['core-not-crunches','Сильный пресс — это не только скручивания','training','core','victoria-morozova'],
            ['home-gym-minimum','Минимальный набор для домашнего зала','motivation','home','anna-volkova'],
            ['plateau-progress','Что делать, если прогресс остановился','motivation','strength','ilya-kovalev'],
            ['training-consistency','Как не бросить тренировки через две недели','motivation','functional','anna-volkova'],
            ['stretching-errors','Пять ошибок в растяжке','health','mobility','elena-orlova'],
            ['muscle-growth-basics','Как растут мышцы: понятное объяснение','health','muscle','dmitry-silnov'],
            ['recovery-tools','Ролл, массажный мяч или массажный пистолет','recovery','recovery','sofia-belova'],
            ['running-pulse','Пульсовые зоны для начинающих бегунов','health','running','artem-lebedev'],
            ['gym-confidence','Как чувствовать себя уверенно в тренажёрном зале','motivation','functional','victoria-morozova'],
        ];
        $result=[];
        foreach ($items as $index=>$item) {
            [$slug,$title,$category,$tag,$authorSlug]=$item;
            $content=$this->articleHtml($title,$category,$trainerUsers[$authorSlug]->name);
            $article=$this->upsert(Article::class,['slug'=>$slug],[
                'title'=>$title,'excerpt'=>'Практический материал от команды НашФит: без крайностей, с понятными шагами и применимыми советами.',
                'cover_image_url'=>'/demo/covers/'.$tag.'.svg','category'=>$category,'content'=>$content,'status'=>'published',
                'is_featured'=>$index<3,'is_trainer_article'=>true,'reading_time_minutes'=>5+($index%4),'views_count'=>3200-$index*97,
                'helpful_count'=>180-$index*4,'rejection_reason'=>null,'published_at'=>now()->subDays(2+$index*3),'author_user_id'=>$trainerUsers[$authorSlug]->id,
            ]);
            $article->tags()->syncWithoutDetaching([$tags[$tag]->id]);
            $result[$slug]=$article;
        }
        return $result;
    }

    private function articleHtml(string $title, string $category, string $author): string
    {
        return '<p class="lead">'.$title.' — это тема, в которой важна не идеальность, а последовательность. Ниже — рабочий подход, который можно применить уже сегодня.</p>'
            .'<h2>С чего начать</h2><p>Сначала оцените текущий уровень и выберите нагрузку, после которой остаётся ощущение контроля. Увеличивайте объём постепенно и фиксируйте изменения.</p>'
            .'<div class="article-callout article-callout--trainer"><strong>Совет тренера '.$author.'</strong><p>Оставляйте запас в 2–3 повторения и не меняйте сразу все привычки. Один устойчивый шаг полезнее резкого старта.</p></div>'
            .'<h2>Практический план</h2><ol><li>Определите одну измеримую цель на четыре недели.</li><li>Запланируйте три основных действия на неделю.</li><li>Отмечайте самочувствие, сон и уровень нагрузки.</li><li>Корректируйте план раз в неделю, а не после каждой тренировки.</li></ol>'
            .'<h2>Частые ошибки</h2><ul><li>Слишком быстрый рост нагрузки.</li><li>Сравнение себя с более опытными спортсменами.</li><li>Игнорирование восстановления и сна.</li><li>Отсутствие понятного плана.</li></ul>'
            .'<blockquote>Прогресс строится не на одном идеальном занятии, а на десятках достаточно хороших.</blockquote>'
            .'<h2>Что делать дальше</h2><p>Выберите подходящую бесплатную программу, сохраните статью и при необходимости запишитесь на вводную тренировку. Тренер поможет адаптировать рекомендации под ваше состояние и цели.</p>';
    }

    private function seedReviews(array $customers, array $trainers, array $products, array $programs): void
    {
        $texts=['Очень понятная подача и внимательное отношение.','Понравился системный подход без лишнего давления.','Уже через несколько недель заметил прогресс.','Хорошее качество и удобство в ежедневном использовании.','Рекомендации реально помогают не теряться.'];
        $targets=array_merge(array_values($trainers),array_values($products),array_values($programs));
        foreach ($targets as $index=>$target) {
            for ($j=0;$j<2;$j++) {
                $user=$customers[($index+$j)%count($customers)];
                $review=Review::firstOrCreate([
                    'user_id'=>$user->id,'reviewable_type'=>get_class($target),'reviewable_id'=>$target->id,
                ],[
                    'rating'=>5-(($index+$j)%4===0?1:0),'text'=>$texts[($index+$j)%count($texts)],
                    'advantages'=>'Понятно, удобно и соответствует описанию.','disadvantages'=>$j===0?null:'Хотелось бы ещё больше вариантов.',
                    'photos'=>null,'verified_purchase'=>$target instanceof Product,'trainer_recommendation'=>false,
                ]);
                $this->remember($review);
            }
        }
    }

    private function seedProgressAndMemberships(array $customers, array $programs, array $memberships): void
    {
        $programList=array_values($programs);
        foreach ($customers as $i=>$user) {
            $progress=$this->upsert(ProgramProgress::class,['user_id'=>$user->id,'program_id'=>$programList[$i%count($programList)]->id],[
                'completed_weeks'=>1+($i%3),'status'=>'active','started_at'=>now()->subWeeks(2),'completed_at'=>null,'last_activity_at'=>now()->subDays($i),
            ]);
            if ($i<3 && isset($memberships['3-months'])) {
                $membership=$this->upsert(UserMembership::class,['user_id'=>$user->id,'membership_id'=>$memberships['3-months']->id,'is_trial_grant'=>false],[
                    'status'=>'active','subtotal_amount'=>$memberships['3-months']->price,'discount_amount'=>0,'total_amount'=>$memberships['3-months']->price,
                    'starts_at'=>now()->subMonth(),'ends_at'=>now()->addMonths(2),'metadata'=>['demo'=>true],
                ]);
            }
        }
    }

    private function seedBookings(array $customers, array $trainers, array $locations): void
    {
        $trainerList=array_values($trainers);
        foreach ($customers as $i=>$user) {
            $trainer=$trainerList[$i%count($trainerList)];
            $service=$trainer->services()->where('slug',$i%2===0?'personal':'consultation')->first();
            $start=now()->addDays(2+$i)->setTime(10+($i%5),0);
            $booking=Booking::firstOrCreate([
                'user_id'=>$user->id,'trainer_id'=>$trainer->id,'starts_at'=>$start,
            ],[
                'trainer_service_id'=>$service?->id,'location_id'=>$locations[$i%count($locations)]->id,'client_name'=>$user->name,'client_phone'=>$user->phone,
                'client_comment'=>'Демонстрационная запись: хочу обсудить цель и технику.','ends_at'=>$start->copy()->addMinutes($service?->duration_minutes ?? 60),
                'status'=>'booked','subtotal_amount'=>$service?->price ?? 0,'discount_amount'=>0,'total_amount'=>$service?->price ?? 0,'payment_status'=>'paid',
            ]);
            $this->remember($booking);
        }
    }

    private function seedOrders(array $customers, array $products): void
    {
        if (!Schema::hasTable('orders') || !Schema::hasTable('order_items')) {
            return;
        }

        $productList = array_values($products);
        if (!$customers || !$productList) {
            return;
        }

        foreach ($customers as $i => $user) {
            $first = $productList[$i % count($productList)];
            $second = $productList[($i + 4) % count($productList)] ?? $first;
            $order = Order::firstOrCreate(
                ['user_id' => $user->id, 'customer_email' => $user->email, 'comment' => 'Демонстрационный заказ НашФит #' . ($i + 1)],
                [
                    'status' => $i % 3 === 0 ? 'completed' : ($i % 3 === 1 ? 'processing' : 'paid'),
                    'payment_status' => 'paid',
                    'currency' => 'RUB',
                    'items_count' => 0,
                    'subtotal' => 0,
                    'discount' => $i % 2 === 0 ? 35000 : 0,
                    'delivery' => $i % 2 === 0 ? 0 : 39000,
                    'delivery_method' => $i % 2 === 0 ? 'pickup' : 'delivery',
                    'pickup_location' => $i % 2 === 0 ? 'НашФит Центр' : null,
                    'total' => 0,
                    'customer_name' => $user->name,
                    'customer_phone' => $user->phone,
                    'address_line' => $i % 2 === 0 ? null : 'ул. Демонстрационная, ' . (10 + $i),
                    'city' => 'Москва',
                    'postal_code' => '101000',
                ]
            );
            $this->remember($order);

            $subtotal = 0;
            foreach ([$first, $second] as $idx => $product) {
                $variant = $product->variants()->where('is_active', true)->orderBy('sort_order')->first();
                $quantity = $idx === 0 ? 1 : 2;
                $price = (int) round(((float) ($variant?->price ?? $product->price)) * 100);
                $line = $price * $quantity;
                $subtotal += $line;
                $item = OrderItem::updateOrCreate(
                    ['order_id' => $order->id, 'product_id' => $product->id, 'product_variant_id' => $variant?->id],
                    [
                        'name' => $product->name,
                        'variant_name' => $variant?->name,
                        'variant_options' => $variant?->options ?: [],
                        'sku' => $variant?->sku ?? $product->sku,
                        'image_url' => $variant?->image_url ?? $product->image_url,
                        'price' => $price,
                        'quantity' => $quantity,
                        'line_total' => $line,
                    ]
                );
                $this->remember($item);
            }

            $discount = min((int) $order->discount, $subtotal);
            $total = max(0, $subtotal - $discount + (int) $order->delivery);
            $order->forceFill(['items_count' => $order->items()->sum('quantity'), 'subtotal' => $subtotal, 'total' => $total])->save();

            if (Schema::hasTable('payments')) {
                $payment = Payment::updateOrCreate(
                    ['payable_type' => Order::class, 'payable_id' => $order->id, 'provider' => 'mock'],
                    ['user_id' => $user->id, 'status' => 'paid', 'amount' => $total, 'currency' => 'RUB', 'external_id' => 'demo-order-' . $order->id, 'metadata' => ['demo' => true], 'paid_at' => now()]
                );
                $this->remember($payment);
            }
        }
    }

    private function seedRecommendations(array $articles, array $programs, array $products, array $trainers, array $memberships): void
    {
        $productList=array_values($products); $trainerList=array_values($trainers); $membership=$memberships['3-months'] ?? reset($memberships);
        $sources=[['type'=>'article','placement'=>'article_end','items'=>$articles],['type'=>'program','placement'=>'program_end','items'=>$programs]];
        foreach ($sources as $source) {
            $i=0;
            foreach ($source['items'] as $item) {
                $targets=[['product',$productList[$i%count($productList)]->id],['trainer',$trainerList[$i%count($trainerList)]->id],['membership',$membership->id]];
                foreach ($targets as $sort=>$target) {
                    $model=$this->upsert(ContentRecommendation::class,[
                        'source_type'=>$source['type'],'source_id'=>$item->id,'placement'=>$source['placement'],'target_type'=>$target[0],'target_id'=>$target[1],
                    ],[
                        'headline'=>$sort===0?'Подобрано по теме':null,'description'=>$sort===0?'Полезное продолжение материала внутри экосистемы НашФит.':null,
                        'cta_label'=>$target[0]==='trainer'?'Записаться':($target[0]==='product'?'Смотреть товар':'Выбрать абонемент'),'is_active'=>true,'sort_order'=>$sort,
                    ]);
                }
                $i++;
            }
        }
    }
}
