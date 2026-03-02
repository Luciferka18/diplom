"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1020]/70 backdrop-blur-xl">
        <Container className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="font-extrabold tracking-tight text-white text-lg">
            Fit<span className="text-emerald-400">Lab</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5" aria-label="Primary navigation">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white",
                  isActive(it.href) && "bg-white/15 text-white"
                )}
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </Container>
      </header>

      <div className={cn("fixed inset-0 z-[60] md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}> 
        <button className={cn("absolute inset-0 bg-black/50 transition", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} aria-label="Close" />
        <div className={cn("absolute right-0 top-0 h-full w-[86vw] max-w-sm border-l border-white/10 bg-[#0b1020]/95 p-5 backdrop-blur-xl transition", open ? "translate-x-0" : "translate-x-full")}>
          <div className="mb-4 flex items-center justify-between">
            <div className="font-bold text-white">Меню</div>
            <button className="rounded-lg border border-white/20 p-2 text-white" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="grid gap-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={cn("rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/85", isActive(it.href) && "bg-white/15 text-white")}
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
