NASHFIT MEDIA SEEDER STAGE30

Что добавлено поверх stage29:
- avatar_url теперь не просто есть в базе, но и отдаётся в API-ресурсах:
  - ArticleResource
  - ReviewResource
  - BookingResource
  - TrainerResource
- отзывы на главной теперь показывают аватар пользователя, если он есть;
- ProductCard получил более надёжный выбор изображения:
  variant.image_url → product.image_url → gallery[0] → fallback;
- Media на главной получил безопасный onError fallback, чтобы не было битой иконки картинки;
- все картинки по-прежнему лежат в двух местах:
  - fitlab/public/seed-images
  - my-app/public/seed-images

Установка:
1. Распакуйте папку nashfit_media_seeder_stage30_frontend_images в корень проекта.
2. Запустите APPLY_MEDIA_SEEDER_STAGE30.bat
3. Перезапустите backend и frontend:
   cd fitlab
   php artisan serve

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
ROLLBACK_MEDIA_SEEDER_STAGE30.bat
