NASHFIT MUSCLE MAP STAGE15_REAL_SVG

Что это:
Production-ready MVP интерактивной карты мышц для главной страницы НашФит. В Stage15 вместо временного SVG используется реальная SVG-карта из вашего бандла: светлое тело, чёрные контуры, серый фон и отдельные кликабельные регионы мышц.

Frontend:
- my-app/src/components/muscles/MuscleMap.jsx
- my-app/src/components/muscles/MuscleMapSvg.jsx
- my-app/src/components/muscles/MuscleInfoPanel.jsx
- my-app/src/components/muscles/ExerciseCard.jsx
- my-app/src/components/muscles/muscleCatalog.js
- my-app/src/components/home/HomeExperience.jsx

Backend:
- fitlab/app/Models/Muscle.php
- fitlab/app/Models/Exercise.php
- fitlab/app/Http/Controllers/Api/MuscleController.php
- fitlab/database/migrations/2026_06_14_000001_create_muscles_table.php
- fitlab/database/migrations/2026_06_14_000002_create_exercises_table.php
- fitlab/database/migrations/2026_06_14_000003_create_exercise_muscle_table.php
- fitlab/database/seeders/MuscleExerciseSeeder.php
- fitlab/database/seeders/DatabaseSeeder.php
- fitlab/routes/api.php

API:
GET /api/muscles
GET /api/muscles/{slug}
GET /api/muscles/{slug}/exercises
GET /api/exercises/{slug}

Мышцы MVP:
chest, shoulders, biceps, triceps, forearms, abs, obliques, lats, traps, lower_back, glutes, quads, hamstrings, calves

Техническое решение:
- Это НЕ PNG-карта.
- MuscleMapSvg.jsx — inline SVG в JSX.
- Каждая мышца — отдельный интерактивный SVG path с data-muscle / slug.
- Hover и active подсвечиваются красным #ff4d4f.
- Базовое тело светлое, с чёрными контурами, на сером фоне.
- Временный SVG можно заменить на финальный дизайнерский: главное сохранить slug регионов.

Как установить:
1. Распакуйте папку nashfit_muscle_map_stage15_real_svg в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_MUSCLE_MAP_STAGE15_REAL_SVG.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev
4. Laravel должен быть запущен:
   cd fitlab
   php artisan serve

Если миграции не выполнились:
cd fitlab
php artisan migrate --force
php artisan db:seed --class=MuscleExerciseSeeder --force

Откат:
Запустите ROLLBACK_MUSCLE_MAP_STAGE15_REAL_SVG.bat

Важно:
Rollback откатывает код, но не удаляет таблицы muscles/exercises/exercise_muscle из базы автоматически.
Это сделано специально, чтобы случайно не потерять данные.


STAGE15 REAL SVG:
- MuscleMapSvg.jsx содержит ваш реальный inline SVG, а не PNG и не <img>.
- В SVG нет <image>, base64, script или foreignObject.
- SVG-слой мышц использует data-muscle и id вида muscle-{slug}.
- Слаг shoulders_delts из бандла нормализован в shoulders, чтобы совпадать с Laravel API и текущими seed-данными.
- Для финальной правки формы мышц меняйте только SVG внутри:
  my-app\src\components\muscles\MuscleMapSvg.jsx
