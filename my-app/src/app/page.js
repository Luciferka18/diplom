import Link from "next/link";
import HomeReviews from "@/components/HomeReviews";

const quickLinks = [
  {
    href: "/trainers",
    title: "Тренеры",
    text: "Подбор специалиста под цель: похудение, набор массы, функционал.",
    cta: "Перейти →",
    icon: "🏋️",
    span: "col-4",
  },
  {
    href: "/programs",
    title: "Программы",
    text: "Готовые планы занятий. Уровень, длительность и результат.",
    cta: "Перейти →",
    icon: "📈",
    span: "col-4",
  },
  {
    href: "/shop",
    title: "Магазин",
    text: "Добавки, питание, инвентарь. Всё в одной корзине.",
    cta: "Перейти →",
    icon: "🛒",
    span: "col-4",
  },
  {
    href: "/articles",
    title: "Статьи и гайды",
    text: "Питание, восстановление, техника и полезные советы.",
    cta: "Читать →",
    icon: "📚",
    span: "col-6",
  },
  {
    href: "/booking",
    title: "Запись на тренировку",
    text: "Бронирование занятий и управление расписанием.",
    cta: "Записаться →",
    icon: "🗓️",
    span: "col-6",
  },
];

export default function HomePage() {
  return (
    <div className="py-12 md:py-16">
      <section className="text-center mx-auto max-w-4xl">
        <p className="kicker">Платформа тренировок • программы • магазин</p>
        <h1 className="page-title text-5xl md:text-6xl leading-tight bg-gradient-to-r from-green-300 via-emerald-200 to-green-500 bg-clip-text text-transparent">
          Добро пожаловать в FitLab
        </h1>
        <p className="page-subtitle mx-auto max-w-2xl text-base md:text-lg">
          Выбирай тренера, проходи программы тренировок, покупай спортивные товары и веди прогресс.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:opacity-90"
          >
            Начать тренировку
          </Link>
        </div>
      </section>

      <section className="mt-12 md:mt-14">
        <div className="home-grid gap-6 md:gap-8">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`card ${item.span} group h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30`}
            >
              <div className="flex h-full flex-col">
                <div className="mb-3 text-2xl" aria-hidden="true">
                  {item.icon}
                </div>
                <div className="card-title">{item.title}</div>
                <p className="card-text flex-1">{item.text}</p>
                <div className="card-cta mt-5 text-emerald-200 transition group-hover:text-white">{item.cta}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 md:mt-16">
        <HomeReviews />
      </section>
    </div>
  );
}
