NASHFIT MEDIA SEEDER STAGE27

Что внутри:
- 28 оптимизированных WebP-картинок для сайта:
  - 3 фото тренеров;
  - 5 обложек статей;
  - 20 изображений товаров: по 2 изображения на каждый товар.
- обновлённые сидеры:
  - TrainerSeeder.php — фото тренеров через photo_url;
  - ArticleSeeder.php — cover_image_url, excerpt, category, reading_time_minutes и контент;
  - ProductSeeder.php — image_url, gallery, attributes, badges и product_variants с отдельными image_url.
- картинки лежат в:
  fitlab/public/seed-images

Публичные URL будут такие:
- /seed-images/trainers/anna-kuznetsova.webp
- /seed-images/articles/kak-nachat-trenirovatsya.webp
- /seed-images/products/whey-protein-gold-standard/main.webp
и так далее.

Как установить:
1. Распакуйте папку nashfit_media_seeder_stage27 в корень проекта, где лежат my-app и fitlab.
2. Запустите:
   APPLY_MEDIA_SEEDER_STAGE27.bat
3. Батник скопирует картинки и сидеры, выполнит:
   php artisan migrate --force
   php artisan db:seed --class=TrainerSeeder --force
   php artisan db:seed --class=ProductSeeder --force
   php artisan db:seed --class=ArticleSeeder --force
   php artisan db:seed --class=MuscleExerciseSeeder --force
4. Перезапустите frontend:
   cd my-app
   npm run dev

Если нужно вручную:
cd fitlab
php artisan migrate --force
php artisan db:seed --class=TrainerSeeder --force
php artisan db:seed --class=ProductSeeder --force
php artisan db:seed --class=ArticleSeeder --force

Откат:
ROLLBACK_MEDIA_SEEDER_STAGE27.bat

Важно:
Rollback удаляет папку fitlab/public/seed-images и возвращает бэкапы сидеров, если они были созданы батником.
Данные, уже записанные в базу, rollback не удаляет автоматически.
