<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\Muscle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class MuscleExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $muscles = [
            'chest' => [
                'name' => 'Грудные мышцы',
                'latin_name' => 'Pectoralis major',
                'body_side' => 'front',
                'description' => 'Грудные мышцы участвуют в жимовых движениях, приведении рук к корпусу и формируют сильный верх тела.',
                'function' => 'Приведение руки, сгибание плеча, горизонтальное сведение рук и жимовые движения.',
                'how_to_grow' => 'Для роста грудных мышц нужны жимовые движения под разными углами, прогрессия нагрузки, контроль техники и стабильные лопатки.',
            ],
            'shoulders' => [
                'name' => 'Плечи / дельты',
                'latin_name' => 'Deltoideus',
                'body_side' => 'both',
                'description' => 'Дельтовидные мышцы формируют плечевой пояс и помогают контролировать руку в разных плоскостях.',
                'function' => 'Отведение, сгибание и разгибание плеча, стабилизация плечевого сустава.',
                'how_to_grow' => 'Комбинируйте жимы, махи в стороны, заднюю дельту и упражнения для стабильности лопаток.',
            ],
            'biceps' => [
                'name' => 'Бицепс',
                'latin_name' => 'Biceps brachii',
                'body_side' => 'front',
                'description' => 'Бицепс сгибает руку в локте и участвует в супинации предплечья.',
                'function' => 'Сгибание локтя, супинация предплечья и помощь в тяговых движениях.',
                'how_to_grow' => 'Используйте сгибания со штангой и гантелями, нейтральный хват и контролируемую негативную фазу.',
            ],
            'triceps' => [
                'name' => 'Трицепс',
                'latin_name' => 'Triceps brachii',
                'body_side' => 'back',
                'description' => 'Трицепс разгибает руку в локте и сильно влияет на жимовые движения.',
                'function' => 'Разгибание локтя, стабилизация плеча и помощь во всех жимах.',
                'how_to_grow' => 'Комбинируйте разгибания на блоке, французский жим, брусья и жим узким хватом.',
            ],
            'forearms' => [
                'name' => 'Предплечья',
                'latin_name' => 'Antebrachium',
                'body_side' => 'both',
                'description' => 'Предплечья отвечают за хват, контроль кисти и устойчивость в тягах.',
                'function' => 'Сгибание и разгибание кисти, удержание веса и стабилизация хвата.',
                'how_to_grow' => 'Развивайте хват через фермерскую прогулку, висы, сгибания кистей и удержания веса.',
            ],
            'abs' => [
                'name' => 'Пресс',
                'latin_name' => 'Rectus abdominis',
                'body_side' => 'front',
                'description' => 'Прямая мышца живота помогает сгибать корпус и стабилизировать позвоночник.',
                'function' => 'Сгибание корпуса, стабилизация таза и контроль корпуса в базовых упражнениях.',
                'how_to_grow' => 'Сочетайте скручивания, подъёмы ног, планки и прогрессию нагрузки без рывков поясницей.',
            ],
            'obliques' => [
                'name' => 'Косые мышцы живота',
                'latin_name' => 'Obliquus externus et internus abdominis',
                'body_side' => 'front',
                'description' => 'Косые мышцы помогают поворачивать корпус и защищают поясницу при движениях.',
                'function' => 'Ротация и боковое сгибание корпуса, анти-ротационная стабилизация.',
                'how_to_grow' => 'Используйте боковые планки, Pallof press, контролируемые повороты и переносы веса.',
            ],
            'lats' => [
                'name' => 'Широчайшие мышцы спины',
                'latin_name' => 'Latissimus dorsi',
                'body_side' => 'back',
                'description' => 'Широчайшие формируют силу тяговых движений и V-образный силуэт.',
                'function' => 'Приведение плеча, разгибание плеча и тяга руки к корпусу.',
                'how_to_grow' => 'Основа — подтягивания, тяги верхнего блока, горизонтальные тяги и контроль лопаток.',
            ],
            'traps' => [
                'name' => 'Трапеции',
                'latin_name' => 'Trapezius',
                'body_side' => 'back',
                'description' => 'Трапеции стабилизируют лопатки, шею и верх спины.',
                'function' => 'Подъём, опускание и приведение лопаток, стабилизация плечевого пояса.',
                'how_to_grow' => 'Шраги, тяги, face pull и контроль осанки помогают развить верх спины без перегруза шеи.',
            ],
            'lower_back' => [
                'name' => 'Поясница',
                'latin_name' => 'Erector spinae',
                'body_side' => 'back',
                'description' => 'Разгибатели позвоночника помогают держать корпус и безопасно выполнять тяги.',
                'function' => 'Разгибание позвоночника, стабилизация корпуса, удержание нейтральной спины.',
                'how_to_grow' => 'Начинайте с гиперэкстензии и bird-dog, затем добавляйте тяги с идеальной техникой.',
            ],
            'glutes' => [
                'name' => 'Ягодицы',
                'latin_name' => 'Gluteus maximus / medius',
                'body_side' => 'back',
                'description' => 'Ягодичные мышцы отвечают за разгибание бедра, стабильность таза и силу нижней части тела.',
                'function' => 'Разгибание и отведение бедра, стабилизация таза, мощность в приседаниях и тягах.',
                'how_to_grow' => 'Используйте хип-траст, ягодичный мост, выпады и румынскую тягу с прогрессией нагрузки.',
            ],
            'quads' => [
                'name' => 'Квадрицепсы',
                'latin_name' => 'Quadriceps femoris',
                'body_side' => 'front',
                'description' => 'Квадрицепсы разгибают колено и дают силу в приседаниях, выпадах и жиме ногами.',
                'function' => 'Разгибание колена, стабилизация коленного сустава, работа в приседаниях.',
                'how_to_grow' => 'Приседайте в контролируемой амплитуде, добавляйте жим ногами, выпады и разгибания ног.',
            ],
            'hamstrings' => [
                'name' => 'Бицепс бедра',
                'latin_name' => 'Hamstrings',
                'body_side' => 'back',
                'description' => 'Задняя поверхность бедра сгибает колено и помогает разгибать бедро.',
                'function' => 'Сгибание колена, разгибание бедра и стабилизация таза.',
                'how_to_grow' => 'Добавьте румынскую тягу, сгибания ног, становую на прямых ногах и гиперэкстензию.',
            ],
            'calves' => [
                'name' => 'Икры',
                'latin_name' => 'Gastrocnemius / Soleus',
                'body_side' => 'both',
                'description' => 'Икроножные и камбаловидные мышцы отвечают за подъём на носки, прыжки и устойчивую походку.',
                'function' => 'Подошвенное сгибание стопы, стабилизация голеностопа, работа при беге и ходьбе.',
                'how_to_grow' => 'Тренируйте икры стоя и сидя, меняйте темп, делайте паузу в верхней точке и растяжение внизу.',
            ],
        ];

        $muscleModels = [];
        foreach ($muscles as $slug => $data) {
            $muscleModels[$slug] = Muscle::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $data['name'],
                    'latin_name' => $data['latin_name'] ?? null,
                    'description' => $data['description'],
                    'function' => $data['function'],
                    'how_to_grow' => $data['how_to_grow'],
                    'body_side' => $data['body_side'],
                ]
            );
        }

        $exercises = [
            'bench-press' => ['name' => 'Жим штанги лёжа', 'difficulty' => 'intermediate', 'equipment' => 'Штанга, скамья', 'primary' => ['chest'], 'secondary' => ['shoulders', 'triceps']],
            'dumbbell-bench-press' => ['name' => 'Жим гантелей лёжа', 'difficulty' => 'intermediate', 'equipment' => 'Гантели, скамья', 'primary' => ['chest'], 'secondary' => ['shoulders', 'triceps']],
            'push-ups' => ['name' => 'Отжимания', 'difficulty' => 'beginner', 'equipment' => 'Вес тела', 'primary' => ['chest'], 'secondary' => ['shoulders', 'triceps', 'abs']],
            'cable-fly' => ['name' => 'Сведение рук в кроссовере', 'difficulty' => 'intermediate', 'equipment' => 'Кроссовер', 'primary' => ['chest'], 'secondary' => ['shoulders']],
            'dumbbell-fly' => ['name' => 'Разводка гантелей', 'difficulty' => 'intermediate', 'equipment' => 'Гантели, скамья', 'primary' => ['chest'], 'secondary' => ['shoulders']],

            'pull-ups' => ['name' => 'Подтягивания', 'difficulty' => 'intermediate', 'equipment' => 'Турник', 'primary' => ['lats'], 'secondary' => ['biceps', 'forearms', 'traps']],
            'lat-pulldown' => ['name' => 'Тяга верхнего блока', 'difficulty' => 'beginner', 'equipment' => 'Блочный тренажёр', 'primary' => ['lats'], 'secondary' => ['biceps', 'forearms']],
            'barbell-row' => ['name' => 'Тяга штанги в наклоне', 'difficulty' => 'intermediate', 'equipment' => 'Штанга', 'primary' => ['lats'], 'secondary' => ['traps', 'biceps', 'lower_back']],
            'seated-row' => ['name' => 'Горизонтальная тяга', 'difficulty' => 'beginner', 'equipment' => 'Блочный тренажёр', 'primary' => ['lats'], 'secondary' => ['traps', 'biceps']],
            'pullover' => ['name' => 'Пуловер', 'difficulty' => 'intermediate', 'equipment' => 'Гантель / блок', 'primary' => ['lats'], 'secondary' => ['chest']],

            'seated-dumbbell-press' => ['name' => 'Жим гантелей сидя', 'difficulty' => 'intermediate', 'equipment' => 'Гантели, скамья', 'primary' => ['shoulders'], 'secondary' => ['triceps']],
            'lateral-raises' => ['name' => 'Махи гантелями в стороны', 'difficulty' => 'beginner', 'equipment' => 'Гантели', 'primary' => ['shoulders'], 'secondary' => ['traps']],
            'overhead-press' => ['name' => 'Жим штанги стоя', 'difficulty' => 'intermediate', 'equipment' => 'Штанга', 'primary' => ['shoulders'], 'secondary' => ['triceps', 'abs']],
            'rear-delt-fly' => ['name' => 'Разведения в наклоне', 'difficulty' => 'beginner', 'equipment' => 'Гантели', 'primary' => ['shoulders'], 'secondary' => ['traps']],
            'upright-row' => ['name' => 'Тяга к подбородку', 'difficulty' => 'intermediate', 'equipment' => 'Штанга / гантели', 'primary' => ['shoulders'], 'secondary' => ['traps']],

            'barbell-curl' => ['name' => 'Подъём штанги на бицепс', 'difficulty' => 'beginner', 'equipment' => 'Штанга', 'primary' => ['biceps'], 'secondary' => ['forearms']],
            'dumbbell-curl' => ['name' => 'Подъём гантелей на бицепс', 'difficulty' => 'beginner', 'equipment' => 'Гантели', 'primary' => ['biceps'], 'secondary' => ['forearms']],
            'hammer-curl' => ['name' => 'Молотковые сгибания', 'difficulty' => 'beginner', 'equipment' => 'Гантели', 'primary' => ['biceps', 'forearms'], 'secondary' => []],
            'scott-curl' => ['name' => 'Сгибания на скамье Скотта', 'difficulty' => 'intermediate', 'equipment' => 'Скамья Скотта, EZ-гриф', 'primary' => ['biceps'], 'secondary' => ['forearms']],

            'french-press' => ['name' => 'Французский жим', 'difficulty' => 'intermediate', 'equipment' => 'EZ-гриф / гантели', 'primary' => ['triceps'], 'secondary' => []],
            'triceps-pushdown' => ['name' => 'Разгибание рук на блоке', 'difficulty' => 'beginner', 'equipment' => 'Блочный тренажёр', 'primary' => ['triceps'], 'secondary' => ['forearms']],
            'dips' => ['name' => 'Отжимания на брусьях', 'difficulty' => 'intermediate', 'equipment' => 'Брусья', 'primary' => ['triceps', 'chest'], 'secondary' => ['shoulders']],
            'close-grip-bench-press' => ['name' => 'Жим узким хватом', 'difficulty' => 'intermediate', 'equipment' => 'Штанга, скамья', 'primary' => ['triceps'], 'secondary' => ['chest', 'shoulders']],

            'farmers-walk' => ['name' => 'Фермерская прогулка', 'difficulty' => 'beginner', 'equipment' => 'Гантели / гири', 'primary' => ['forearms'], 'secondary' => ['traps', 'abs', 'calves']],
            'wrist-curl' => ['name' => 'Сгибания кистей', 'difficulty' => 'beginner', 'equipment' => 'Гантели / штанга', 'primary' => ['forearms'], 'secondary' => []],
            'dead-hang' => ['name' => 'Вис на турнике', 'difficulty' => 'beginner', 'equipment' => 'Турник', 'primary' => ['forearms'], 'secondary' => ['lats']],

            'crunches' => ['name' => 'Скручивания', 'difficulty' => 'beginner', 'equipment' => 'Коврик', 'primary' => ['abs'], 'secondary' => ['obliques']],
            'hanging-leg-raise' => ['name' => 'Подъём ног в висе', 'difficulty' => 'intermediate', 'equipment' => 'Турник', 'primary' => ['abs'], 'secondary' => ['forearms']],
            'plank' => ['name' => 'Планка', 'difficulty' => 'beginner', 'equipment' => 'Коврик', 'primary' => ['abs'], 'secondary' => ['obliques', 'glutes']],
            'cable-crunch' => ['name' => 'Скручивания на блоке', 'difficulty' => 'intermediate', 'equipment' => 'Блочный тренажёр', 'primary' => ['abs'], 'secondary' => []],
            'side-plank' => ['name' => 'Боковая планка', 'difficulty' => 'beginner', 'equipment' => 'Коврик', 'primary' => ['obliques'], 'secondary' => ['abs', 'glutes']],
            'pallof-press' => ['name' => 'Pallof press', 'difficulty' => 'beginner', 'equipment' => 'Блок / резинка', 'primary' => ['obliques'], 'secondary' => ['abs']],

            'shrugs' => ['name' => 'Шраги', 'difficulty' => 'beginner', 'equipment' => 'Гантели / штанга', 'primary' => ['traps'], 'secondary' => ['forearms']],
            'face-pull' => ['name' => 'Face pull', 'difficulty' => 'beginner', 'equipment' => 'Блок / резинка', 'primary' => ['traps', 'shoulders'], 'secondary' => []],

            'hyperextension' => ['name' => 'Гиперэкстензия', 'difficulty' => 'beginner', 'equipment' => 'Римский стул', 'primary' => ['lower_back'], 'secondary' => ['glutes', 'hamstrings']],
            'bird-dog' => ['name' => 'Bird-dog', 'difficulty' => 'beginner', 'equipment' => 'Коврик', 'primary' => ['lower_back', 'abs'], 'secondary' => ['glutes']],

            'glute-bridge' => ['name' => 'Ягодичный мост', 'difficulty' => 'beginner', 'equipment' => 'Коврик / штанга', 'primary' => ['glutes'], 'secondary' => ['hamstrings']],
            'hip-thrust' => ['name' => 'Хип-траст', 'difficulty' => 'intermediate', 'equipment' => 'Скамья, штанга', 'primary' => ['glutes'], 'secondary' => ['hamstrings']],
            'lunges' => ['name' => 'Выпады', 'difficulty' => 'beginner', 'equipment' => 'Вес тела / гантели', 'primary' => ['quads', 'glutes'], 'secondary' => ['hamstrings', 'calves']],

            'squat' => ['name' => 'Приседания', 'difficulty' => 'intermediate', 'equipment' => 'Штанга / вес тела', 'primary' => ['quads', 'glutes'], 'secondary' => ['hamstrings', 'abs', 'lower_back']],
            'leg-press' => ['name' => 'Жим ногами', 'difficulty' => 'beginner', 'equipment' => 'Тренажёр', 'primary' => ['quads'], 'secondary' => ['glutes', 'hamstrings']],
            'leg-extension' => ['name' => 'Разгибание ног в тренажёре', 'difficulty' => 'beginner', 'equipment' => 'Тренажёр', 'primary' => ['quads'], 'secondary' => []],

            'romanian-deadlift' => ['name' => 'Румынская тяга', 'difficulty' => 'intermediate', 'equipment' => 'Штанга / гантели', 'primary' => ['hamstrings', 'glutes'], 'secondary' => ['lower_back', 'forearms']],
            'leg-curl' => ['name' => 'Сгибание ног в тренажёре', 'difficulty' => 'beginner', 'equipment' => 'Тренажёр', 'primary' => ['hamstrings'], 'secondary' => []],
            'stiff-leg-deadlift' => ['name' => 'Становая тяга на прямых ногах', 'difficulty' => 'advanced', 'equipment' => 'Штанга', 'primary' => ['hamstrings'], 'secondary' => ['glutes', 'lower_back']],

            'standing-calf-raise' => ['name' => 'Подъёмы на носки стоя', 'difficulty' => 'beginner', 'equipment' => 'Тренажёр / гантели', 'primary' => ['calves'], 'secondary' => []],
            'seated-calf-raise' => ['name' => 'Подъёмы на носки сидя', 'difficulty' => 'beginner', 'equipment' => 'Тренажёр', 'primary' => ['calves'], 'secondary' => []],
            'leg-press-calf-raise' => ['name' => 'Жим носками в тренажёре', 'difficulty' => 'beginner', 'equipment' => 'Жим ногами', 'primary' => ['calves'], 'secondary' => []],
        ];

        foreach ($exercises as $slug => $data) {
            $exercise = Exercise::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $data['name'],
                    'description' => $data['description'] ?? $this->descriptionFor($data['name']),
                    'technique' => $data['technique'] ?? 'Держите корпус стабильно, выполняйте движение подконтрольно и не жертвуйте техникой ради веса.',
                    'common_mistakes' => $data['common_mistakes'] ?? 'Слишком большой вес, рывки, потеря амплитуды и отсутствие контроля в негативной фазе.',
                    'difficulty' => $data['difficulty'],
                    'equipment' => $data['equipment'],
                    'video_url' => $data['video_url'] ?? null,
                    'thumbnail_url' => $data['thumbnail_url'] ?? null,
                ]
            );

            $sync = [];
            foreach (Arr::wrap($data['primary'] ?? []) as $muscleSlug) {
                if (isset($muscleModels[$muscleSlug])) {
                    $sync[$muscleModels[$muscleSlug]->id] = ['role' => 'primary'];
                }
            }

            foreach (Arr::wrap($data['secondary'] ?? []) as $muscleSlug) {
                if (isset($muscleModels[$muscleSlug]) && !isset($sync[$muscleModels[$muscleSlug]->id])) {
                    $sync[$muscleModels[$muscleSlug]->id] = ['role' => 'secondary'];
                }
            }

            $exercise->muscles()->sync($sync);
        }
    }

    private function descriptionFor(string $name): string
    {
        return "{$name} — упражнение для развития силы, мышечного контроля и стабильной техники. Подбирайте нагрузку под свой уровень.";
    }
}
