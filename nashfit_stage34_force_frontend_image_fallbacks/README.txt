NASHFIT STAGE34 — FORCE FRONTEND IMAGE FALLBACKS

Если картинки физически скопированы, но API/база не отдают image_url/photo_url/cover_image_url, фронт сам подставит картинки по slug/name/title.

Что исправлено:
- HomeExperience.jsx получил imageFor(kind, item, explicit);
- карточки тренеров, товаров, программ и статей теперь имеют жёсткий fallback на /seed-images/...
- ProductCard.js тоже получил fallback по slug/name;
- добавлен CHECK_STAGE34_IMAGES.cmd для проверки, реально ли картинки лежат в public.

Запуск:
1. APPLY_STAGE34_FORCE_IMAGES.cmd
2. CHECK_STAGE34_IMAGES.cmd
3. Полностью остановить и заново запустить:
   cd fitlab
   php artisan serve

   cd my-app
   npm run dev

Если CHECK показывает 50+ webp и sample files OK, но картинок нет — значит открыт старый dev server или старая страница в браузере.
