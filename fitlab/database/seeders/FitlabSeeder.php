<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\GymLocation;
use App\Models\Product;
use App\Models\Program;
use App\Models\Tag;
use App\Models\Trainer;
use App\Models\TrainerSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FitlabSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'login' => 'admin01',
            'name' => 'Иван Админ',
            'phone' => '+79990000001',
            'email' => 'admin@nashfit.local',
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        $trainerUser = User::create([
            'login' => 'trainer01',
            'name' => 'Анна Тренер',
            'phone' => '+79990000002',
            'email' => 'trainer@nashfit.local',
            'role' => 'trainer',
            'password' => Hash::make('password123'),
        ]);

        $user = User::create([
            'login' => 'client01',
            'name' => 'Пётр Клиент',
            'phone' => '+79990000003',
            'email' => 'user@nashfit.local',
            'role' => 'user',
            'password' => Hash::make('password123'),
        ]);

        $category = Category::create(['name' => 'Протеин', 'slug' => 'protein']);
        $tag = Tag::create(['name' => 'Похудение', 'slug' => 'fat-loss']);

        $trainer = Trainer::create([
            'user_id' => $trainerUser->id,
            'name' => 'Анна Кузнецова',
            'specialization' => 'Функциональный тренинг',
            'experience_years' => 7,
            'age' => 28,
            'bio' => 'Помогает безопасно снизить вес и повысить выносливость.',
            'instagram' => '@anna.nashfit.vk',
            'phone' => '+79990000002',
        ]);

        $program = Program::create([
            'trainer_id' => $trainer->id,
            'title' => 'Функциональный старт',
            'description' => 'Программа на 6 недель для новичков.',
            'level' => 'beginner',
            'duration_weeks' => 6,
            'price' => 3900,
        ]);
        $program->tags()->attach($tag->id);

        $product = Product::create([
            'name' => 'Whey Protein 1kg',
            'description' => 'Сывороточный протеин для восстановления.',
            'price' => 2490,
            'stock' => 100,
            'category_id' => $category->id,
        ]);
        $product->tags()->attach($tag->id);

        $article = Article::create([
            'title' => 'Как начать тренироваться без травм',
            'slug' => 'kak-nachat-trenirovatsya-bez-travm',
            'content' => 'Начинайте с базовой техники и постепенного увеличения нагрузки.',
            'author_user_id' => $trainerUser->id,
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);
        $article->tags()->attach($tag->id);

        $location = GymLocation::firstOrCreate([
            'name' => 'НашФит Центр',
            'address' => 'ул. Спортивная, 10',
        ]);

        $trainer->reviews()->create([
            'user_id' => $user->id,
            'rating' => 5,
            'text' => 'Отличный тренер, очень понятные объяснения.',
        ]);

        // Расписание тренера по умолчанию
        TrainerSchedule::create([
            'trainer_id' => $trainer->id,
            'location_id' => $location->id,
            'day_of_week' => 1, // Понедельник
            'start_time' => '09:00',
            'end_time' => '18:00',
            'slot_duration_minutes' => 60,
        ]);
        TrainerSchedule::create([
            'trainer_id' => $trainer->id,
            'location_id' => $location->id,
            'day_of_week' => 3, // Среда
            'start_time' => '09:00',
            'end_time' => '18:00',
            'slot_duration_minutes' => 60,
        ]);
        TrainerSchedule::create([
            'trainer_id' => $trainer->id,
            'location_id' => $location->id,
            'day_of_week' => 5, // Пятница
            'start_time' => '09:00',
            'end_time' => '18:00',
            'slot_duration_minutes' => 60,
        ]);

        $admin->tokens()->delete();
        $trainerUser->tokens()->delete();
        $user->tokens()->delete();
    }
}
