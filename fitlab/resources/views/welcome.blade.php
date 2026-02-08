<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FitLab Gym</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <header class="topbar">
        <div class="container topbar__inner">
            <div class="brand">FitLab</div>
            <nav class="nav">
                <a href="#programs">Программы</a>
                <a href="#trainers">Тренеры</a>
                <a href="#shop">Магазин</a>
                <a href="#contacts">Контакты</a>
            </nav>
            <a class="btn btn--small" href="#contacts">Записаться</a>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container hero__grid">
                <div>
                    <p class="badge">Фитнес-клуб и онлайн-платформа</p>
                    <h1>Тренируйся умно. Результат видно уже через 4 недели.</h1>
                    <p class="lead">
                        Персональные программы, опытные тренеры и магазин спортпита в одном месте.
                        Подходит новичкам и тем, кто хочет выйти на новый уровень.
                    </p>
                    <div class="hero__actions">
                        <a class="btn" href="#programs">Выбрать программу</a>
                        <a class="btn btn--ghost" href="#trainers">Посмотреть тренеров</a>
                    </div>
                </div>
                <div class="card hero__card">
                    <h3>Почему FitLab</h3>
                    <ul>
                        <li>✔ Программы под цель: похудение, набор массы, рельеф</li>
                        <li>✔ Поддержка тренера и контроль прогресса</li>
                        <li>✔ Питание и добавки без лишней "воды"</li>
                    </ul>
                </div>
            </div>
        </section>

        <section id="programs" class="section">
            <div class="container">
                <h2>Популярные программы</h2>
                <div class="grid grid--3">
                    <article class="card">
                        <h3>Сушка 8 недель</h3>
                        <p>Силовые + кардио, план питания и чек-листы по привычкам.</p>
                        <span class="price">от 4 990 ₽</span>
                    </article>
                    <article class="card">
                        <h3>Набор массы</h3>
                        <p>Фокус на базовые упражнения, прогрессия нагрузок и восстановление.</p>
                        <span class="price">от 5 490 ₽</span>
                    </article>
                    <article class="card">
                        <h3>Функциональный старт</h3>
                        <p>Для новичков: безопасная техника, мобильность и умеренный темп.</p>
                        <span class="price">от 3 990 ₽</span>
                    </article>
                </div>
            </div>
        </section>

        <section id="trainers" class="section section--alt">
            <div class="container">
                <h2>Тренерский состав</h2>
                <div class="grid grid--3">
                    <article class="card trainer">
                        <h3>Алексей Воронов</h3>
                        <p>Силовой тренинг, опыт 9 лет</p>
                    </article>
                    <article class="card trainer">
                        <h3>Марина Лещенко</h3>
                        <p>Снижение веса и реабилитация, опыт 7 лет</p>
                    </article>
                    <article class="card trainer">
                        <h3>Олег Никитин</h3>
                        <p>Функциональный тренинг и ОФП, опыт 8 лет</p>
                    </article>
                </div>
            </div>
        </section>

        <section id="shop" class="section">
            <div class="container banner">
                <div>
                    <h2>Магазин спортивного питания</h2>
                    <p>Протеины, аминокислоты, витамины и батончики — только проверенные бренды.</p>
                </div>
                <a class="btn" href="#contacts">Получить подбор</a>
            </div>
        </section>
    </main>

    <footer id="contacts" class="footer">
        <div class="container footer__inner">
            <div>
                <h3>FitLab Gym</h3>
                <p>Москва, ул. Спортивная, 10</p>
            </div>
            <div>
                <p>+7 (999) 000-00-00</p>
                <p>fitlab@example.com</p>
            </div>
        </div>
    </footer>
</body>
</html>
