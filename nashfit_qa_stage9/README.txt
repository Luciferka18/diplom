NashFit QA Stage 9

Adds Laravel command:
  php artisan nashfit:qa
  php artisan nashfit:qa --fix
  php artisan nashfit:qa --fix --seed

The command checks key tables, columns and demo-content readiness.
The --fix mode only adds missing tables/columns used by NashFit modules.
It does not delete users, products, orders, articles, uploads or .env.
