NASHFIT HOME STAGE26 REMOVE COPY

Что исправлено:
- удалён текст на главной:
  "Сохранил чёткую SVG-карту: кликайте по телу или по кнопкам ниже, а справа появятся описание, программа и упражнения."
- удалён текст на главной:
  "Не просто декоративная полоска: каждый шаг ведёт пользователя от выбора цели к регулярным тренировкам и визиту в клуб."
- остальной дизайн, SVG, backend, отступы и логика не менялись.

Главные изменённые файлы:
- my-app/src/components/home/HomeExperience.jsx
- my-app/src/components/muscles/MuscleMap.jsx

Как установить:
1. Распакуйте папку nashfit_home_stage26_remove_copy в корень проекта, где лежат my-app и fitlab.
2. Запустите APPLY_HOME_STAGE26_REMOVE_COPY.bat
3. Перезапустите фронт:
   cd my-app
   npm run dev

Откат:
ROLLBACK_HOME_STAGE26_REMOVE_COPY.bat
