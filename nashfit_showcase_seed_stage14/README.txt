NashFit Showcase Seed Stage 14

What it does:
- Replaces NashfitDemoContentSeeder with a richer, safer idempotent demo seeder.
- Refreshes demo trainers, programs, articles, products, orders, bookings, payments, reviews, recommendations.
- Keeps user data, .env, vendor and node_modules untouched.
- Membership page shows only: 3 free visits, 1 month, 3 months, 6 months, 1 year and 2 years.
- Adds/refreshes demo SVG assets.

Install:
1. Extract into D:\diplom
2. Run nashfit_showcase_seed_stage14\APPLY_SHOWCASE_SEED_STAGE14.bat
3. Restart frontend/backend if needed.

Useful commands:
cd D:\diplom\fitlab
php artisan nashfit:seed-demo --force
php artisan nashfit:clear-demo --force
