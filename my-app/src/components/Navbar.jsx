"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    location.href = "/login";
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-[#2D6033]">
          FitLab
        </Link>

        <nav className="flex gap-6 items-center text-sm font-medium text-gray-600">
          <Link href="/trainers" className="hover:text-[#2D6033]">Тренеры</Link>
          <Link href="/programs" className="hover:text-[#2D6033]">Программы</Link>
          <Link href="/shop" className="hover:text-[#2D6033]">Магазин</Link>

          {user ? (
            <>
              <span className="text-gray-400 text-sm">{user.name}</span>
              <button
                onClick={logout}
                className="bg-[#2D6033] text-white px-4 py-1.5 rounded-lg hover:opacity-90"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#2D6033] text-white px-4 py-1.5 rounded-lg hover:opacity-90"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
