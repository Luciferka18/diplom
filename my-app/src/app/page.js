import { apiGet } from "@/services/api";

export default async function HomePage() {
  const data = await apiGet("/home");

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="bg-gradient-to-r from-[#2D6033] to-[#3E7A4C] text-white rounded-xl p-10 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">{data.gym.name}</h1>
        <p className="max-w-xl text-lg opacity-90">{data.gym.description}</p>
        <a
          href="/programs"
          className="inline-block mt-6 bg-[#BBD9B2] text-[#2D6033] px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Выбрать программу
        </a>
      </section>

      {/* TRAINERS */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Наши тренеры</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {data.trainers.map(t => (
            <div
              key={t.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col gap-2"
            >
              <div className="h-40 bg-[#BBD9B2] rounded-lg flex items-center justify-center text-[#2D6033] font-bold text-lg">
                Фото
              </div>
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="text-sm opacity-80">{t.specialization}</p>
              <p className="text-sm">{t.bio}</p>
              <a
                href={`/trainers/${t.id}`}
                className="mt-auto text-sm text-[#2D6033] font-semibold hover:underline"
              >
                Подробнее →
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
