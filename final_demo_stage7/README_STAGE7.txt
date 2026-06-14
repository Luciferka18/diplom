NashFit Stage 7: stable demo content and homepage data

This patch replaces the demo seeder with a safer version:
- reuses existing tags by slug or name;
- reuses existing categories by slug or name;
- fills trainers, services, schedules, programs, articles, products, variants, reviews, bookings, orders, payments, memberships, promos and recommendations;
- adds shop collections and related products;
- does not run migrate:fresh;
- can be repeated without creating duplicate core records.

Commands after applying:
php artisan nashfit:seed-demo --force
php artisan nashfit:clear-demo --force
