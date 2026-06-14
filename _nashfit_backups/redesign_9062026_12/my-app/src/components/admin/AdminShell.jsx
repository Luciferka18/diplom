"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  Package,
  ShoppingCart,
  CalendarDays,
  MessageSquareText,
  Newspaper,
  Tags,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";

const navigation = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/trainers", label: "Тренеры", icon: Dumbbell },
  { href: "/admin/programs", label: "Программы", icon: ClipboardList },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/bookings", label: "Записи", icon: CalendarDays },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquareText },
  { href: "/admin/articles", label: "Статьи", icon: Newspaper },
  { href: "/admin/categories", label: "Категории", icon: Tags },
  { href: "/admin/locations", label: "Локации", icon: MapPin },
  { href: "/admin/monetization", label: "Монетизация", icon: CreditCard },
  { href: "/admin/recommendations", label: "Рекомендации", icon: Sparkles },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  const active = (item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[color:var(--bg)]">
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-6">
        <aside className="h-fit rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:sticky lg:top-20">
          <div className="border-b border-[color:var(--stroke)] px-3 pb-4 pt-2">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">НашФит</div>
            <div className="mt-1 text-xl font-bold text-[color:var(--text)]">Панель управления</div>
          </div>

          <nav className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1" aria-label="Навигация администратора">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active(item)
                      ? "bg-[color:var(--accent)] text-white shadow-sm"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--bg)] hover:text-[color:var(--text)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="mt-4 flex items-center gap-2 border-t border-[color:var(--stroke)] px-3 pt-4 text-sm text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться на сайт
          </Link>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
