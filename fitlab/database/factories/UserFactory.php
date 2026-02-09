<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'login' => 'user' . fake()->unique()->numberBetween(10000, 99999),
            'name' => 'Иван Иванов',
            'phone' => '+7' . fake()->unique()->numerify('9#########'),
            'email' => fake()->unique()->safeEmail(),
            'role' => 'user',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password123'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
