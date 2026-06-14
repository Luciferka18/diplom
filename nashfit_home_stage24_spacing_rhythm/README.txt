NASHFIT HOME STAGE24 SPACING RHYTHM

Что исправлено:
- выстроен единый вертикальный ритм на всей главной странице;
- блоки больше не сливаются друг с другом;
- отступы умеренные: не огромные, но достаточно воздуха между разными секциями;
- hero, "О нас", "Как это работает", интерактивная карта, программы, тренеры, журнал, магазин, абонементы, CTA и отзывы приведены к одной логике spacing;
- stage22 НЕ используется: длинный блок не возвращался;
- SVG, подсветка мышц, backend, упражнения и сетка чипов не менялись.

Главные изменённые файлы:
- my-app/src/components/home/HomeExperience.jsx
- my-app/src/components/muscles/MuscleMap.jsx

Как установить:
1. Распакуйте папку nashfit_home_stage24_spacing_rhythm в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_HOME_STAGE24_SPACING_RHYTHM.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev

Откат:
ROLLBACK_HOME_STAGE24_SPACING_RHYTHM.bat
