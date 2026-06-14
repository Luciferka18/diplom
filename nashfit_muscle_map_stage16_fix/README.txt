NASHFIT MUSCLE MAP STAGE16 FIX

Что это:
Патч для интерактивной карты мышц на главной странице НашФит.

Что исправлено относительно предыдущей версии:
- при клике по чипу/кнопке мышцы соответствующая мышца в SVG теперь гарантированно остаётся красной;
- active-состояние больше не зависит от post-render querySelector, SVG пересобирается уже с active-классом;
- блок стал компактнее и сбалансированнее по высоте;
- карточка справа стала короче: показываются 3 упражнения вместо длинного списка;
- удалён служебный текст про video_url;
- добавлен блок "программа под мышцу", но он появляется только если найдена связанная программа;
- backend отдаёт related_programs для мышцы на основе реальных программ из таблицы programs;
- если API недоступен, frontend использует fallback-программы, совпадающие с демо-сидером проекта.

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
- это НЕ PNG-карта;
- MuscleMapSvg.jsx содержит реальный inline SVG;
- в SVG нет <image>, base64, script или foreignObject;
- каждая мышца — отдельный регион с data-muscle;
- hover и active подсвечиваются красным #ff4d4f;
- базовое тело светлое, с чёрными контурами, на сером фоне;
- slug shoulders_delts из исходного SVG нормализован в shoulders, чтобы совпадать с API.

Как установить:
1. Распакуйте папку nashfit_muscle_map_stage16_fix в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_MUSCLE_MAP_STAGE16_FIX.bat
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
Запустите ROLLBACK_MUSCLE_MAP_STAGE16_FIX.bat

Важно:
Rollback откатывает код, но не удаляет таблицы muscles/exercises/exercise_muscle из базы автоматически, чтобы случайно не потерять данные.
