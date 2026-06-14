NashFit Showcase Seed Stage 13

What it does:
- Replaces NashfitDemoContentSeeder with a richer, safer idempotent demo seeder.
- Refreshes demo trainers, programs, articles, products, orders, bookings, payments, reviews, recommendations.
- Keeps user data, .env, vendor and node_modules untouched.
- Membership page shows only: 3 free visits, 1, 3, 6, 12 and 24 months.
- Adds/refreshes demo SVG assets.

Install:
1. Extract into D:\diplom
2. Run nashfit_showcase_seed_stage13\APPLY_SHOWCASE_SEED_STAGE13.bat
3. Restart frontend/backend if needed.

Useful commands:
cd D:\diplom\fitlab
php artisan nashfit:seed-demo --force
php artisan nashfit:clear-demo --force
