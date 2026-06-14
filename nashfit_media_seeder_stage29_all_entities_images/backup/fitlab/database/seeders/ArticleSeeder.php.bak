<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $authors = collect([
            'anna@nashfit.local' => 'Анна Кузнецова',
            'dmitry@nashfit.local' => 'Дмитрий Сильнов',
            'elena@nashfit.local' => 'Елена Фитнесова',
        ])->map(function (string $name, string $email) {
            return User::firstOrCreate(
                ['email' => $email],
                [
                    'login' => str_replace(['@nashfit.local', '.'], '', $email),
                    'name' => $name,
                    'phone' => '+79990000000',
                    'role' => 'trainer',
                    'password' => Hash::make('trainer123'),
                ]
            );
        });

        $tagIds = Tag::pluck('id')->toArray();

        $articles = [
            [
                'title' => 'Как начать тренироваться: руководство для новичков',
                'slug' => 'kak-nachat-trenirovatsya-rukovodstvo-dlya-novichkov',
                'excerpt' => 'Пошаговый старт для новичка: цель, тип тренировок, расписание, техника и первые безопасные нагрузки.',
                'cover_image_url' => '/seed-images/articles/kak-nachat-trenirovatsya.webp',
                'category' => 'Тренировки',
                'reading_time_minutes' => 6,
                'views_count' => 1280,
                'helpful_count' => 87,
                'is_featured' => true,
                'is_trainer_article' => true,
                'author_user_id' => $authors['anna@nashfit.local']->id,
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'tags' => [5],
                'content' => <<<'EOT'
# Введение

Начало тренировочного пути — важный этап. Главное — не пытаться сделать всё сразу, а выстроить понятную систему.

## Основные принципы

1. **Постепенность** — нагрузка растёт по плану.
2. **Регулярность** — 3 короткие тренировки лучше одной случайной.
3. **Техника** — правильное выполнение важнее рабочего веса.
4. **Восстановление** — сон и питание влияют на прогресс не меньше упражнений.

## С чего начать

### Шаг 1: Определите цель

Выберите главный фокус: похудение, набор массы, здоровье, осанка или общая форма.

### Шаг 2: Выберите формат

Домашние тренировки подходят для старта, зал даёт больше оборудования, а тренер помогает быстрее поставить технику.

### Шаг 3: Составьте план

План должен включать расписание, упражнения, питание и контроль прогресса.
EOT
            ],
            [
                'title' => 'Питание для набора мышечной массы',
                'slug' => 'pitanie-dlya-nabora-myshechnoy-massy',
                'excerpt' => 'Как набрать массу без хаоса: калории, белок, углеводы, жиры и питание вокруг тренировки.',
                'cover_image_url' => '/seed-images/articles/pitanie-dlya-massy.webp',
                'category' => 'Питание',
                'reading_time_minutes' => 7,
                'views_count' => 1640,
                'helpful_count' => 112,
                'is_featured' => true,
                'is_trainer_article' => true,
                'author_user_id' => $authors['dmitry@nashfit.local']->id,
                'status' => 'published',
                'published_at' => now()->subDays(10),
                'tags' => [2],
                'content' => <<<'EOT'
# Питание для роста мышц

Набор мышечной массы требует не только тренировок, но и грамотного рациона.

## Калорийность

Для роста нужен умеренный профицит калорий — обычно 10–20% выше поддержки.

## Макронутриенты

### Белки
1.6–2.2 г на кг веса тела. Источники: мясо, рыба, яйца, творог, протеин.

### Углеводы
Нужны для энергии и восстановления. Источники: крупы, картофель, макароны, фрукты.

### Жиры
Поддерживают гормональную систему. Источники: орехи, масла, авокадо, жирная рыба.

## До и после тренировки

До тренировки — белок и сложные углеводы. После — белок и углеводы для восстановления.
EOT
            ],
            [
                'title' => 'Йога для начинающих: первые шаги',
                'slug' => 'yoga-dlya-nachinayushchikh-pervye-shagi',
                'excerpt' => 'Что нужно для первой практики: коврик, базовые асаны, дыхание и комфортный темп без перегруза.',
                'cover_image_url' => '/seed-images/articles/yoga-dlya-nachinayushchikh.webp',
                'category' => 'Йога',
                'reading_time_minutes' => 5,
                'views_count' => 920,
                'helpful_count' => 68,
                'is_featured' => false,
                'is_trainer_article' => true,
                'author_user_id' => $authors['elena@nashfit.local']->id,
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'tags' => [4, 5],
                'content' => <<<'EOT'
# Йога для начинающих

Йога — это работа с телом, дыханием и вниманием.

## Что нужно для начала

- Коврик.
- Удобная одежда.
- Спокойное место.
- 15–20 минут времени.

## Базовые асаны

Начните с позы горы, дерева и воина. Не форсируйте растяжку и держите ровное дыхание.

## Рекомендации

Практикуйте регулярно, но мягко. Комфорт и контроль важнее глубины позы.
EOT
            ],
            [
                'title' => '5 ошибок при похудении',
                'slug' => '5-oshibok-pri-pokhudenii',
                'excerpt' => 'Разбираем ошибки, которые мешают снижать вес: слишком жёсткий дефицит, только кардио, плохой сон и ожидание быстрых результатов.',
                'cover_image_url' => '/seed-images/articles/oshibki-pri-pokhudenii.webp',
                'category' => 'Похудение',
                'reading_time_minutes' => 6,
                'views_count' => 1870,
                'helpful_count' => 143,
                'is_featured' => true,
                'is_trainer_article' => true,
                'author_user_id' => $authors['anna@nashfit.local']->id,
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'tags' => [1],
                'content' => <<<'EOT'
# Ошибки при похудении

Похудение работает лучше, когда стратегия спокойная и долгосрочная.

## 1. Слишком большой дефицит

Жёсткие ограничения часто приводят к срывам и потере мышц.

## 2. Исключение целых групп продуктов

Баланс важнее запретов.

## 3. Только кардио

Силовые тренировки помогают сохранить мышцы и форму.

## 4. Ожидание быстрых результатов

Здоровый темп — примерно 0.5–1 кг в неделю.

## 5. Игнорирование сна и стресса

Сон, восстановление и управление стрессом напрямую влияют на результат.
EOT
            ],
            [
                'title' => 'Восстановление после тренировки',
                'slug' => 'vosstanovlenie-posle-trenirovki',
                'excerpt' => 'Как мышцы восстанавливаются после нагрузки и что помогает прогрессировать: сон, питание, растяжка, вода и активное восстановление.',
                'cover_image_url' => '/seed-images/articles/vosstanovlenie-posle-trenirovki.webp',
                'category' => 'Восстановление',
                'reading_time_minutes' => 5,
                'views_count' => 1110,
                'helpful_count' => 75,
                'is_featured' => false,
                'is_trainer_article' => true,
                'author_user_id' => $authors['dmitry@nashfit.local']->id,
                'status' => 'published',
                'published_at' => now()->subDays(7),
                'tags' => [3],
                'content' => <<<'EOT'
# Восстановление — ключ к прогрессу

Мышцы растут не во время тренировки, а во время восстановления.

## Что помогает

- Сон 7–9 часов.
- Достаточное количество белка.
- Вода и электролиты.
- Лёгкая активность в дни отдыха.
- Растяжка и работа с мобильностью.

## Когда нужен отдых

Если падают силовые, ухудшается сон и пропадает мотивация — нагрузку стоит снизить.
EOT
            ],
        ];

        foreach ($articles as $articleData) {
            $tags = $articleData['tags'] ?? [];
            unset($articleData['tags']);

            $payload = $this->filterColumns('articles', $articleData);

            $article = Article::updateOrCreate(
                ['slug' => $articleData['slug']],
                $payload
            );

            if (!empty($tags) && !empty($tagIds)) {
                $selectedTags = [];
                foreach ($tags as $tagIndex) {
                    if (isset($tagIds[$tagIndex - 1])) {
                        $selectedTags[] = $tagIds[$tagIndex - 1];
                    }
                }
                if (!empty($selectedTags)) {
                    $article->tags()->syncWithoutDetaching($selectedTags);
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
