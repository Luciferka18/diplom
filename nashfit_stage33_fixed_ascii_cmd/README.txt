NASHFIT STAGE33 — FIXED ASCII CMD

В stage32 CMD сломал русские строки в bat-файле. В этом stage:
- запускной файл полностью ASCII-only;
- расширение .cmd;
- CRLF-строки;
- никаких русских команд внутри .cmd.

Запуск:
APPLY_STAGE33_ONE_CLICK_MEDIA_SEED.cmd

Он сам:
- копирует изображения в my-app/public/seed-images;
- копирует изображения в fitlab/public/seed-images;
- копирует обновлённые сидеры;
- запускает migrate;
- запускает UserSeeder, TrainerSeeder, ProductSeeder, ProgramSeeder, ArticleSeeder, MuscleExerciseSeeder.

После запуска:
cd fitlab
php artisan serve

cd my-app
npm run dev

Откат файлов:
ROLLBACK_STAGE33_ONE_CLICK_MEDIA_SEED.cmd
