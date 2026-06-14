NASHFIT STAGE32 — ONE CLICK MEDIA SEED

Это one-click stage: просто запускаете APPLY_STAGE32_ONE_CLICK_MEDIA_SEED.bat, и он сам:
- копирует изображения в my-app/public/seed-images;
- копирует изображения в fitlab/public/seed-images;
- копирует обновлённые сидеры;
- запускает миграции;
- запускает все нужные сидеры.

После применения должны появиться:
- аватары пользователей;
- 10 тренеров с отдельными фото;
- товары с image_url, gallery и variant image_url;
- программы с image_url;
- статьи с cover_image_url.

Установка:
1. Распакуйте папку nashfit_stage32_one_click_media_seed в корень проекта.
2. Рядом должны лежать папки my-app и fitlab.
3. Запустите APPLY_STAGE32_ONE_CLICK_MEDIA_SEED.bat.
4. Перезапустите:
   cd fitlab
   php artisan serve

   cd my-app
   npm run dev

Откат файлов:
ROLLBACK_STAGE32_ONE_CLICK_MEDIA_SEED.bat
