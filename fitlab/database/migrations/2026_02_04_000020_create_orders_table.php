<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('status', 32)->default('new'); // new|paid|cancelled|completed etc
            $table->unsignedInteger('items_count')->default(0);

            $table->unsignedBigInteger('subtotal')->default(0); // в копейках
            $table->unsignedBigInteger('delivery')->default(0);
            $table->unsignedBigInteger('total')->default(0);

            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();

            $table->string('address_line')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();

            $table->text('comment')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};