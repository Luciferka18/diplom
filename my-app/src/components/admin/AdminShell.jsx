"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  MapPin,
  MessageSquareText,
  Newspaper,
  Package,
  ShoppingCart,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navigation = [
  ["/admin", "Обзор", LayoutDashboard, true],
  ["/admin/users", "Пользователи", Users],
  ["/admin/trainers", "Тренеры", Dumbbell],
  ["/admin/programs", "Программы", ClipboardList],
  ["/admin/products", "Товары", Package],
  ["/admin/orders", "Заказы", ShoppingCart],
  ["/admin/bookings", "Записи", CalendarDays],
  ["/admin/reviews", "Отзывы", MessageSquareText],
  ["/admin/articles", "Статьи", Newspaper],
  ["/admin/categories", "Категории", Tags],
  ["/admin/locations", "Локации", MapPin],
  ["/admin/monetization", "Монетизация", CreditCard],
  ["/admin/recommendations", "Рекомендации", Sparkles],
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const active = (href, exact) => exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[color:var(--bg)]">
      <div className="mx-auto grid w-full max-w-[1580px] items-start gap-5 px-3 py-4 sm:px-5 sm:py-6 xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-7 xl:px-7">
        <aside className="min-w-0 rounded-[22px] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-2 shadow-[var(--shadow-sm)] xl:sticky xl:top-[88px]">
          <div className="hidden px-3 pb-3 pt-2 xl:block">
            <div className="nf-eyebrow">Управление</div>
            <div className="mt-1 text-lg font-black tracking-[-0.035em]">Рабочее пространство</div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 xl:grid xl:overflow-visible xl:pb-0" aria-label="Навигация администратора">
            {navigation.map(([href, label, Icon, exact]) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-full border px-3.5 py-2.5 text-sm font-bold transition xl:w-full xl:rounded-[14px]",
                  active(href, exact)
                    ? "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                    : "border-transparent text-[color:var(--muted)] hover:bg-[color:var(--panel-2)] hover:text-[color:var(--text)]"
                )}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
