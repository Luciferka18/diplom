NASHFIT MUSCLE MAP STAGE19 LAYOUT FIX

Что исправлено:
- чипы/кнопки мышц теперь идут нормальной сеткой по всей ширине блока;
- убран визуальный дисбаланс, когда названия мышц сбивались в маленькую кучку слева;
- активная мышца остаётся красной и в SVG, и в сетке кнопок;
- блок из трёх шагов на главной полностью переработан: теперь это полноценные заметные карточки, а не микро-полоска;
- SVG-карта и backend-часть сохранены от stage18.

Файлы frontend:
- my-app/src/components/muscles/MuscleMap.jsx
- my-app/src/components/home/HomeExperience.jsx

Также внутри архива остаются остальные файлы muscle-map/API из предыдущего патча.

Как установить:
1. Распакуйте папку nashfit_muscle_map_stage19_layout_fix в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_MUSCLE_MAP_STAGE19_LAYOUT_FIX.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev

Laravel:
cd fitlab
php artisan serve

Откат:
ROLLBACK_MUSCLE_MAP_STAGE19_LAYOUT_FIX.bat
