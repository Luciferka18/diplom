"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/cn";
import {
  User,
  Package,
  Calendar,
  Star,
  Target,
  Settings,
  Shield,
  Dumbbell,
  Newspaper,
  Bookmark,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    name: "Профиль",
    href: "/account",
    icon: User,
    exact: true,
  },
  {
    name: "Мои программы",
    href: "/account/programs",
    icon: Target,
  },
  {
    name: "Мои статьи",
    href: "/account/articles",
    icon: Newspaper,
  },
  {
    name: "Сохранённые статьи",
    href: "/account/saved-articles",
    icon: Bookmark,
  },
  {
    name: "Заказы",
    href: "/account/orders",
    icon: Package,
  },
  {
    name: "Бронирования",
    href: "/account/bookings",
    icon: Calendar,
  },
  {
    name: "Отзывы",
    href: "/account/reviews",
    icon: Star,
  },
  {
    name: "Безопасность",
    href: "/account/security",
    icon: Shield,
  },
];

const adminNavigation = [
  {
    name: "Админ-панель",
    href: "/admin",
    icon: Shield,
  },
];

const trainerNavigation = [
  {
    name: "Тренерский кабинет",
    href: "/dashboard",
    icon: Dumbbell,
  },
];

export default function AccountNavigation() {
  const pathname = usePathname();
  const { user, isAdmin, isTrainer, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname?.startsWith(item.href);
  };

  return (
    <nav className="space-y-1">
      {/* Основная навигация */}
      {navigation.map((item) => {
        const active = isActive(item);
        return (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              active
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--panel)]"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors",
                active ? "text-emerald-400" : "text-[color:var(--muted)] group-hover:text-[color:var(--text)]"
              )}
            />
            <span className="font-medium">{item.name}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />}
          </a>
        );
      })}

      {/* Навигация для тренера */}
      {isTrainer && trainerNavigation.map((item) => {
        const active = isActive(item);
        return (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              active
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--panel)]"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors",
                active ? "text-cyan-400" : "text-[color:var(--muted)] group-hover:text-[color:var(--text)]"
              )}
            />
            <span className="font-medium">{item.name}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-cyan-400" />}
          </a>
        );
      })}

      {/* Навигация для админа */}
      {isAdmin && adminNavigation.map((item) => {
        const active = isActive(item);
        return (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              active
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--panel)]"
            )}
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors",
                active ? "text-purple-400" : "text-[color:var(--muted)] group-hover:text-[color:var(--text)]"
              )}
            />
            <span className="font-medium">{item.name}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-purple-400" />}
          </a>
        );
      })}

      {/* Разделитель */}
      <div className="pt-4 mt-4 border-t border-[color:var(--stroke)]">
        {/* Информация о пользователе */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[color:var(--text)] truncate">
                {user?.name || "Пользователь"}
              </p>
              <p className="text-xs text-[color:var(--muted)] truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </nav>
  );
}
