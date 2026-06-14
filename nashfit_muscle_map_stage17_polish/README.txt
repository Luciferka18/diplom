NASHFIT MUSCLE MAP STAGE17 POLISH

Что исправлено:
- убрано сообщение "API пока недоступен — показываю fallback-данные" из интерфейса;
- исправлена проблема, когда при нажатии на область тела открывалась не та мышца;
- теперь взаимодействие идёт через отдельный аккуратный overlay SVG с правильными data-muscle slug;
- исходная красивая SVG-карта остаётся визуальной базой: светлое тело, чёрные контуры, серый фон;
- подсветка выбранной мышцы остаётся красной и при клике по SVG, и при клике по кнопке/чипу;
- блок стал аккуратнее, компактнее и визуально сбалансированнее;
- секция "Лучшие упражнения" дополнена техникой, оборудованием, основной и дополнительными мышцами;
- служебный текст про video_url удалён;
- блок "Программа под мышцу" показывается только если найдена связанная программа.

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

Как установить:
1. Распакуйте папку nashfit_muscle_map_stage17_polish в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_MUSCLE_MAP_STAGE17_POLISH.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev
4. Laravel должен быть запущен:
   cd fitlab
   php artisan serve

Если данные не подтянулись из Laravel:
cd fitlab
php artisan migrate --force
php artisan db:seed --class=MuscleExerciseSeeder --force
php artisan serve

Откат:
Запустите ROLLBACK_MUSCLE_MAP_STAGE17_POLISH.bat

Важно:
Rollback откатывает код, но не удаляет таблицы muscles/exercises/exercise_muscle из базы автоматически, чтобы случайно не потерять данные.
