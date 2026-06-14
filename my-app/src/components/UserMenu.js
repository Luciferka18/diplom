"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function UserMenu() {
  const { isAuthed, user, logout } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  // Ждём загрузки AuthContext
  useEffect(() => {
    // Небольшая задержка, чтобы убедиться, что AuthContext загрузился
    const timer = setTimeout(() => setLocalLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (localLoading) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="w-20 h-8 rounded-xl bg-[color:var(--stroke)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {isAuthed ? (
        <>
          <a
            href="/account"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] hover:bg-[color:var(--panel-hover)] transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
            Кабинет
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--muted)] hover:text-[color:var(--danger)] hover:border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] transition-colors"
          >
            Выйти
          </button>
        </>
      ) : (
        <>
          <a
            href="/login"
            className="px-3 py-1.5 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] hover:bg-[color:var(--panel-hover)] transition-colors"
          >
            Войти
          </a>
          <a
            href="/register"
            className="px-3 py-1.5 rounded-xl border border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-hover)] transition-colors"
          >
            Регистрация
          </a>
        </>
      )}
    </div>
  );
}
