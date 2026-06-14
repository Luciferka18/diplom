NASHFIT MUSCLE MAP STAGE18

Что исправлено:
- вернул подсветку как была: используется исходная SVG-карта, без overlay-рисования поверх тела;
- вернул чёткость исходной SVG: белое тело, чёрные контуры, серый фон, оригинальные path-регионы;
- исправил неправильные названия/slug внутри SVG: теперь нажатие на ягодицы открывает ягодицы, пресс открывает пресс и т.д.;
- active-подсветка остаётся красной и при клике по SVG, и при клике по кнопке мышцы;
- убрал публичное сообщение про fallback/API;
- переделал дизайн блока: меньше вертикальная растянутость, карта и информация в одной компактной карточке, упражнения вынесены ниже сеткой;
- дополнил лучшие упражнения: техника, частая ошибка, оборудование, основные и дополнительные мышцы;
- программа под мышцу показывается только если связанная программа найдена.

Главные файлы:
- my-app/src/components/muscles/MuscleMap.jsx
- my-app/src/components/muscles/MuscleMapSvg.jsx
- my-app/src/components/muscles/MuscleInfoPanel.jsx
- my-app/src/components/muscles/ExerciseCard.jsx
- fitlab/app/Http/Controllers/Api/MuscleController.php

Как установить:
1. Распакуйте папку nashfit_muscle_map_stage18_svg_labels_design в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_MUSCLE_MAP_STAGE18.bat
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
Запустите ROLLBACK_MUSCLE_MAP_STAGE18.bat
