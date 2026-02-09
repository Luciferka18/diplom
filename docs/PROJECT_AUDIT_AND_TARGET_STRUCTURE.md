# FitLab — аудит проекта и целевая «чистая» структура

## Что проверено
- Frontend (`my-app`, Next.js App Router, `src/app`, `src/components`, `src/services`).
- Backend (`fitlab`, Laravel API, `routes/api.php`, контроллеры, тесты, миграции).
- Согласованность API-контрактов, роутов, env-конфигов и дубликатов экранов/флоу.

---

## 1) Оставшиеся несоответствия и риски

### Frontend
1. **Два разных подхода к API в одном приложении**  
   Сейчас часть кода ходит через frontend-proxy (`/api/home`), а часть — напрямую в backend (`NEXT_PUBLIC_API_URL || http://localhost:8000`). Это усложняет CORS/окружения и даёт непредсказуемое поведение между dev/prod.

2. **AuthContext не совпадает с backend API**  
   В `AuthContext` используются `GET /auth/me`, `POST /auth/logout`, а также login по `email/password`, но backend реализует только `POST /auth/login` по `login/password` и `POST /auth/register`. Это гарантированно ломает auth-flow.

3. **Несогласованные endpoint’ы для контактов**  
   В одном месте отправка идёт в `/contacts`, в другом — в `/contact` (singular). Backend поддерживает только `/contacts`.

4. **Дубли/расхождение auth-страниц**  
   Есть параллельно `/login` и `/auth/login`, `/register` и `/auth/register`, причём они используют разные endpoint’ы (`/auth/login` vs `/login`, `/auth/register` vs `/register`).

5. **Моковые/черновые страницы рядом с боевыми**  
   Есть ветка блог-страниц (`/blog`) с API, и параллельно `articles` c захардкоженными данными. Это размывает продуктовую логику и создаёт путаницу в навигации/поддержке.

6. **Админка и dashboard используют API, которого нет на backend**  
   `dashboard/products` делает CRUD по `/products`, `admin` отправляет `/workouts`, но соответствующие backend route/controller-методы не реализованы.

7. **Cart checkout не соответствует backend валидации**  
   Checkout отправляет только `items`, а backend требует `customer_name` и `customer_phone`.

### Backend (Laravel)
1. **Неполный API-контракт относительно frontend-ожиданий**  
   Отсутствуют `auth/me`, `auth/logout`, CRUD `products` (create/update/delete), endpoint `workouts`.

2. **README backend нерелевантен проекту**  
   Сейчас это стандартный Laravel readme, без FitLab-инструкций запуска, env и API-контрактов.

3. **Не хватает `fitlab/.env.example` в репозитории**  
   Нет фиксированного шаблона переменных окружения для локального/CI запуска.

4. **API покрыт тестами частично**  
   Есть полезные feature-тесты, но не покрыты ключевые auth и CRUD-флоу, которые уже используются на frontend.

---

## 2) Предложение «чистой» структуры

## Репозиторий

```
/workspace/diplom
  /my-app               # Next.js frontend
  /fitlab               # Laravel backend
  /docs
    PROJECT_AUDIT_AND_TARGET_STRUCTURE.md
    API_CONTRACT.md
    SETUP.md
```

## Frontend (`my-app`)

```
my-app/
  src/
    app/
      (public)/
        page.js
        programs/
        trainers/
        shop/
        blog/
        contacts/
      (auth)/
        login/
        register/
      (account)/
        cart/
      (admin)/
        dashboard/
      api/
        [...path]/route.js      # единый BFF proxy
      layout.js
      globals.css
    components/
    context/
    lib/
      api-client.js             # единый fetch/axios клиент
      schemas/                 # (опционально) zod/валидация ответа
```

Правила:
- Один источник API: **только через `/api/*` proxy** на frontend.
- Один набор auth-страниц: оставить только `(auth)/login` и `(auth)/register` (или только `/login`/`/register`, но один вариант).
- Удалить/архивировать моковые страницы, дублирующие боевые флоу.

## Backend (`fitlab`)

```
fitlab/
  app/Http/Controllers/Api/
    AuthController.php
    ProductController.php
    WorkoutController.php (если нужен)
    ...
  routes/api.php
  tests/Feature/
    AuthApiTest.php
    ProductsCrudApiTest.php
    OrdersApiTest.php
  .env.example
  README.md (проектный)
```

Правила:
- Явно зафиксировать API-контракт и версии (`/api/v1/...` желательно).
- Либо убрать frontend-фичи, которые backend не поддерживает, либо реализовать недостающие endpoint’ы.
- На каждую «критичную» ручку — feature-тест.

---

## 3) Унификация API/env/роутов (практически)

1. **Frontend env**
   - `NEXT_PUBLIC_API_BASE_URL=/api`
   - `BACKEND_ORIGIN=http://127.0.0.1:8000`

2. **Frontend API client**
   - Все вызовы `apiGet/apiPost/...` должны работать только с relative path (`/trainers`, `/orders`), а базовый URL = `/api`.

3. **Backend env**
   - Добавить и поддерживать `fitlab/.env.example`.
   - Настроить `APP_URL`, `SANCTUM_STATEFUL_DOMAINS`/CORS (если будет cookie/token auth).

4. **Роуты и нейминг**
   - Придерживаться plural: `/contacts`, `/products`, `/orders`, `/trainers`.
   - Auth: `/auth/login`, `/auth/register`, `/auth/me`, `/auth/logout`.

---

## 4) Приоритетный план работ

### P0 (критично, чтобы «всё работало стабильно»)
1. Унифицировать frontend API-клиент на `/api` proxy.
2. Исправить endpoint mismatch (`/contact` -> `/contacts`, auth payload/login field).
3. Убрать дубли auth и оставить один рабочий UX-флоу.
4. Согласовать cart checkout payload с backend-валидацией.

### P1 (закрыть функциональные дыры)
1. Либо реализовать backend CRUD для `/products` + `/workouts`, либо скрыть/удалить эти UI-флоу.
2. Добавить `auth/me`, `auth/logout` и соответствующий state management.

### P2 (технический долг/поддерживаемость)
1. Обновить README в `my-app` и `fitlab` под реальный проект.
2. Добавить `fitlab/.env.example`.
3. Расширить feature-тесты на auth и CRUD сценарии.

---

## 5) Критерии готовности

- Любой frontend-запрос идёт через `/api/*`.
- Нет дублей страниц с конкурирующими endpoint’ами.
- Все активные UI-флоу подтверждены backend route’ами.
- Есть минимальный набор e2e/feature-тестов на: auth, catalog, booking, orders.
- Новому разработчику достаточно `SETUP.md` + `.env.example`, чтобы поднять проект локально.
