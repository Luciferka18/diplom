NASHFIT MEDIA SEEDER STAGE29

Что добавлено:
- аватары для всех пользователей (admin, trainers, clients);
- фото для всех тренеров;
- картинки для всех товаров, включая галерею и варианты;
- картинки для всех программ;
- обложки для всех статей;
- все seed-images доступны и в Laravel, и в Next.js.

Что сделано технически:
- добавлен users.avatar_url через миграцию;
- обновлён App\Models\User;
- добавлен UserSeeder с аватарами для всех пользователей;
- сохранены TrainerSeeder, ProductSeeder, ProgramSeeder, ArticleSeeder;
- изображения копируются в fitlab/public/seed-images и my-app/public/seed-images.

Установка:
1. Распакуйте папку nashfit_media_seeder_stage29_all_entities_images в корень проекта.
2. Запустите APPLY_MEDIA_SEEDER_STAGE29.bat
3. Перезапустите frontend:
   cd my-app
   npm run dev

Если вручную:
cd fitlab
php artisan migrate --force
php artisan db:seed --class=UserSeeder --force
php artisan db:seed --class=TrainerSeeder --force
php artisan db:seed --class=ProductSeeder --force
php artisan db:seed --class=ProgramSeeder --force
php artisan db:seed --class=ArticleSeeder --force
php artisan db:seed --class=MuscleExerciseSeeder --force

Откат:
ROLLBACK_MEDIA_SEEDER_STAGE29.bat
