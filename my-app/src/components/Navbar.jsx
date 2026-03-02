"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const items = useMemo(
    () => [
      { href: "/trainers", label: "Тренеры" },
      { href: "/programs", label: "Программы" },
      { href: "/blog", label: "Статьи" },
      { href: "/shop", label: "Магазин" },
      { href: "/cart", label: "Корзина" },
      { href: "/account", label: "Кабинет" },
    ],
    []
  );

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl border-[color:var(--stroke)] bg-[color:var(--panel)]">
        <Container className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="font-extrabold tracking-tight text-[color:var(--text)] text-lg">
            Fit<span className="text-[color:var(--accent)]">Lab</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-1.5" aria-label="Primary navigation">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[color:var(--panel)] hover:text-[color:var(--text)]",
                  isActive(it.href) && "bg-[color:var(--panel)] text-[color:var(--text)]"
                )}
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
              onClick={toggleTheme}
              className="h-10 w-10 p-0"
            >
              <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
            </Button>

            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)]"
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </Container>
      </header>

      <div className={cn("fixed inset-0 z-[60] md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <button className={cn("absolute inset-0 bg-black/50 transition", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} aria-label="Close" />
        <div className={cn("absolute right-0 top-0 h-full w-[86vw] max-w-sm border-l border-[color:var(--stroke)] bg-[color:var(--bg)]/95 p-5 backdrop-blur-xl transition", open ? "translate-x-0" : "translate-x-full")}>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-bold text-[color:var(--text)]">Меню</div>
            <button className="rounded-lg border border-[color:var(--stroke)] p-2 text-[color:var(--text)]" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="grid gap-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 py-3 text-[color:var(--muted)]",
                  isActive(it.href) && "bg-[color:var(--panel)] text-[color:var(--text)]"
                )}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
