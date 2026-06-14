<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('cart_items') && !Schema::hasColumn('cart_items', 'product_variant_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->foreignId('product_variant_id')
                    ->nullable()
                    ->after('product_id')
                    ->constrained('product_variants')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('order_items', 'product_variant_id')) {
                    $table->foreignId('product_variant_id')
                        ->nullable()
                        ->after('product_id')
                        ->constrained('product_variants')
                        ->nullOnDelete();
                }
                if (!Schema::hasColumn('order_items', 'variant_name')) {
                    $table->string('variant_name')->nullable()->after('name');
                }
                if (!Schema::hasColumn('order_items', 'variant_options')) {
                    $table->json('variant_options')->nullable()->after('variant_name');
                }
                if (!Schema::hasColumn('order_items', 'sku')) {
                    $table->string('sku')->nullable()->after('variant_options');
                }
                if (!Schema::hasColumn('order_items', 'image_url')) {
                    $table->string('image_url', 2048)->nullable()->after('sku');
                }
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'discount')) {
                    $table->unsignedBigInteger('discount')->default(0)->after('subtotal');
                }
                if (!Schema::hasColumn('orders', 'delivery_method')) {
                    $table->string('delivery_method', 32)->default('pickup')->after('delivery');
                }
                if (!Schema::hasColumn('orders', 'pickup_location')) {
                    $table->string('pickup_location')->nullable()->after('delivery_method');
                }
                if (!Schema::hasColumn('orders', 'promo_code_id')) {
                    $table->foreignId('promo_code_id')
                        ->nullable()
                        ->after('comment')
                        ->constrained('promo_codes')
                        ->nullOnDelete();
                }
                if (!Schema::hasColumn('orders', 'promotion_id')) {
                    $table->foreignId('promotion_id')
                        ->nullable()
                        ->after('promo_code_id')
                        ->constrained('promotions')
                        ->nullOnDelete();
                }
            });
        }

        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'advantages')) {
                    $table->text('advantages')->nullable();
                }
                if (!Schema::hasColumn('reviews', 'disadvantages')) {
                    $table->text('disadvantages')->nullable();
                }
                if (!Schema::hasColumn('reviews', 'photos')) {
                    $table->json('photos')->nullable();
                }
                if (!Schema::hasColumn('reviews', 'verified_purchase')) {
                    $table->boolean('verified_purchase')->default(false)->index();
                }
                if (!Schema::hasColumn('reviews', 'trainer_recommendation')) {
                    $table->boolean('trainer_recommendation')->default(false)->index();
                }
            });
        }
    }

    public function down(): void
    {
        // This is a repair migration. It intentionally keeps data and columns on rollback.
    }
};
