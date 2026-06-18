<?php

return [
    'enabled' => env('YOOKASSA_ENABLED', true),
    'shop_id' => env('YOOKASSA_SHOP_ID'),
    'secret_key' => env('YOOKASSA_SECRET_KEY'),
    'api_url' => env('YOOKASSA_API_URL', 'https://api.yookassa.ru/v3'),
    'return_url' => env('YOOKASSA_RETURN_URL', env('FRONTEND_URL', 'http://localhost:3000') . '/payment/success'),
    'fail_url' => env('YOOKASSA_FAIL_URL', env('FRONTEND_URL', 'http://localhost:3000') . '/payment/fail'),
    'currency' => env('YOOKASSA_CURRENCY', 'RUB'),
];
