"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";
import {
  Bookmark,
  Calendar,
  CreditCard,
  Dumbbell,
  Heart,
  LogOut,
  Newspaper,
  Package,
  Shield,
  Star,
  Target,
  User,
} from "lucide-react";

const navigation = [
  ["Профиль", "/account", User, true],
  ["Мои программы", "/account/programs", Target],
  ["Мои статьи", "/account/articles", Newspaper],
  ["Сохранённые", "/account/saved-articles", Bookmark],
  ["Абонемент", "/account/membership", CreditCard],
  ["Избранное", "/account/favorite-products", Heart],
  ["Заказы", "/account/orders", Package],
  ["Бронирования", "/account/bookings", Calendar],
  ["Отзывы", "/account/reviews", Star],
  ["Безопасность", "/account/security", Shield],
];

export default function AccountNavigation() {
  const pathname = usePathname();
  const { user, isAdmin, isTrainer, logout } = useAuth();

  const isActive = (href, exact) => exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  const primary = navigation.map(([name, href, Icon, exact]) => [
    isTrainer && href === "/account/bookings" ? "Клиенты и записи" : name,
    href,
    Icon,
    exact,
  ]);

  const extra = [
    ...(isTrainer ? [["Кабинет тренера", "/dashboard", Dumbbell, false, "secondary"]] : []),
    ...(isAdmin ? [["Админ-панель", "/admin", Shield, false, "warm"]] : []),
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 border-b border-[color:var(--stroke)] px-1 pb-4 lg:px-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-[color:var(--accent)] text-sm font-black text-[color:var(--on-accent)]">
          {user?.name?.charAt(0)?.toUpperCase() || "П"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-[color:var(--text)]">{user?.name || "Пользователь"}</div>
          <div className="truncate text-xs text-[color:var(--muted)]">{user?.email || ""}</div>
        </div>
      </div>

      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0" aria-label="Личный кабинет">
        {[...primary, ...extra].map(([name, href, Icon, exact, tone = "accent"]) => {
          const active = isActive(href, exact);
          const activeStyle = tone === "warm"
            ? "border-[color:var(--warm-border)] bg-[color:var(--warm-soft)] text-[color:var(--warm)]"
            : tone === "secondary"
              ? "border-[color:var(--secondary-border)] bg-[color:var(--secondary-soft)] text-[color:var(--secondary)]"
              : "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-bold transition lg:w-full lg:rounded-[14px] lg:px-3.5",
                active ? activeStyle : "border-transparent text-[color:var(--muted)] hover:bg-[color:var(--panel-2)] hover:text-[color:var(--text)]"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="whitespace-nowrap lg:truncate">{name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[color:var(--danger)] transition hover:border-[color:color-mix(in_srgb,var(--danger)_35%,var(--stroke))] hover:bg-[color:var(--danger-soft)] lg:justify-start lg:rounded-[14px]"
      >
        <LogOut className="h-[18px] w-[18px]" /> Выйти
      </button>
    </div>
  );
}
