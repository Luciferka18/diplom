"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAdmin({ children }) {
  const { isAuthed, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthed) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
      return;
    }

    if (!isAdmin) {
      router.replace("/account");
    }
  }, [loading, isAuthed, isAdmin, router, pathname]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-[color:var(--muted)]">Проверяем доступ…</div>;
  }

  if (!isAuthed || !isAdmin) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-[color:var(--muted)]">Переадресация…</div>;
  }

  return children;
}
