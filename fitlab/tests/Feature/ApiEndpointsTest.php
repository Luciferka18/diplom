<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Program;
use App\Models\Trainer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_token_with_required_email_and_phone(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'login' => 'newuser1',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'name' => 'Иван Иванов',
            'phone' => '+79991234567',
            'email' => 'newuser1@example.com',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'login', 'name', 'email', 'phone'],
                'token',
            ])
            ->assertJsonPath('user.login', 'newuser1')
            ->assertJsonPath('user.email', 'newuser1@example.com')
            ->assertJsonPath('user.phone', '+79991234567');

        $this->assertDatabaseHas('users', [
            'login' => 'newuser1',
            'email' => 'newuser1@example.com',
            'phone' => '+79991234567',
        ]);
    }

    public function test_register_validates_required_fields(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['login', 'password', 'name', 'phone', 'email']);
    }


    public function test_register_validates_login_name_phone_and_email_format(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'login' => 'ab',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'name' => 'John Doe',
            'phone' => '89991234567',
            'email' => 'bad-email',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['login', 'name', 'phone', 'email']);
    }

    public function test_login_validates_required_fields(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['login', 'password']);
    }

    public function test_catalog_endpoints_return_json_lists(): void
    {
        Trainer::create([
            'name' => 'Тренер 1',
            'specialization' => 'Силовые',
            'experience_years' => 3,
            'bio' => 'bio',
        ]);

        Program::create([
            'title' => 'Программа 1',
            'level' => 'Начальный',
            'duration_weeks' => 4,
            'focus' => 'общая подготовка',
            'slug' => 'programma-1',
            'short_description' => 'short',
            'description' => 'description',
            'price' => 1000,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Товар 1',
            'slug' => 'tovar-1',
            'category' => 'Протеин',
            'price' => 500,
        ]);

        $this->getJson('/api/trainers')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Тренер 1');

        $this->getJson('/api/programs')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.slug', 'programma-1');

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.slug', 'tovar-1');
    }

    public function test_authorized_user_can_add_items_to_cart(): void
    {
        $userResponse = $this->postJson('/api/auth/register', [
            'login' => 'cartuser1',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'name' => 'Петр Петров',
            'phone' => '+79997654321',
            'email' => 'cartuser1@example.com',
        ]);

        $token = $userResponse->json('token');

        $product = Product::create([
            'name' => 'BCAA',
            'slug' => 'bcaa',
            'category' => 'Аминокислоты',
            'price' => 1490,
        ]);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/cart/items', [
                'product_id' => $product->id,
                'quantity' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('items.0.product_id', $product->id)
            ->assertJsonPath('items.0.quantity', 2);
    }
}
