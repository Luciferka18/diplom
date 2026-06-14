<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'slug')) $table->string('slug')->nullable()->unique()->after('id');
                if (!Schema::hasColumn('products', 'short_description')) $table->string('short_description', 500)->nullable()->after('name');
                if (!Schema::hasColumn('products', 'brand')) $table->string('brand')->nullable()->index()->after('description');
                if (!Schema::hasColumn('products', 'sku')) $table->string('sku')->nullable()->unique()->after('brand');
                if (!Schema::hasColumn('products', 'old_price')) $table->decimal('old_price', 10, 2)->nullable()->after('price');
                if (!Schema::hasColumn('products', 'gallery')) $table->json('gallery')->nullable()->after('image_url');
                if (!Schema::hasColumn('products', 'attributes')) $table->json('attributes')->nullable()->after('gallery');
                if (!Schema::hasColumn('products', 'badges')) $table->json('badges')->nullable()->after('attributes');
                if (!Schema::hasColumn('products', 'is_featured')) $table->boolean('is_featured')->default(false)->index();
                if (!Schema::hasColumn('products', 'is_new')) $table->boolean('is_new')->default(false)->index();
                if (!Schema::hasColumn('products', 'trainer_pick')) $table->boolean('trainer_pick')->default(false)->index();
                if (!Schema::hasColumn('products', 'home_use')) $table->boolean('home_use')->default(false)->index();
                if (!Schema::hasColumn('products', 'is_active')) $table->boolean('is_active')->default(true)->index();
                if (!Schema::hasColumn('products', 'views_count')) $table->unsignedBigInteger('views_count')->default(0);
            });
        }

        if (!Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('sku')->unique();
                $table->json('options')->nullable();
                $table->decimal('price', 10, 2)->nullable();
                $table->decimal('old_price', 10, 2)->nullable();
                $table->unsignedInteger('stock')->default(0);
                $table->string('image_url')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
                $table->index(['product_id', 'is_active']);
            });
        } else {
            Schema::table('product_variants', function (Blueprint $table) {
                if (!Schema::hasColumn('product_variants', 'options')) $table->json('options')->nullable();
                if (!Schema::hasColumn('product_variants', 'old_price')) $table->decimal('old_price', 10, 2)->nullable();
                if (!Schema::hasColumn('product_variants', 'image_url')) $table->string('image_url')->nullable();
                if (!Schema::hasColumn('product_variants', 'is_active')) $table->boolean('is_active')->default(true)->index();
                if (!Schema::hasColumn('product_variants', 'sort_order')) $table->unsignedSmallInteger('sort_order')->default(0);
                if (!Schema::hasColumn('product_variants', 'created_at')) $table->timestamp('created_at')->nullable();
                if (!Schema::hasColumn('product_variants', 'updated_at')) $table->timestamp('updated_at')->nullable();
            });
        }

        if (!Schema::hasTable('product_wishlists')) {
            Schema::create('product_wishlists', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['user_id', 'product_id']);
            });
        }

        if (!Schema::hasTable('product_views')) {
            Schema::create('product_views', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->timestamp('viewed_at');
                $table->timestamps();
                $table->unique(['user_id', 'product_id']);
                $table->index(['user_id', 'viewed_at']);
            });
        }

        if (!Schema::hasTable('product_relations')) {
            Schema::create('product_relations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->foreignId('related_product_id')->constrained('products')->cascadeOnDelete();
                $table->string('type', 32)->default('related')->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['product_id', 'related_product_id', 'type'], 'product_relation_unique');
            });
        }

        if (!Schema::hasTable('trainer_product_recommendations')) {
            Schema::create('trainer_product_recommendations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('trainer_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('comment', 500)->nullable();
                $table->boolean('is_featured')->default(false)->index();
                $table->timestamps();
                $table->unique(['trainer_id', 'product_id']);
            });
        }

        if (!Schema::hasTable('shop_collections')) {
            Schema::create('shop_collections', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('subtitle', 500)->nullable();
                $table->string('image_url')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('shop_collection_product')) {
            Schema::create('shop_collection_product', function (Blueprint $table) {
                $table->id();
                $table->foreignId('shop_collection_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
                $table->unique(['shop_collection_id', 'product_id'], 'shop_collection_product_unique');
            });
        } else {
            Schema::table('shop_collection_product', function (Blueprint $table) {
                if (!Schema::hasColumn('shop_collection_product', 'created_at')) $table->timestamp('created_at')->nullable();
                if (!Schema::hasColumn('shop_collection_product', 'updated_at')) $table->timestamp('updated_at')->nullable();
            });
        }

        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('label')->default('Дом');
                $table->string('recipient_name');
                $table->string('phone', 50);
                $table->string('city');
                $table->string('address_line');
                $table->string('postal_code', 32)->nullable();
                $table->boolean('is_default')->default(false)->index();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('cart_items') && !Schema::hasColumn('cart_items', 'product_variant_id')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained('product_variants')->nullOnDelete();
            });
        }

        if (Schema::hasTable('cart_items')) {
            try {
                $index = DB::select("SHOW INDEX FROM cart_items WHERE Key_name = 'cart_items_cart_id_product_id_unique'");
                if ($index) DB::statement('ALTER TABLE cart_items DROP INDEX cart_items_cart_id_product_id_unique');
                $newIndex = DB::select("SHOW INDEX FROM cart_items WHERE Key_name = 'cart_items_cart_product_variant_unique'");
                if (!$newIndex) DB::statement('ALTER TABLE cart_items ADD UNIQUE cart_items_cart_product_variant_unique (cart_id, product_id, product_variant_id)');
            } catch (Throwable $e) {
                // Some local MySQL states already have a compatible index; do not block the whole migration.
            }
        }

        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('order_items', 'product_variant_id')) $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained('product_variants')->nullOnDelete();
                if (!Schema::hasColumn('order_items', 'variant_name')) $table->string('variant_name')->nullable()->after('name');
                if (!Schema::hasColumn('order_items', 'variant_options')) $table->json('variant_options')->nullable()->after('variant_name');
                if (!Schema::hasColumn('order_items', 'sku')) $table->string('sku')->nullable()->after('variant_options');
                if (!Schema::hasColumn('order_items', 'image_url')) $table->string('image_url')->nullable()->after('sku');
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'discount')) $table->unsignedBigInteger('discount')->default(0)->after('subtotal');
                if (!Schema::hasColumn('orders', 'delivery_method')) $table->string('delivery_method', 32)->default('pickup')->after('delivery');
                if (!Schema::hasColumn('orders', 'pickup_location')) $table->string('pickup_location')->nullable()->after('delivery_method');
                if (!Schema::hasColumn('orders', 'promo_code_id')) $table->foreignId('promo_code_id')->nullable()->after('comment')->constrained()->nullOnDelete();
                if (!Schema::hasColumn('orders', 'promotion_id')) $table->foreignId('promotion_id')->nullable()->after('promo_code_id')->constrained()->nullOnDelete();
            });
        }

        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'advantages')) $table->text('advantages')->nullable();
                if (!Schema::hasColumn('reviews', 'disadvantages')) $table->text('disadvantages')->nullable();
                if (!Schema::hasColumn('reviews', 'photos')) $table->json('photos')->nullable();
                if (!Schema::hasColumn('reviews', 'verified_purchase')) $table->boolean('verified_purchase')->default(false)->index();
                if (!Schema::hasColumn('reviews', 'trainer_recommendation')) $table->boolean('trainer_recommendation')->default(false)->index();
            });
        }

        if (Schema::hasTable('products') && Schema::hasColumn('products', 'slug')) {
            DB::table('products')->whereNull('slug')->orderBy('id')->each(function ($product) {
                $base = Str::slug($product->name) ?: 'product';
                DB::table('products')->where('id', $product->id)->update(['slug' => $base . '-' . $product->id]);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
        Schema::dropIfExists('shop_collection_product');
        Schema::dropIfExists('shop_collections');
        Schema::dropIfExists('trainer_product_recommendations');
        Schema::dropIfExists('product_relations');
        Schema::dropIfExists('product_views');
        Schema::dropIfExists('product_wishlists');
        Schema::dropIfExists('product_variants');
    }
};
