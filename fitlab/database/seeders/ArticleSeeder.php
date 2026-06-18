<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        if (Schema::hasTable('article_favorites')) {
            DB::table('article_favorites')->delete();
        }
        if (Schema::hasTable('article_helpful_votes')) {
            DB::table('article_helpful_votes')->delete();
        }
        Article::query()->delete();

        $tagRows = [
            ['name' => 'Тренировки', 'slug' => 'workouts'],
            ['name' => 'Питание', 'slug' => 'nutrition'],
            ['name' => 'Восстановление', 'slug' => 'recovery'],
            ['name' => 'Йога', 'slug' => 'yoga'],
            ['name' => 'Похудение', 'slug' => 'fat-loss'],
            ['name' => 'Новичкам', 'slug' => 'beginners'],
        ];
        foreach ($tagRows as $tagData) {
            Tag::firstOrCreate(['slug' => $tagData['slug']], $tagData);
        }

        $authors = [
            'anna' => User::where('email', 'anna@nashfit.local')->first(),
            'dmitry' => User::where('email', 'dmitry@nashfit.local')->first(),
            'elena' => User::where('email', 'elena@nashfit.local')->first(),
        ];

        $tagIds = Tag::pluck('id')->toArray();

        $articles = [
            [
                'title' => 'Как начать тренироваться: понятный план для новичка',
                'slug' => 'kak-nachat-trenirovatsya-ponyatnyy-plan-dlya-novichka',
                'excerpt' => 'Простой старт: как выбрать цель, собрать удобное расписание и не бросить тренировки через неделю.',
                'cover_image_url' => '/seed-images/articles/kak-nachat-trenirovatsya.png',
                'category' => 'training', 'reading_time_minutes' => 6, 'views_count' => 1280, 'helpful_count' => 87,
                'is_featured' => true, 'is_trainer_article' => true, 'author_user_id' => $authors['anna']?->id,
                'status' => 'published', 'published_at' => now()->subDays(5), 'tags' => [1, 6],
                'content' => '<h2>С чего начать</h2><p>Старт в фитнесе должен быть спокойным. Не нужно сразу тренироваться каждый день или брать сложные программы. Лучше выбрать одну цель, удобный график и первые базовые упражнения.</p><h3>Шаг 1. Определите цель</h3><p>На старте достаточно одной приоритетной задачи: похудение, набор мышечной массы, улучшение самочувствия или развитие выносливости.</p><h3>Шаг 2. Соберите ритм</h3><p>Для большинства новичков подходят 3 тренировки в неделю по 45–60 минут. Такой режим легче выдержать и встроить в жизнь.</p><h3>Шаг 3. Следите за техникой</h3><p>Качество движения всегда важнее веса и скорости. Если техника поставлена, прогресс идёт быстрее и безопаснее.</p><p>Добавьте сон, воду и регулярность — и вы увидите результат гораздо раньше, чем кажется.</p>',
            ],
            [
                'title' => 'Питание для набора мышечной массы',
                'slug' => 'pitanie-dlya-nabora-myshechnoy-massy',
                'excerpt' => 'Как есть для роста мышц без хаоса: профицит калорий, белок, углеводы и контроль восстановления.',
                'cover_image_url' => '/seed-images/articles/pitanie-dlya-massy.png',
                'category' => 'nutrition', 'reading_time_minutes' => 7, 'views_count' => 1640, 'helpful_count' => 112,
                'is_featured' => true, 'is_trainer_article' => true, 'author_user_id' => $authors['dmitry']?->id,
                'status' => 'published', 'published_at' => now()->subDays(10), 'tags' => [2],
                'content' => '<h2>База для роста мышц</h2><p>Набор массы строится на трёх вещах: умеренный профицит калорий, достаточный белок и системные силовые тренировки.</p><h3>Сколько есть</h3><p>Для большинства подойдёт профицит 10–15% от уровня поддержки. Слишком большой избыток ускоряет набор жира, но не делает рост мышц быстрее.</p><h3>Белок и углеводы</h3><p>Белок держите в диапазоне 1.6–2.2 г на килограмм веса. Углеводы нужны для энергии, а жиры — для гормональной системы и стабильного самочувствия.</p><h3>Питание вокруг тренировки</h3><p>За 1.5–2 часа до тренировки подойдёт плотный приём пищи с углеводами и белком. После тренировки — белок плюс углеводы для восстановления.</p>',
            ],
            [
                'title' => 'Йога для начинающих: первые шаги',
                'slug' => 'yoga-dlya-nachinayushchikh-pervye-shagi',
                'excerpt' => 'Что нужно для первой практики: коврик, спокойный темп, базовые асаны и внимание к дыханию.',
                'cover_image_url' => '/seed-images/articles/yoga-dlya-nachinayushchikh.png',
                'category' => 'health', 'reading_time_minutes' => 5, 'views_count' => 920, 'helpful_count' => 68,
                'is_featured' => false, 'is_trainer_article' => true, 'author_user_id' => $authors['elena']?->id,
                'status' => 'published', 'published_at' => now()->subDays(3), 'tags' => [4, 6],
                'content' => '<h2>Первые практики без давления</h2><p>Для старта в йоге не нужен идеальный шпагат. Достаточно коврика, удобной одежды и желания спокойно познакомиться со своим телом.</p><h3>Что важно на старте</h3><p>Дыхание, мягкое вхождение в асаны и отсутствие спешки. Начинайте с коротких практик по 15–20 минут.</p><h3>Базовые позиции</h3><p>Подойдут поза горы, кошка-корова, собака мордой вниз, воин I и простые скрутки. Главное — не стремиться сделать глубже любой ценой.</p><p>Если практика даёт ощущение лёгкости и спокойствия, вы двигаетесь в правильном направлении.</p>',
            ],
            [
                'title' => '5 ошибок при похудении',
                'slug' => '5-oshibok-pri-pokhudenii',
                'excerpt' => 'Разбираем ошибки, которые мешают снижать вес: слишком жёсткий дефицит, только кардио и игнорирование восстановления.',
                'cover_image_url' => '/seed-images/articles/oshibki-pri-pokhudenii.png',
                'category' => 'training', 'reading_time_minutes' => 6, 'views_count' => 1870, 'helpful_count' => 143,
                'is_featured' => true, 'is_trainer_article' => true, 'author_user_id' => $authors['anna']?->id,
                'status' => 'published', 'published_at' => now()->subDays(1), 'tags' => [5],
                'content' => '<h2>Почему вес стоит на месте</h2><p>Частая причина не в отсутствии усилий, а в стратегии. Когда человек пытается всё изменить слишком резко, удержать результат становится сложно.</p><h3>Ошибка 1. Слишком большой дефицит</h3><p>Жёсткие ограничения повышают риск срывов и потери мышечной массы.</p><h3>Ошибка 2. Только кардио</h3><p>Силовые тренировки помогают сохранить форму, удержать мышцы и тратить больше энергии.</p><h3>Ошибка 3. Игнорирование сна</h3><p>Если вы мало спите, растёт тяга к еде и падает качество восстановления. Для снижения веса это критично.</p><p>Лучший подход — умеренный дефицит, движение, контроль стресса и терпение.</p>',
            ],
            [
                'title' => 'Восстановление после тренировки',
                'slug' => 'vosstanovlenie-posle-trenirovki',
                'excerpt' => 'Что помогает восстановиться быстрее: сон, вода, белок, лёгкая активность и разумный объём нагрузки.',
                'cover_image_url' => '/seed-images/articles/vosstanovlenie-posle-trenirovki.png',
                'category' => 'recovery', 'reading_time_minutes' => 5, 'views_count' => 1110, 'helpful_count' => 75,
                'is_featured' => false, 'is_trainer_article' => true, 'author_user_id' => $authors['dmitry']?->id,
                'status' => 'published', 'published_at' => now()->subDays(7), 'tags' => [3],
                'content' => '<h2>Рост начинается после тренировки</h2><p>Во время тренировки мы создаём стимул, а прогресс происходит в восстановлении. Поэтому отдых — не слабость, а часть программы.</p><h3>Что работает лучше всего</h3><p>Сон 7–9 часов, белок в рационе, вода и умеренная активность в дни отдыха. При сильной забитости помогает лёгкая мобильность и прогулка.</p><h3>Когда стоит снизить нагрузку</h3><p>Если упали силовые, пропала мотивация и ухудшился сон, организму нужен шаг назад. Иногда один облегчённый микроцикл даёт больше прогресса, чем постоянная гонка.</p>',
            ],
            [
                'title' => 'Как составить план тренировок на неделю',
                'slug' => 'kak-sostavit-plan-trenirovok-na-nedelyu',
                'excerpt' => 'Показываем, как собрать рабочую неделю: силовые, кардио, восстановление и комфортный объём.',
                'cover_image_url' => '/seed-images/articles/plan-trenirovok.png',
                'category' => 'training', 'reading_time_minutes' => 6, 'views_count' => 780, 'helpful_count' => 52,
                'is_featured' => false, 'is_trainer_article' => true, 'author_user_id' => $authors['anna']?->id,
                'status' => 'published', 'published_at' => now()->subDays(8), 'tags' => [1, 6],
                'content' => '<h2>Неделя должна быть выполнимой</h2><p>Лучший план — не самый сложный, а тот, который можно удерживать месяцами. Для начала подойдут 3 силовые тренировки плюс 1–2 короткие кардио-сессии.</p><h3>Базовый шаблон</h3><p>Понедельник — силовая, среда — силовая, пятница — силовая. Во вторник или субботу можно добавить шаги, велосипед или лёгкую интервальную работу.</p><h3>Оставьте место для жизни</h3><p>Не заполняйте график до предела. Гибкость помогает не выпадать из режима, если неделя получилась сложной.</p>',
            ],
            [
                'title' => 'Что есть до и после тренировки',
                'slug' => 'chto-est-do-i-posle-trenirovki',
                'excerpt' => 'Разбираем, как питаться вокруг тренировки, чтобы было больше энергии и лучшее восстановление.',
                'cover_image_url' => '/seed-images/articles/pitanie-do-posle.png',
                'category' => 'nutrition', 'reading_time_minutes' => 4, 'views_count' => 690, 'helpful_count' => 44,
                'is_featured' => false, 'is_trainer_article' => true, 'author_user_id' => $authors['dmitry']?->id,
                'status' => 'published', 'published_at' => now()->subDays(4), 'tags' => [2],
                'content' => '<h2>Питание вокруг тренировки</h2><p>Если вы тренируетесь не натощак, за 1.5–2 часа до занятия подойдёт еда с белком и углеводами: рис с курицей, овсянка с йогуртом, сэндвич с индейкой.</p><h3>После тренировки</h3><p>Задача — восполнить энергию и дать строительный материал. Хороший вариант — белок плюс углеводы: творог с фруктами, рис и рыба, протеин и банан.</p><p>Главное — не искать идеальный рецепт, а соблюдать общую системность питания.</p>',
            ],
            [
                'title' => 'Мобильность и растяжка после сидячего дня',
                'slug' => 'mobilnost-i-rastyazhka-posle-sidyachego-dnya',
                'excerpt' => 'Короткий комплекс для спины, плеч и тазобедренных суставов после долгого рабочего дня.',
                'cover_image_url' => '/seed-images/articles/mobilnost-rastyazhka.png',
                'category' => 'recovery', 'reading_time_minutes' => 5, 'views_count' => 540, 'helpful_count' => 39,
                'is_featured' => false, 'is_trainer_article' => true, 'author_user_id' => $authors['elena']?->id,
                'status' => 'published', 'published_at' => now()->subDays(2), 'tags' => [3, 4],
                'content' => '<h2>Разгрузка после офиса</h2><p>Если вы долго сидите, полезно включать короткие комплексы на грудной отдел, тазобедренные и заднюю линию тела. Это уменьшает скованность и помогает легче входить в тренировки.</p><h3>Простой комплекс</h3><p>Подойдут раскрытия грудной клетки у стены, выпады с акцентом на тазобедренный сустав, кошка-корова и мягкая растяжка задней поверхности бедра.</p><p>Даже 10–12 минут вечером дают заметное ощущение подвижности и лёгкости.</p>',
            ],
        ];

        foreach ($articles as $articleData) {
            $articleTags = $articleData['tags'] ?? [];
            unset($articleData['tags']);

            $payload = $this->filterColumns('articles', $articleData);
            $article = Article::updateOrCreate(['slug' => $articleData['slug']], $payload);

            if (!empty($articleTags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($articleTags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $article->tags()->sync($selectedTags);
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
