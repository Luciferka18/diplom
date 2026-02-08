<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Product;
use App\Models\Trainer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_article_by_slug(): void
    {
        $article = Article::create([
            'title' => 'Тестовая статья',
            'slug' => 'testovaya-statya',
            'excerpt' => 'Коротко о статье',
            'content' => 'Содержимое статьи',
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/articles/'.$article->slug);

        $response
            ->assertOk()
            ->assertJsonPath('slug', $article->slug);
    }

    public function test_it_creates_contact_request(): void
    {
        $payload = [
            'name' => 'Иван',
            'phone_or_telegram' => '+79990000000',
            'goal' => 'Хочу набрать массу',
        ];

        $response = $this->postJson('/api/contacts', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('name', 'Иван');

        $this->assertDatabaseHas('contact_requests', [
            'phone_or_telegram' => '+79990000000',
        ]);
    }

    public function test_it_creates_booking_for_trainer(): void
    {
        $trainer = Trainer::create([
            'name' => 'Алексей',
            'specialization' => 'Силовые тренировки',
            'experience_years' => 7,
        ]);

        $payload = [
            'trainer_id' => $trainer->id,
            'client_name' => 'Мария',
            'client_phone' => '+78880000000',
            'client_comment' => 'Тренировка на ноги',
            'date' => now()->addDay()->toDateString(),
            'time' => '18:30',
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('trainer.id', $trainer->id)
            ->assertJsonPath('status', 'new');

        $this->assertDatabaseHas('bookings', [
            'trainer_id' => $trainer->id,
            'client_name' => 'Мария',
        ]);
    }

    public function test_it_creates_order_and_calculates_total(): void
    {
        $product = Product::create([
            'name' => 'Протеин',
            'slug' => 'protein',
            'category' => 'supplements',
            'price' => 1900,
            'in_stock' => true,
        ]);

        $payload = [
            'customer_name' => 'Петр',
            'customer_phone' => '+77770000000',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('total_amount', '3800.00')
            ->assertJsonPath('items.0.product_id', $product->id)
            ->assertJsonPath('items.0.quantity', 2);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Петр',
            'total_amount' => 3800,
        ]);
    }
}
