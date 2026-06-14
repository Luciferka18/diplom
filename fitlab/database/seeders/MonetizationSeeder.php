<?php

namespace Database\Seeders;

use App\Models\Membership;
use App\Models\PromoCode;
use App\Models\Promotion;
use App\Models\TrainerService;
use App\Models\User;
use App\Services\TrialMembershipService;
use Illuminate\Database\Seeder;

class MonetizationSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['name' => '3 бесплатных посещения', 'slug' => 'welcome-3-visits', 'description' => 'Пробное знакомство с залом для новых участников.', 'duration_months' => 1, 'trial_visits' => 3, 'price' => 0, 'features' => ['3 бесплатных посещения', 'Знакомство с залом', 'Помощь администратора'], 'badge' => 'Для новых пользователей', 'is_trial' => true, 'is_featured' => false, 'sort_order' => 0],
            ['name' => '1 месяц', 'slug' => 'membership-1-month', 'description' => 'Гибкий старт без долгих обязательств.', 'duration_months' => 1, 'price' => 390000, 'old_price' => 450000, 'features' => ['Доступ в зал', 'Бесплатные программы', 'Отслеживание прогресса'], 'badge' => 'Старт', 'sort_order' => 10],
            ['name' => '3 месяца', 'slug' => 'membership-3-months', 'description' => 'Оптимальный срок, чтобы увидеть устойчивый результат.', 'duration_months' => 3, 'price' => 990000, 'old_price' => 1170000, 'features' => ['Доступ в зал', 'Бесплатные программы', 'Поддержка прогресса'], 'badge' => 'Популярный', 'is_featured' => true, 'sort_order' => 20],
            ['name' => '6 месяцев', 'slug' => 'membership-6-months', 'description' => 'Полгода системных тренировок по выгодной цене.', 'duration_months' => 6, 'price' => 1740000, 'old_price' => 2340000, 'features' => ['Доступ в зал', 'Бесплатные программы', 'Приоритетные акции'], 'badge' => 'Выгодно', 'sort_order' => 30],
            ['name' => '1 год', 'slug' => 'membership-1-year', 'description' => 'Для тех, кто превращает спорт в привычку.', 'duration_months' => 12, 'price' => 2990000, 'old_price' => 4680000, 'features' => ['Доступ в зал', 'Все бесплатные программы', 'Специальные предложения'], 'badge' => 'Лучшая цена', 'sort_order' => 40],
            ['name' => '2 года', 'slug' => 'membership-2-years', 'description' => 'Максимальная экономия и долгосрочная мотивация.', 'duration_months' => 24, 'price' => 4990000, 'old_price' => 9360000, 'features' => ['Доступ в зал', 'Все бесплатные программы', 'Закрытые акции'], 'badge' => 'Максимум', 'sort_order' => 50],
        ];
        foreach ($plans as $plan) Membership::updateOrCreate(['slug' => $plan['slug']], array_merge(['is_active' => true, 'is_featured' => false, 'is_trial' => false], $plan));

        $services = [
            ['name' => 'Вводная тренировка', 'slug' => 'intro-training', 'description' => 'Знакомство с тренером, залом и техникой базовых упражнений.', 'duration_minutes' => 60, 'price' => 0, 'badge' => 'Первый шаг', 'is_intro' => true, 'sort_order' => 10],
            ['name' => 'Персональная тренировка', 'slug' => 'personal-training', 'description' => 'Индивидуальная тренировка под вашу цель и уровень.', 'duration_minutes' => 60, 'price' => 250000, 'badge' => 'Индивидуально', 'sort_order' => 20],
            ['name' => 'Расширенная тренировка', 'slug' => 'extended-training', 'description' => 'Углублённая работа над техникой, силой и выносливостью.', 'duration_minutes' => 90, 'price' => 340000, 'badge' => '90 минут', 'sort_order' => 30],
            ['name' => 'Консультация тренера', 'slug' => 'trainer-consultation', 'description' => 'Разбор целей, нагрузки, режима и плана тренировок.', 'duration_minutes' => 45, 'price' => 150000, 'badge' => 'Консультация', 'sort_order' => 40],
        ];
        foreach ($services as $service) TrainerService::updateOrCreate(['trainer_id' => null, 'slug' => $service['slug']], array_merge(['is_active' => true, 'is_intro' => false], $service));

        $promotion = Promotion::updateOrCreate(['slug' => 'summer-start'], [
            'name' => 'Летний старт', 'description' => 'Скидка на первый платный продукт НашФит.',
            'discount_type' => 'percent', 'discount_value' => 10, 'applies_to' => ['all'],
            'auto_apply' => false, 'is_active' => true, 'badge' => '−10%',
            'banner_title' => 'Начни тренироваться выгоднее', 'banner_text' => 'Используй промокод START10.',
        ]);
        PromoCode::updateOrCreate(['code' => 'START10'], [
            'promotion_id' => $promotion->id, 'description' => 'Скидка 10% на абонемент, тренировку или товар.',
            'discount_type' => 'percent', 'discount_value' => 10, 'applies_to' => ['all'],
            'minimum_amount' => 0, 'per_user_limit' => 1, 'is_active' => true,
        ]);

        $service = app(TrialMembershipService::class);
        User::query()->chunkById(100, fn ($users) => $users->each(fn ($user) => $service->ensureForUser($user)));
    }
}
