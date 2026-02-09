import { apiGet } from "@/services/api";

export default async function TrainersPage() {
  const trainers = await apiGet("/trainers");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Наши тренеры</h1>
        <p className="text-gray-500">Профессионалы, которые приведут тебя к результату</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {trainers.map(t => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >
            <div className="h-48 bg-gradient-to-br from-[#BBD9B2] to-[#2D6033] flex items-center justify-center text-white font-semibold">
              Фото
            </div>

            <div className="p-5 space-y-2">
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-[#2D6033]">{t.specialization}</p>
              <p className="text-sm text-gray-500 line-clamp-3">{t.bio}</p>

              <a
                href={`/trainers/${t.id}`}
                className="inline-block mt-2 text-sm font-medium text-[#2D6033] hover:underline"
              >
                Подробнее →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
