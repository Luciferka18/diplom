"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";
import {
  Bell,
  Bookmark,
  Calendar,
  ChevronRight,
  CreditCard,
  Heart,
  Home,
  LogOut,
  Newspaper,
  Package,
  Shield,
  Star,
  Target,
  User,
  Dumbbell,
} from "lucide-react";

const groups = [
  {
    title: "Аккаунт",
    items: [
      { name: "Обзор", href: "/account", icon: Home, exact: true },
      { name: "Личные данные", href: "/account/profile", icon: User },
      { name: "Абонемент", href: "/account/membership", icon: CreditCard },
      { name: "Уведомления", href: "/account/notifications", icon: Bell },
      { name: "Безопасность", href: "/account/security", icon: Shield },
    ],
  },
  {
    title: "Тренировки и покупки",
    items: [
      { name: "Мои программы", href: "/account/programs", icon: Target },
      { name: "Бронирования", href: "/account/bookings", icon: Calendar },
      { name: "Заказы", href: "/account/orders", icon: Package },
    ],
  },
  {
    title: "Сохранённое и контент",
    items: [
      { name: "Мои статьи", href: "/account/articles", icon: Newspaper },
      { name: "Сохранённые статьи", href: "/account/saved-articles", icon: Bookmark },
      { name: "Избранные товары", href: "/account/favorite-products", icon: Heart },
      { name: "Отзывы", href: "/account/reviews", icon: Star },
    ],
  },
];

const adminNavigation = [{ name: "Админ-панель", href: "/admin", icon: Shield }];
const trainerNavigation = [{ name: "Тренерский кабинет", href: "/dashboard", icon: Dumbbell }];

function NavItem({ item, active, tone = "emerald" }) {
  const toneClass = {
    emerald: active
      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
      : "text-[color:var(--muted)] hover:bg-[color:var(--bg)] hover:text-[color:var(--text)]",
    cyan: active
      ? "border-cyan-500/30 bg-cyan-500/12 text-cyan-800 dark:text-cyan-200"
      : "text-[color:var(--muted)] hover:bg-[color:var(--bg)] hover:text-[color:var(--text)]",
    violet: active
      ? "border-violet-500/30 bg-violet-500/12 text-violet-800 dark:text-violet-200"
      : "text-[color:var(--muted)] hover:bg-[color:var(--bg)] hover:text-[color:var(--text)]",
  }[tone] || "";

  const iconClass = active
    ? tone === "cyan"
      ? "text-cyan-700 dark:text-cyan-300"
      : tone === "violet"
        ? "text-violet-700 dark:text-violet-300"
        : "text-emerald-700 dark:text-emerald-300"
    : "text-[color:var(--muted)] group-hover:text-[color:var(--text)]";

  return (
    <a
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm transition-all duration-200",
        active ? toneClass : `border-transparent ${toneClass}`,
      )}
    >
      <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", iconClass)} />
      <span className="min-w-0 flex-1 font-bold">{item.name}</span>
      {active ? <ChevronRight className={cn("h-4 w-4 shrink-0", iconClass)} /> : null}
    </a>
  );
}

export default function AccountNavigation() {
  const pathname = usePathname();
  const { user, isAdmin, isTrainer, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isActive = (item) => (item.exact ? pathname === item.href : pathname?.startsWith(item.href));

  const normalizedGroups = groups.map((group) => ({
    ...group,
    items: group.items.map((item) => (isTrainer && item.href === "/account/bookings" ? { ...item, name: "Клиенты и записи" } : item)),
  }));

  return (
    <nav className="space-y-5">
      {normalizedGroups.map((group) => (
        <section key={group.title}>
          <div className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[color:var(--muted2)]">
            {group.title}
          </div>
          <div className="space-y-1.5">
            {group.items.map((item) => <NavItem key={item.href} item={item} active={isActive(item)} />)}
          </div>
        </section>
      ))}

      {isTrainer ? (
        <section>
          <div className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[color:var(--muted2)]">Для тренера</div>
          <div className="space-y-1.5">
            {trainerNavigation.map((item) => <NavItem key={item.href} item={item} active={isActive(item)} tone="cyan" />)}
          </div>
        </section>
      ) : null}

      {isAdmin ? (
        <section>
          <div className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.16em] text-[color:var(--muted2)]">Администрирование</div>
          <div className="space-y-1.5">
            {adminNavigation.map((item) => <NavItem key={item.href} item={item} active={isActive(item)} tone="violet" />)}
          </div>
        </section>
      ) : null}

      <div className="border-t border-[color:var(--stroke)] pt-4">
        <a href="/account/profile" className="mb-3 flex items-center gap-3 rounded-2xl bg-[color:var(--bg)] p-3 transition hover:bg-emerald-500/8">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 font-black text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "Н"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-[color:var(--text)]">{user?.name || "Пользователь"}</p>
            <p className="truncate text-xs text-[color:var(--muted)]">{user?.email || "Личные данные"}</p>
          </div>
        </a>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </nav>
  );
}
