<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        $columns = Schema::getColumnListing('bookings');
        $missing = fn (string $name): bool => ! in_array($name, $columns, true);

        Schema::table('bookings', function (Blueprint $table) use ($missing) {
            if ($missing('trainer_service_id')) {
                $table->unsignedBigInteger('trainer_service_id')->nullable()->index();
            }

            if ($missing('payment_id')) {
                $table->unsignedBigInteger('payment_id')->nullable()->index();
            }

            if ($missing('promo_code_id')) {
                $table->unsignedBigInteger('promo_code_id')->nullable()->index();
            }

            if ($missing('promotion_id')) {
                $table->unsignedBigInteger('promotion_id')->nullable()->index();
            }

            if ($missing('location_id')) {
                $table->unsignedBigInteger('location_id')->nullable()->index();
            }

            if ($missing('starts_at')) {
                $table->dateTime('starts_at')->nullable()->index();
            }

            if ($missing('ends_at')) {
                $table->dateTime('ends_at')->nullable();
            }

            if ($missing('client_name')) {
                $table->string('client_name')->nullable();
            }

            if ($missing('client_phone')) {
                $table->string('client_phone')->nullable();
            }

            if ($missing('client_comment')) {
                $table->text('client_comment')->nullable();
            }

            if ($missing('status')) {
                $table->string('status')->default('booked')->index();
            }

            if ($missing('subtotal_amount')) {
                $table->unsignedBigInteger('subtotal_amount')->default(0);
            }

            if ($missing('discount_amount')) {
                $table->unsignedBigInteger('discount_amount')->default(0);
            }

            if ($missing('total_amount')) {
                $table->unsignedBigInteger('total_amount')->default(0);
            }

            if ($missing('payment_status')) {
                $table->string('payment_status')->default('not_required')->index();
            }
        });

        $this->backfillStartsAt();
    }

    private function backfillStartsAt(): void
    {
        if (! Schema::hasColumn('bookings', 'starts_at')) {
            return;
        }

        $hasDate = Schema::hasColumn('bookings', 'date');
        $hasTime = Schema::hasColumn('bookings', 'time');

        if (! $hasDate) {
            return;
        }

        DB::table('bookings')
            ->whereNull('starts_at')
            ->orderBy('id')
            ->select(['id', 'date', ...($hasTime ? ['time'] : [])])
            ->chunkById(100, function ($rows) use ($hasTime) {
                foreach ($rows as $row) {
                    if (! $row->date) {
                        continue;
                    }

                    try {
                        $time = $hasTime && ! empty($row->time) ? (string) $row->time : '00:00:00';
                        $start = Carbon::parse($row->date . ' ' . $time);
                        $update = ['starts_at' => $start];
                        if (Schema::hasColumn('bookings', 'ends_at')) {
                            $update['ends_at'] = $start->copy()->addHour();
                        }

                        DB::table('bookings')->where('id', $row->id)->update($update);
                    } catch (Throwable $e) {
                        // Keep broken legacy rows untouched instead of stopping the migration.
                    }
                }
            });
    }

    public function down(): void
    {
        // Safe hotfix: do not remove columns with user data.
    }
};
