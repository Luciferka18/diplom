NASHFIT HOME STAGE22 STEPS FIX

Что исправлено:
- блок "Как это работает" полностью переделан;
- больше нет мелкой зажатой строки с огромными цифрами;
- теперь это аккуратный цельный блок: intro-card + 3 нормальные карточки шагов;
- карточки стали читаемыми, с нормальной высотой, иконками и текстовой иерархией;
- остальные части главной, SVG-карта мышц и backend не трогались.

Главный изменённый файл:
- my-app/src/components/home/HomeExperience.jsx

Как установить:
1. Распакуйте папку nashfit_home_stage22_steps_fix в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_HOME_STAGE22_STEPS_FIX.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev

Откат:
ROLLBACK_HOME_STAGE22_STEPS_FIX.bat
