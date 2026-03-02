import Link from "next/link";
import HomeReviews from "@/components/HomeReviews";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const quickLinks = [
  { href: "/trainers", title: "Тренеры", text: "Подбор специалиста под цель: похудение, набор массы, функционал.", cta: "Перейти →", icon: "🏋️", span: "md:col-span-4" },
  { href: "/programs", title: "Программы", text: "Готовые планы занятий. Уровень, длительность и результат.", cta: "Перейти →", icon: "📈", span: "md:col-span-4" },
  { href: "/shop", title: "Магазин", text: "Добавки, питание, инвентарь. Всё в одной корзине.", cta: "Перейти →", icon: "🛒", span: "md:col-span-4" },
  { href: "/articles", title: "Статьи и гайды", text: "Питание, восстановление, техника и полезные советы.", cta: "Читать →", icon: "📚", span: "md:col-span-6" },
  { href: "/booking", title: "Запись на тренировку", text: "Бронирование занятий и управление расписанием.", cta: "Записаться →", icon: "🗓️", span: "md:col-span-6" },
];

export default function HomePage() {
  return (
    <>
      <Section className="pt-12 md:pt-16 pb-8 md:pb-10">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4">Платформа тренировок • программы • магазин</Badge>
          <h1 className="text-5xl md:text-6xl font-black leading-tight bg-gradient-to-r from-green-300 via-emerald-200 to-green-500 bg-clip-text text-transparent">
            Добро пожаловать в FitLab
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-white/75">
            Выбирай тренера, проходи программы тренировок, покупай спортивные товары и веди прогресс.
          </p>
          <div className="mt-8 flex justify-center">
            <Button as={Link} href="/programs" size="lg">Начать тренировку</Button>
          </div>
        </div>
      </Section>

      <Section className="py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {quickLinks.map((item) => (
            <Card key={item.href} as={Link} href={item.href} className={`${item.span} h-full group p-6`}>
              <div className="flex h-full flex-col">
                <div className="mb-3 text-2xl" aria-hidden="true">{item.icon}</div>
                <div className="text-xl font-bold">{item.title}</div>
                <p className="mt-2 flex-1 text-white/70">{item.text}</p>
                <div className="mt-5 font-semibold text-emerald-200 group-hover:text-white transition">{item.cta}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-8 md:pt-10">
        <HomeReviews />
      </Section>
    </>
  );
}