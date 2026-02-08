# FitLab (Laravel API + Next.js frontend)

Проект: фитнес-платформа с разделами:
- главная страница,
- онлайн-программы,
- тренеры,
- магазин спортпита,
- корзина и оформление заказа,
- контакты.

## 1) Что уже есть в backend (Laravel)

### Бизнес-модули
- `Auth`: регистрация/вход/выход (Sanctum token).
- `Home`: агрегированные данные для главной.
- `Programs`: онлайн-программы тренировок.
- `Trainers`: каталог тренеров.
- `Products`: каталог товаров.
- `Cart`: корзина авторизованного пользователя.
- `Orders`: оформление заказа (включая из корзины).

### Ключевые контроллеры
- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Controllers/Api/HomeController.php`
- `app/Http/Controllers/Api/ProgramController.php`
- `app/Http/Controllers/Api/TrainerController.php`
- `app/Http/Controllers/Api/ProductController.php`
- `app/Http/Controllers/Api/CartController.php`
- `app/Http/Controllers/Api/OrderController.php`

### Ключевые модели
- `app/Models/User.php`
- `app/Models/Program.php`
- `app/Models/Trainer.php`
- `app/Models/Product.php`
- `app/Models/Order.php`
- `app/Models/OrderItem.php`

## 2) API разделы (роуты)

Публичные:
- `GET /api/home`
- `GET /api/trainers`, `GET /api/trainers/{id}`
- `GET /api/programs`, `GET /api/programs/{id}`
- `GET /api/products`, `GET /api/products/{id}`
- `POST /api/orders` (гостевой быстрый заказ)
- `POST /api/auth/register`
- `POST /api/auth/login`

Только для авторизованных (Sanctum):
- `POST /api/auth/logout`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/{itemId}`
- `DELETE /api/cart/items/{itemId}`
- `POST /api/cart/checkout`

## 3) Как связать Laravel с Next.js

## Вариант A (рекомендуется для старта): Bearer token (Sanctum personal access token)
1. Next отправляет `POST /api/auth/login`.
2. Laravel возвращает `token`.
3. Next хранит токен (лучше в httpOnly cookie через свой backend-route/proxy).
4. Для защищённых запросов Next добавляет заголовок:
   - `Authorization: Bearer <token>`

Плюсы: просто и быстро.

## Вариант B: Sanctum SPA (cookie + CSRF)
Подходит, если frontend и API на соседних доменах и нужен session-based auth.
Для текущего проекта можно перейти позже.

## 4) Рекомендуемая структура Next.js (app router)

```text
app/
  page.tsx                   # Главная
  programs/page.tsx          # Онлайн-программы
  programs/[slug]/page.tsx   # Детали программы
  trainers/page.tsx          # Тренеры
  shop/page.tsx              # Магазин
  cart/page.tsx              # Корзина
  contacts/page.tsx          # Контакты
  login/page.tsx
  register/page.tsx

lib/
  api.ts                     # fetch-клиент
  auth.ts                    # хранение/обновление токена

components/
  layout/
  home/
  programs/
  trainers/
  shop/
```

## 5) Что ещё можно добавить в проект
- Личный кабинет пользователя: мои заказы, прогресс, избранные программы.
- Календарь тренировок и бронирование занятий.
- Фильтрация каталога (цель, уровень, цена, длительность).
- Блог/статьи и SEO-страницы.
- Админ-панель (CRUD для программ, тренеров, товаров, заказов).

## 6) Запуск Laravel API

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## 7) Тесты

```bash
php artisan test
```

## 8) Публикация изменений в GitHub (Windows, простыми словами)

Если ты сделал изменения локально, но не видишь их на GitHub, проверь шаги:

```powershell
cd D:\diplom
git status
git branch -vv
git remote -v
```

Дальше стандартный цикл:

```powershell
git add .
git commit -m "update diploma project"
git push origin main
```

Если появляется окно **Authorize Git Credential Manager** — это нормально.
Нажми **Authorize git-ecosystem** и повтори `git push`.

Если ошибка `src refspec work does not match any`, значит ты пушишь ветку,
которой нет локально. Либо пушь текущую:

```powershell
git push origin main
```

Либо сначала создай нужную ветку:

```powershell
git checkout -b work
git push -u origin work
```

