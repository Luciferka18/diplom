NashFit Stage 12: homepage visual redesign

Что меняет патч:
- полностью переделывает блок "Как начать с НашФит" вместо старой узкой полоски;
- переделывает интерактивное тело: крупнее, аккуратнее, с нормальными зонами и боковой панелью;
- переделывает карточки тренеров: нормальная сетка, портретные карточки, рейтинг, опыт, CTA;
- переделывает журнал: редакционный стиль, крупная главная статья + боковые статьи;
- переделывает магазин: премиальная витрина, SVG-визуалы товаров, цены, статусы и кнопка корзины.

Патч frontend-only:
- Laravel, база, .env, пользователи и данные не трогаются.
- Меняется только файл: my-app/src/components/home/HomeExperience.jsx

Установка:
1. Распаковать архив в корень проекта, где рядом лежат папки my-app и fitlab.
   Пример: D:\diplom\my-app, D:\diplom\fitlab, D:\diplom\nashfit_home_redesign_stage12
2. Запустить:
   nashfit_home_redesign_stage12\APPLY_HOME_REDESIGN_STAGE12.bat
3. Перезапустить frontend:
   cd D:\diplom\my-app
   npm run dev
4. Открыть главную страницу.

Откат:
- Запустить nashfit_home_redesign_stage12\ROLLBACK_HOME_REDESIGN_STAGE12.bat
