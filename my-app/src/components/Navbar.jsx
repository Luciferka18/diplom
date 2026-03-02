// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

  // закрывать меню при смене маршрута
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // закрывать по ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header className="nav2">
        <div className="nav2__inner">
          <Link href="/" className="nav2__brand" aria-label="FitLab home">
            <span className="nav2__brandMark" aria-hidden="true">⚡</span>
            <span className="nav2__brandText">FitLab</span>
          </Link>

          <nav className="nav2__menu" aria-label="Primary navigation">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`nav2__link ${isActive(it.href) ? "nav2__link--active" : ""}`}
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className={`nav2__burger ${open ? "nav2__burger--open" : ""}`}
            aria-label="Open menu"
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`nav2__drawer ${open ? "nav2__drawer--open" : ""}`} aria-hidden={open ? "false" : "true"}>
        <div className="nav2__drawerPanel">
          <div className="nav2__drawerHead">
            <div className="nav2__drawerTitle">Меню</div>
            <button type="button" className="nav2__drawerClose" onClick={() => setOpen(false)} aria-label="Close menu">
              ✕
            </button>
          </div>

          <div className="nav2__drawerList">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`nav2__drawerLink ${isActive(it.href) ? "nav2__drawerLink--active" : ""}`}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>

        <button className="nav2__backdrop" aria-label="Close" onClick={() => setOpen(false)} />
      </div>
    </>
  );
}
