NASHFIT MEDIA SEEDER STAGE31

Что нового в этом stage:
- добавлены 10 отдельных уникальных портретов тренеров;
- все 10 изображений разложены и в fitlab/public/seed-images/trainers, и в my-app/public/seed-images/trainers;
- такие же изображения добавлены в users, чтобы тренеры имели собственные avatar_url;
- TrainerSeeder обновлён до 10 тренеров;
- UserSeeder обновлён: у каждого тренера теперь своя аватарка;

Что уже входит из прошлых stage:
- картинки товаров, программ, статей;
- аватары пользователей;
- фронтовые фиксы для отображения картинок;

Установка:
1. Распакуйте папку nashfit_media_seeder_stage31_trainer_avatars_pack в корень проекта.
2. Запустите APPLY_MEDIA_SEEDER_STAGE31.bat
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
ROLLBACK_MEDIA_SEEDER_STAGE31.bat
