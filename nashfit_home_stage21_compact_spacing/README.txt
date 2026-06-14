NASHFIT HOME STAGE21 COMPACT SPACING

Что исправлено:
- уменьшены вертикальные отступы между основными блоками на главной;
- главная теперь выглядит более цельной и плотной;
- hero, "О нас", карта залов, блок шагов, muscle map, программы, тренеры, журнал, магазин и отзывы стали ближе друг к другу;
- внутренние отступы карточек немного уменьшены, но без превращения страницы в кашу;
- SVG-карта мышц, подсветка, backend и логика выбора не менялись.

Главные изменённые файлы:
- my-app/src/components/home/HomeExperience.jsx
- my-app/src/components/muscles/MuscleMap.jsx

Как установить:
1. Распакуйте папку nashfit_home_stage21_compact_spacing в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_HOME_STAGE21_COMPACT_SPACING.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev

Откат:
ROLLBACK_HOME_STAGE21_COMPACT_SPACING.bat
