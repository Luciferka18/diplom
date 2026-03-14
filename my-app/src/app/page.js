import Link from "next/link";
import HomeReviews from "@/components/HomeReviews";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const stats = [
  { icon: "🧑‍🏫", value: "12", label: "Тренеров" },
  { icon: "📋", value: "25", label: "Программ" },
  { icon: "🛍️", value: "80+", label: "Товаров" },
  { icon: "⭐", value: "4.9", label: "Средний рейтинг" },
];

const howItWorks = [
  { icon: "1️⃣", title: "Выбери цель", text: "Определи формат: набор массы, сушка или поддержка формы." },
  { icon: "2️⃣", title: "Собери план", text: "Подбери тренера, программу и товары под свой режим." },
  { icon: "3️⃣", title: "Отслеживай прогресс", text: "Занимайся регулярно и фиксируй результаты в кабинете." },
];

const benefits = [
  { icon: "⚡", title: "Быстрый старт", text: "Всё для тренировок и питания в одном месте." },
  { icon: "🎯", title: "Точечные рекомендации", text: "Программы и тренеры под разные уровни и цели." },
  { icon: "🧠", title: "Экспертный контент", text: "Статьи и гайды, которые помогают заниматься безопасно." },
  { icon: "🛡️", title: "Надёжный сервис", text: "Единая экосистема: от выбора до покупки и записи." },
];

const quickLinks = [
  { href: "/trainers", title: "Тренеры", text: "Подбор специалиста под цель: похудение, набор массы, функционал.", cta: "Перейти", icon: "🏋️", span: "md:col-span-4" },
  { href: "/programs", title: "Программы", text: "Готовые планы занятий. Уровень, длительность и результат.", cta: "Открыть", icon: "📈", span: "md:col-span-8" },
  { href: "/shop", title: "Магазин", text: "Добавки, питание, инвентарь. Всё в одной корзине.", cta: "К покупкам", icon: "🛒", span: "md:col-span-5" },
  { href: "/articles", title: "Статьи и гайды", text: "Питание, восстановление, техника и полезные советы.", cta: "Читать", icon: "📚", span: "md:col-span-3" },
  { href: "/booking", title: "Запись на тренировку", text: "Бронирование занятий и управление расписанием.", cta: "Записаться", icon: "🗓️", span: "md:col-span-4" },
];

export default function HomePage() {
  return (
    <>
      <Section className="pt-12 md:pt-16 pb-8 md:pb-10">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4">Новая энергия NashFit</Badge>
          <h1 className="text-5xl md:text-6xl font-black leading-tight text-[color:var(--text)]">
            Единая fitness-платформа для тренировок, питания и прогресса
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[color:var(--muted)]">
            Выбирай тренера, проходи программы, покупай товары и двигайся к цели в одном цифровом пространстве.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} href="/booking" size="lg">Начать тренировку</Button>
            <Button as={Link} href="/programs" variant="outline" size="lg">Смотреть программы</Button>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="p-4 md:p-5 text-left" hover={false}>
                <div className="text-xl">{s.icon}</div>
                <div className="mt-2 text-2xl font-bold text-[color:var(--text)]">{s.value}</div>
                <div className="text-sm text-[color:var(--muted)]">{s.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Как это работает" subtitle="Три простых шага до стабильного результата." className="py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {howItWorks.map((step) => (
            <Card key={step.title} className="p-6">
              <div className="text-2xl">{step.icon}</div>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-[color:var(--muted)]">{step.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Почему NashFit" subtitle="Собрали всё нужное для уверенного и комфортного прогресса." className="py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <Card key={b.title} className="h-full">
              <div className="text-2xl">{b.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{b.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Разделы платформы" subtitle="Быстрый переход к ключевым возможностям NashFit." className="py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {quickLinks.map((item) => (
            <Card
              key={item.href}
              as={Link}
              href={item.href}
              className={`${item.span} h-full group p-6 relative overflow-hidden`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[color:var(--panel)] opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex h-full flex-col relative">
                <div className="mb-3 text-2xl" aria-hidden="true">{item.icon}</div>
                <div className="text-xl font-bold">{item.title}</div>
                <p className="mt-2 flex-1 text-[color:var(--muted)]">{item.text}</p>
                <div className="mt-5 inline-flex items-center gap-2 font-semibold text-[color:var(--accent)] group-hover:text-[color:var(--text)] transition">
                  {item.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <HomeReviews />
      </Section>
    </>
  );
}