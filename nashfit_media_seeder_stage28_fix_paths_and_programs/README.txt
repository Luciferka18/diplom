NASHFIT MEDIA SEEDER STAGE28

Что исправлено:
- исправлена главная проблема с непрогружающимися картинками:
  теперь все seed-images копируются не только в fitlab/public/seed-images,
  но и в my-app/public/seed-images, поэтому Next.js тоже видит пути вида /seed-images/...
- добавлены картинки для программ;
- обновлён ProgramSeeder с image_url на все программы;
- TrainerSeeder, ProductSeeder и ArticleSeeder сохранены;
- ProductSeeder по-прежнему добавляет по 2 изображения на каждый товар и варианты товаров с отдельными image_url.

Итог:
- тренеры: с фото;
- статьи: с обложками;
- товары: с картинками, галереями и вариантами;
- программы: с картинками;
- сайт выглядит заметно более наполненным.

Установка:
1. Распакуйте папку nashfit_media_seeder_stage28_fix_paths_and_programs в корень проекта.
2. Запустите APPLY_MEDIA_SEEDER_STAGE28.bat
3. Перезапустите frontend:
   cd my-app
   npm run dev

Если нужно вручную:
cd fitlab
php artisan migrate --force
php artisan db:seed --class=TrainerSeeder --force
php artisan db:seed --class=ProductSeeder --force
php artisan db:seed --class=ProgramSeeder --force
php artisan db:seed --class=ArticleSeeder --force
php artisan db:seed --class=MuscleExerciseSeeder --force

Откат:
ROLLBACK_MEDIA_SEEDER_STAGE28.bat
