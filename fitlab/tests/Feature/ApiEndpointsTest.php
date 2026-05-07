<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use App\Models\GymLocation;
use App\Models\Product;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_register_login_and_me(): void
    {
        $register = $this->postJson('/api/auth/register', [
            'login' => 'user777',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'name' => 'Иван Иванов',
            'phone' => '+79991234567',
            'email' => 'user777@example.com',
        ]);

        $register->assertCreated()->assertJsonStructure(['user' => ['id', 'role'], 'token']);

        $login = $this->postJson('/api/auth/login', [
            'login' => 'user777',
            'password' => 'password123',
        ]);

        $token = $login->json('token');
        $this->assertNotEmpty($token);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.login', 'user777');
    }

    public function test_cart_order_payment_flow(): void
    {
        $user = User::factory()->create(['role' => 'user', 'login' => 'client11', 'phone' => '+79990000111', 'email' => 'client11@example.com']);
        Sanctum::actingAs($user);

        $category = Category::create(['name' => 'Supplements', 'slug' => 'supplements']);
        $product = Product::create([
            'name' => 'Whey Protein',
            'description' => 'Test',
            'price' => 1990,
            'stock' => 10,
            'category_id' => $category->id,
        ]);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'qty' => 2])
            ->assertCreated();

        $orderResponse = $this->postJson('/api/orders', [
            'customer_name' => 'Пётр Клиент',
            'customer_phone' => '+79990000111',
            'customer_email' => 'client11@example.com',
        ])->assertOk();

        $orderId = $orderResponse->json('id');

        $intent = $this->postJson('/api/payments/intent', ['order_id' => $orderId])
            ->assertOk();

        $intentId = $intent->json('intent_id');

        $this->withHeader('Idempotency-Key', 'test-key-1')
            ->postJson('/api/payments/confirm', ['intent_id' => $intentId])
            ->assertOk()
            ->assertJsonPath('status', 'confirmed');

        $this->assertDatabaseHas('orders', ['id' => $orderId, 'status' => 'paid', 'payment_status' => 'paid']);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 8]);
        $this->assertDatabaseHas('carts', ['user_id' => $user->id, 'status' => 'converted']);
    }

    public function test_booking_conflict_and_next_endpoint(): void
    {
        $user = User::factory()->create(['role' => 'user', 'login' => 'client12', 'phone' => '+79990000112', 'email' => 'client12@example.com']);
        Sanctum::actingAs($user);

        $location = GymLocation::create(['name' => 'НашФит Center', 'address' => 'Main st']);
        $trainer = Trainer::create(['name' => 'Тренер', 'specialization' => 'Силовой', 'experience_years' => 5]);

        $payload = [
            'trainer_id' => $trainer->id,
            'location_id' => $location->id,
            'client_name' => 'Клиент',
            'client_phone' => '+79990000112',
            'date' => now()->addDay()->toDateString(),
            'time' => '12:00',
        ];

        $this->postJson('/api/bookings', $payload)->assertCreated();
        $this->postJson('/api/bookings', $payload)->assertStatus(422);

        $this->getJson('/api/bookings/next')
            ->assertOk()
            ->assertJsonStructure(['booking']);
    }

    public function test_public_content_and_article_slug(): void
    {
        $author = User::factory()->create(['role' => 'trainer', 'login' => 'writer11', 'phone' => '+79990000113', 'email' => 'writer11@example.com']);
        Article::create([
            'title' => 'Тестовая статья',
            'slug' => 'testovaya-statya',
            'content' => 'Содержимое статьи',
            'author_user_id' => $author->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->getJson('/api/articles')->assertOk();
        $this->getJson('/api/articles/testovaya-statya')->assertOk()->assertJsonPath('slug', 'testovaya-statya');
    }

    public function test_idempotent_confirm_replay(): void
    {
        $user = User::factory()->create(['role' => 'user', 'login' => 'client13', 'phone' => '+79990000114', 'email' => 'client13@example.com']);
        Sanctum::actingAs($user);

        $category = Category::create(['name' => 'Bars', 'slug' => 'bars']);
        $product = Product::create([
            'name' => 'Protein Bar',
            'description' => 'Bar',
            'price' => 200,
            'stock' => 5,
            'category_id' => $category->id,
        ]);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'qty' => 1])->assertCreated();
        $orderId = $this->postJson('/api/orders', [
            'customer_name' => 'Пётр Клиент',
            'customer_phone' => '+79990000114',
        ])->json('id');

        $intentId = $this->postJson('/api/payments/intent', ['order_id' => $orderId])->json('intent_id');

        $this->withHeader('Idempotency-Key', 'same-key')
            ->postJson('/api/payments/confirm', ['intent_id' => $intentId])
            ->assertOk();

        $this->withHeader('Idempotency-Key', 'same-key')
            ->postJson('/api/payments/confirm', ['intent_id' => $intentId])
            ->assertOk()
            ->assertJsonPath('idempotent', true);
    }
}
