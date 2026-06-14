"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Dumbbell, Mail, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";

const columns = [
  {
    title: "Тренировки",
    links: [
      ["/trainers", "Тренеры"],
      ["/booking", "Записаться"],
      ["/programs", "Бесплатные программы"],
      ["/memberships", "Абонементы"],
    ],
  },
  {
    title: "Полезное",
    links: [
      ["/articles", "Фитнес-журнал"],
      ["/shop", "Магазин"],
      ["/cart", "Корзина"],
      ["/contacts", "Контакты"],
    ],
  },
  {
    title: "Аккаунт",
    links: [
      ["/account", "Личный кабинет"],
      ["/account/programs", "Мой прогресс"],
      ["/account/orders", "Заказы"],
      ["/account/bookings", "Записи"],
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t border-[color:var(--stroke)] bg-[color:var(--panel)] md:mt-24">
      <Container size="wide" className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2fr]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[color:var(--accent)] text-[color:var(--on-accent)]"><Dumbbell size={20} /></span>
              <span className="text-xl font-black tracking-[-0.055em]">НашФит</span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
              Фитнес-клуб, где бесплатные программы и знания помогают начать, а тренеры — двигаться дальше безопасно и с результатом.
            </p>
            <Link href="/booking" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--warm)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--warm-hover)]">
              Записаться на тренировку <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--muted2)]">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map(([href, label]) => (
                    <li key={href}><Link href={href} className="text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-3 border-t border-[color:var(--stroke)] pt-6 text-sm text-[color:var(--muted)] md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2"><MapPin size={14} /> Офлайн-клуб «НашФит»</span>
            <a href="tel:+70000000000" className="inline-flex items-center gap-2 hover:text-[color:var(--text)]"><Phone size={14} /> +7 (000) 000-00-00</a>
            <a href="mailto:hello@nashfit.local" className="inline-flex items-center gap-2 hover:text-[color:var(--text)]"><Mail size={14} /> hello@nashfit.local</a>
          </div>
          <div>© {new Date().getFullYear()} НашФит</div>
        </div>
      </Container>
    </footer>
  );
}
