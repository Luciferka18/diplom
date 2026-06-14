<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_months')->nullable();
            $table->unsignedInteger('trial_visits')->nullable();
            $table->unsignedBigInteger('price')->default(0); // kopecks
            $table->unsignedBigInteger('old_price')->nullable();
            $table->json('features')->nullable();
            $table->string('badge')->nullable();
            $table->boolean('is_trial')->default(false)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('discount_type')->default('percent'); // percent|fixed
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->json('applies_to')->nullable();
            $table->boolean('auto_apply')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('badge')->nullable();
            $table->string('banner_title')->nullable();
            $table->text('banner_text')->nullable();
            $table->timestamps();
        });

        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('discount_type')->default('percent');
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->json('applies_to')->nullable();
            $table->unsignedBigInteger('minimum_amount')->default(0);
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('per_user_limit')->default(1);
            $table->unsignedInteger('uses_count')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('payable');
            $table->string('provider')->default('mock');
            $table->string('status')->default('pending')->index();
            $table->unsignedBigInteger('amount')->default(0);
            $table->string('currency', 3)->default('RUB');
            $table->string('external_id')->nullable()->unique();
            $table->string('idempotency_key')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('user_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('membership_id')->constrained()->restrictOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('promo_code_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending')->index();
            $table->unsignedBigInteger('subtotal_amount')->default(0);
            $table->unsignedBigInteger('discount_amount')->default(0);
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_trial_grant')->default(false)->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('promo_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_code_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->nullableMorphs('redeemable');
            $table->unsignedBigInteger('discount_amount')->default(0);
            $table->timestamps();
            $table->index(['promo_code_id', 'user_id']);
        });

        Schema::create('trainer_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->unsignedBigInteger('price')->default(0); // kopecks
            $table->string('badge')->nullable();
            $table->boolean('is_intro')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['trainer_id', 'slug']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('trainer_service_id')->nullable()->after('trainer_id')->constrained()->nullOnDelete();
            $table->foreignId('payment_id')->nullable()->after('trainer_service_id')->constrained()->nullOnDelete();
            $table->foreignId('promo_code_id')->nullable()->after('payment_id')->constrained()->nullOnDelete();
            $table->foreignId('promotion_id')->nullable()->after('promo_code_id')->constrained()->nullOnDelete();
            $table->unsignedBigInteger('subtotal_amount')->default(0)->after('status');
            $table->unsignedBigInteger('discount_amount')->default(0)->after('subtotal_amount');
            $table->unsignedBigInteger('total_amount')->default(0)->after('discount_amount');
            $table->string('payment_status')->default('not_required')->after('total_amount')->index();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('trainer_service_id');
            $table->dropConstrainedForeignId('payment_id');
            $table->dropConstrainedForeignId('promo_code_id');
            $table->dropConstrainedForeignId('promotion_id');
            $table->dropColumn(['subtotal_amount', 'discount_amount', 'total_amount', 'payment_status']);
        });

        Schema::dropIfExists('trainer_services');
        Schema::dropIfExists('promo_redemptions');
        Schema::dropIfExists('user_memberships');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('promo_codes');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('memberships');
    }
};
