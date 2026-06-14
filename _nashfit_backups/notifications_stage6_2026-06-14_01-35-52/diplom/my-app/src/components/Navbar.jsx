"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Dumbbell,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const mainNavigation = [
  { href: "/trainers", label: "Тренеры" },
  { href: "/programs", label: "Программы" },
  { href: "/articles", label: "Журнал" },
  { href: "/memberships", label: "Абонементы" },
  { href: "/shop", label: "Магазин" },
];

function Brand({ compact = false }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="НашФит — на главную">
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-sm)] transition group-hover:-rotate-3 group-hover:scale-[1.03]">
        <Dumbbell size={19} strokeWidth={2.4} />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-[1.08rem] font-black tracking-[-0.055em] text-[color:var(--text)]">НашФит</span>
          <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.19em] text-[color:var(--muted)] sm:block">городской фитнес-клуб</span>
        </span>
      ) : null}
    </Link>
  );
}

function ThemeButton({ theme, onClick }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] shadow-[var(--shadow-xs)] transition hover:border-[color:var(--stroke-strong)] hover:bg-[color:var(--panel-2)]"
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthed, isAdmin, isTrainer } = useAuth();
  const { totalCount } = useCart();

  const isAdminArea = pathname?.startsWith("/admin");
  const items = useMemo(() => mainNavigation, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  if (isAdminArea) {
    return (
      <header className="sticky top-0 z-50 border-b border-[color:var(--stroke)] bg-[color:color-mix(in_srgb,var(--panel)_90%,transparent)] backdrop-blur-xl">
        <Container size="wide" className="flex h-[68px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Brand />
            <span className="hidden h-7 w-px bg-[color:var(--stroke)] sm:block" />
            <span className="truncate text-sm font-bold text-[color:var(--muted)]">Панель управления</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[color:var(--muted)] transition hover:bg-[color:var(--panel-2)] hover:text-[color:var(--text)] sm:inline-flex">
              На сайт <ArrowUpRight size={15} />
            </Link>
            <ThemeButton theme={theme} onClick={toggleTheme} />
          </div>
        </Container>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[color:var(--stroke)] bg-[color:color-mix(in_srgb,var(--panel)_88%,transparent)] backdrop-blur-2xl">
        <Container size="wide" className="flex h-[76px] items-center justify-between gap-4">
          <Brand />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2.5 text-sm font-bold transition",
                  active(item.href)
                    ? "bg-[color:var(--text)] text-[color:var(--bg)]"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--panel-2)] hover:text-[color:var(--text)]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeButton theme={theme} onClick={toggleTheme} />

            <Link
              href="/cart"
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] shadow-[var(--shadow-xs)] transition hover:border-[color:var(--stroke-strong)] hover:bg-[color:var(--panel-2)]",
                active("/cart") && "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
              )}
              aria-label={`Корзина, товаров: ${totalCount}`}
            >
              <ShoppingBag size={17} />
              {totalCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[color:var(--warm)] px-1 text-[10px] font-black leading-none text-white ring-2 ring-[color:var(--panel)]">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              ) : null}
            </Link>

            <Link
              href={isAuthed ? "/account" : "/login"}
              className="hidden h-10 items-center gap-2 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 text-sm font-bold text-[color:var(--text)] shadow-[var(--shadow-xs)] transition hover:border-[color:var(--stroke-strong)] hover:bg-[color:var(--panel-2)] sm:inline-flex"
            >
              <UserRound size={16} />
              <span className="max-w-28 truncate">{isAuthed ? user?.name?.split(" ")?.[0] || "Кабинет" : "Войти"}</span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] shadow-[var(--shadow-xs)] transition hover:bg-[color:var(--panel-2)] lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu size={19} />
            </button>
          </div>
        </Container>
      </header>

      <div className={cn("fixed inset-0 z-[80] lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <button
          type="button"
          className={cn("absolute inset-0 bg-[color:var(--overlay)] backdrop-blur-sm transition-opacity", open ? "opacity-100" : "opacity-0")}
          onClick={() => setOpen(false)}
          aria-label="Закрыть меню"
        />
        <aside
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(92vw,430px)] flex-col border-l border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow-lg)] transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-[color:var(--stroke)] pb-5">
            <Brand />
            <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--panel-2)] text-[color:var(--text)]" aria-label="Закрыть меню">
              <X size={18} />
            </button>
          </div>

          <nav className="mt-5 grid gap-1" aria-label="Мобильная навигация">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-[16px] px-4 py-3.5 text-base font-bold transition",
                  active(item.href) ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)]" : "text-[color:var(--text)] hover:bg-[color:var(--panel-2)]"
                )}
              >
                {item.label}
                <ChevronRight size={17} className="text-[color:var(--muted2)]" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto grid gap-2 border-t border-[color:var(--stroke)] pt-5">
            {isTrainer ? <Link href="/trainer/profile" className="rounded-[16px] bg-[color:var(--secondary-soft)] px-4 py-3 font-bold text-[color:var(--secondary)]">Кабинет тренера</Link> : null}
            {isAdmin ? <Link href="/admin" className="rounded-[16px] bg-[color:var(--warm-soft)] px-4 py-3 font-bold text-[color:var(--warm)]">Админ-панель</Link> : null}
            <Link href={isAuthed ? "/account" : "/login"} className="flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-3 font-bold text-[color:var(--on-accent)]">
              <UserRound size={17} /> {isAuthed ? "Личный кабинет" : "Войти в аккаунт"}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
