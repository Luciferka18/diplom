NASHFIT HOME STAGE23 SPACING BALANCE

Что исправлено:
- откатил слишком длинный блок из stage22;
- вернул компактный блок "Как это работает" из stage21;
- не растягивал карточки;
- только чуть увеличил вертикальный воздух вокруг блока шагов;
- чуть увеличил отступ до интерактивной карты мышц;
- SVG, подсветка, backend, чипы мышц и упражнения не менялись.

Главные изменённые файлы:
- my-app/src/components/home/HomeExperience.jsx
- my-app/src/components/muscles/MuscleMap.jsx

Как установить:
1. Распакуйте папку nashfit_home_stage23_spacing_balance в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_HOME_STAGE23_SPACING_BALANCE.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev

Откат:
ROLLBACK_HOME_STAGE23_SPACING_BALANCE.bat
