export const MUSCLE_SLUGS = [
  "chest",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "lats",
  "traps",
  "lower_back",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
];

export const MUSCLE_FALLBACK = {
  chest: {
    slug: "chest",
    name: "Грудные мышцы",
    latin_name: "Pectoralis major",
    body_side: "front",
    description: "Грудные мышцы участвуют в жимовых движениях, приведении рук и формируют сильный верх тела.",
    function: "Приведение плеча, сгибание плеча, горизонтальное сведение рук и жимовые движения.",
    how_to_grow: "Развивайте грудь через жимы под разными углами, отжимания и изоляцию. Важны прогрессия нагрузки, контроль лопаток и полная амплитуда.",
    exercises: [
      { slug: "bench-press", name: "Жим штанги лёжа", difficulty: "intermediate", equipment: "Штанга, скамья", video_url: "", role: "primary" },
      { slug: "dumbbell-bench-press", name: "Жим гантелей лёжа", difficulty: "intermediate", equipment: "Гантели, скамья", video_url: "", role: "primary" },
      { slug: "push-ups", name: "Отжимания", difficulty: "beginner", equipment: "Вес тела", video_url: "", role: "primary" },
      { slug: "cable-fly", name: "Сведение рук в кроссовере", difficulty: "intermediate", equipment: "Кроссовер", video_url: "", role: "primary" },
    ],
  },
  shoulders: {
    slug: "shoulders",
    name: "Плечи / дельты",
    latin_name: "Deltoideus",
    body_side: "both",
    description: "Дельтовидные мышцы отвечают за форму плеч и контроль руки в разных плоскостях.",
    function: "Отведение руки, сгибание и разгибание плеча, стабилизация плечевого сустава.",
    how_to_grow: "Комбинируйте жимы, махи в стороны, работу на заднюю дельту и упражнения для стабильности лопаток.",
    exercises: [
      { slug: "seated-dumbbell-press", name: "Жим гантелей сидя", difficulty: "intermediate", equipment: "Гантели, скамья", video_url: "", role: "primary" },
      { slug: "lateral-raises", name: "Махи гантелями в стороны", difficulty: "beginner", equipment: "Гантели", video_url: "", role: "primary" },
      { slug: "overhead-press", name: "Жим штанги стоя", difficulty: "intermediate", equipment: "Штанга", video_url: "", role: "primary" },
      { slug: "rear-delt-fly", name: "Разведения в наклоне", difficulty: "beginner", equipment: "Гантели", video_url: "", role: "primary" },
    ],
  },
  biceps: {
    slug: "biceps",
    name: "Бицепс",
    latin_name: "Biceps brachii",
    body_side: "front",
    description: "Бицепс сгибает руку в локте и участвует в супинации предплечья.",
    function: "Сгибание локтя, супинация предплечья, помощь в тяговых движениях.",
    how_to_grow: "Используйте сгибания со штангой и гантелями, нейтральный хват и контролируемую негативную фазу.",
    exercises: [
      { slug: "barbell-curl", name: "Подъём штанги на бицепс", difficulty: "beginner", equipment: "Штанга", video_url: "", role: "primary" },
      { slug: "dumbbell-curl", name: "Подъём гантелей на бицепс", difficulty: "beginner", equipment: "Гантели", video_url: "", role: "primary" },
      { slug: "hammer-curl", name: "Молотковые сгибания", difficulty: "beginner", equipment: "Гантели", video_url: "", role: "primary" },
    ],
  },
  triceps: {
    slug: "triceps",
    name: "Трицепс",
    latin_name: "Triceps brachii",
    body_side: "back",
    description: "Трицепс разгибает руку в локте и сильно влияет на жимовые движения.",
    function: "Разгибание локтя, стабилизация плеча, помощь в жимах.",
    how_to_grow: "Комбинируйте разгибания на блоке, французский жим, брусья и жим узким хватом.",
    exercises: [
      { slug: "french-press", name: "Французский жим", difficulty: "intermediate", equipment: "Штанга EZ / гантели", video_url: "", role: "primary" },
      { slug: "triceps-pushdown", name: "Разгибание рук на блоке", difficulty: "beginner", equipment: "Блок", video_url: "", role: "primary" },
      { slug: "dips", name: "Отжимания на брусьях", difficulty: "intermediate", equipment: "Брусья", video_url: "", role: "primary" },
    ],
  },
  forearms: {
    slug: "forearms",
    name: "Предплечья",
    latin_name: "Antebrachium",
    body_side: "both",
    description: "Предплечья отвечают за хват, контроль кисти и устойчивость в тягах.",
    function: "Сгибание и разгибание кисти, удержание веса, стабилизация хвата.",
    how_to_grow: "Развивайте хват через фермерскую прогулку, висы, сгибания кистей и упражнения с толстым грифом.",
    exercises: [
      { slug: "farmers-walk", name: "Фермерская прогулка", difficulty: "beginner", equipment: "Гантели / гири", video_url: "", role: "primary" },
      { slug: "wrist-curl", name: "Сгибания кистей", difficulty: "beginner", equipment: "Гантели / штанга", video_url: "", role: "primary" },
    ],
  },
  abs: {
    slug: "abs",
    name: "Пресс",
    latin_name: "Rectus abdominis",
    body_side: "front",
    description: "Прямая мышца живота помогает сгибать корпус и стабилизировать позвоночник.",
    function: "Сгибание корпуса, стабилизация таза и позвоночника, контроль корпуса в базовых упражнениях.",
    how_to_grow: "Сочетайте скручивания, подъёмы ног, планки и прогрессию нагрузки без рывков поясницей.",
    exercises: [
      { slug: "crunches", name: "Скручивания", difficulty: "beginner", equipment: "Коврик", video_url: "", role: "primary" },
      { slug: "hanging-leg-raise", name: "Подъём ног в висе", difficulty: "intermediate", equipment: "Турник", video_url: "", role: "primary" },
      { slug: "plank", name: "Планка", difficulty: "beginner", equipment: "Коврик", video_url: "", role: "primary" },
    ],
  },
  obliques: {
    slug: "obliques",
    name: "Косые мышцы живота",
    latin_name: "Obliquus externus et internus abdominis",
    body_side: "front",
    description: "Косые мышцы помогают поворачивать корпус и защищают поясницу при движениях.",
    function: "Ротация и боковое сгибание корпуса, анти-ротационная стабилизация.",
    how_to_grow: "Используйте боковые планки, Pallof press, контролируемые повороты и переносы веса.",
    exercises: [
      { slug: "side-plank", name: "Боковая планка", difficulty: "beginner", equipment: "Коврик", video_url: "", role: "primary" },
      { slug: "pallof-press", name: "Pallof press", difficulty: "beginner", equipment: "Блок / резинка", video_url: "", role: "primary" },
    ],
  },
  lats: {
    slug: "lats",
    name: "Широчайшие мышцы спины",
    latin_name: "Latissimus dorsi",
    body_side: "back",
    description: "Широчайшие формируют силу тяговых движений и V-образный силуэт.",
    function: "Приведение плеча, разгибание плеча, тяга руки к корпусу.",
    how_to_grow: "Основа — подтягивания, тяги верхнего блока, горизонтальные тяги и контроль лопаток.",
    exercises: [
      { slug: "pull-ups", name: "Подтягивания", difficulty: "intermediate", equipment: "Турник", video_url: "", role: "primary" },
      { slug: "lat-pulldown", name: "Тяга верхнего блока", difficulty: "beginner", equipment: "Блочный тренажёр", video_url: "", role: "primary" },
      { slug: "barbell-row", name: "Тяга штанги в наклоне", difficulty: "intermediate", equipment: "Штанга", video_url: "", role: "primary" },
    ],
  },
  traps: {
    slug: "traps",
    name: "Трапеции",
    latin_name: "Trapezius",
    body_side: "back",
    description: "Трапеции стабилизируют лопатки, шею и верх спины.",
    function: "Подъём, опускание и приведение лопаток, стабилизация плечевого пояса.",
    how_to_grow: "Шраги, тяги, face pull и контроль осанки помогут развить верх спины без перегруза шеи.",
    exercises: [
      { slug: "shrugs", name: "Шраги", difficulty: "beginner", equipment: "Гантели / штанга", video_url: "", role: "primary" },
      { slug: "face-pull", name: "Face pull", difficulty: "beginner", equipment: "Блок / резинка", video_url: "", role: "primary" },
    ],
  },
  lower_back: {
    slug: "lower_back",
    name: "Поясница",
    latin_name: "Erector spinae",
    body_side: "back",
    description: "Разгибатели позвоночника помогают держать корпус и безопасно выполнять тяги.",
    function: "Разгибание позвоночника, стабилизация корпуса, удержание нейтральной спины.",
    how_to_grow: "Начинайте с гиперэкстензии и bird-dog, затем добавляйте тяги с идеальной техникой.",
    exercises: [
      { slug: "hyperextension", name: "Гиперэкстензия", difficulty: "beginner", equipment: "Римский стул", video_url: "", role: "primary" },
      { slug: "romanian-deadlift", name: "Румынская тяга", difficulty: "intermediate", equipment: "Штанга / гантели", video_url: "", role: "secondary" },
    ],
  },
  glutes: {
    slug: "glutes",
    name: "Ягодицы",
    latin_name: "Gluteus maximus / medius",
    body_side: "back",
    description: "Ягодичные мышцы отвечают за разгибание бедра, стабильность таза и силу нижней части тела.",
    function: "Разгибание и отведение бедра, стабилизация таза, мощность в приседаниях и тягах.",
    how_to_grow: "Используйте хип-траст, ягодичный мост, выпады и румынскую тягу с прогрессией нагрузки.",
    exercises: [
      { slug: "glute-bridge", name: "Ягодичный мост", difficulty: "beginner", equipment: "Коврик / штанга", video_url: "", role: "primary" },
      { slug: "hip-thrust", name: "Хип-траст", difficulty: "intermediate", equipment: "Скамья, штанга", video_url: "", role: "primary" },
      { slug: "lunges", name: "Выпады", difficulty: "beginner", equipment: "Вес тела / гантели", video_url: "", role: "secondary" },
    ],
  },
  quads: {
    slug: "quads",
    name: "Квадрицепсы",
    latin_name: "Quadriceps femoris",
    body_side: "front",
    description: "Квадрицепсы разгибают колено и дают силу в приседаниях, выпадах и жиме ногами.",
    function: "Разгибание колена, стабилизация коленного сустава, работа в приседаниях.",
    how_to_grow: "Приседайте в контролируемой амплитуде, добавляйте жим ногами, выпады и разгибания ног.",
    exercises: [
      { slug: "squat", name: "Приседания", difficulty: "intermediate", equipment: "Штанга / вес тела", video_url: "", role: "primary" },
      { slug: "leg-press", name: "Жим ногами", difficulty: "beginner", equipment: "Тренажёр", video_url: "", role: "primary" },
      { slug: "leg-extension", name: "Разгибание ног в тренажёре", difficulty: "beginner", equipment: "Тренажёр", video_url: "", role: "primary" },
    ],
  },
  hamstrings: {
    slug: "hamstrings",
    name: "Бицепс бедра",
    latin_name: "Hamstrings",
    body_side: "back",
    description: "Задняя поверхность бедра сгибает колено и помогает разгибать бедро.",
    function: "Сгибание колена, разгибание бедра, стабилизация таза.",
    how_to_grow: "Добавьте румынскую тягу, сгибания ног, становую на прямых ногах и гиперэкстензию.",
    exercises: [
      { slug: "romanian-deadlift", name: "Румынская тяга", difficulty: "intermediate", equipment: "Штанга / гантели", video_url: "", role: "primary" },
      { slug: "leg-curl", name: "Сгибание ног в тренажёре", difficulty: "beginner", equipment: "Тренажёр", video_url: "", role: "primary" },
      { slug: "stiff-leg-deadlift", name: "Становая тяга на прямых ногах", difficulty: "advanced", equipment: "Штанга", video_url: "", role: "primary" },
    ],
  },
  calves: {
    slug: "calves",
    name: "Икры",
    latin_name: "Gastrocnemius / Soleus",
    body_side: "both",
    description: "Икроножные и камбаловидные мышцы отвечают за подъём на носки, прыжки и устойчивую походку.",
    function: "Подошвенное сгибание стопы, стабилизация голеностопа, работа при беге и ходьбе.",
    how_to_grow: "Тренируйте икры стоя и сидя, меняйте темп, делайте паузу в верхней точке и растяжение внизу.",
    exercises: [
      { slug: "standing-calf-raise", name: "Подъёмы на носки стоя", difficulty: "beginner", equipment: "Тренажёр / гантели", video_url: "", role: "primary" },
      { slug: "seated-calf-raise", name: "Подъёмы на носки сидя", difficulty: "beginner", equipment: "Тренажёр", video_url: "", role: "primary" },
      { slug: "leg-press-calf-raise", name: "Жим носками в тренажёре", difficulty: "beginner", equipment: "Жим ногами", video_url: "", role: "primary" },
    ],
  },
};

export function getFallbackMuscle(slug = "chest") {
  return MUSCLE_FALLBACK[slug] || MUSCLE_FALLBACK.chest;
}

export function normalizeMuscle(raw, slug = "chest") {
  const fallback = getFallbackMuscle(slug);
  if (!raw || typeof raw !== "object") return fallback;

  return {
    ...fallback,
    ...raw,
    exercises: Array.isArray(raw.exercises) && raw.exercises.length
      ? raw.exercises.map((exercise) => ({
          slug: exercise.slug,
          name: exercise.name,
          description: exercise.description,
          difficulty: exercise.difficulty,
          equipment: exercise.equipment,
          video_url: exercise.video_url,
          thumbnail_url: exercise.thumbnail_url,
          role: exercise.role || exercise?.pivot?.role || "primary",
          primary_muscles: exercise.primary_muscles || [],
          secondary_muscles: exercise.secondary_muscles || [],
        }))
      : fallback.exercises,
  };
}

export function difficultyLabel(value) {
  return {
    beginner: "новичок",
    intermediate: "средний",
    advanced: "продвинутый",
  }[value] || value || "любой уровень";
}
