// src/components/auth/RequireAuth.jsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }) {
  const { isAuthed, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthed) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`);
    }
  }, [loading, isAuthed, router, pathname]);

  if (loading) return <div style={{ padding: 16 }}>Загрузка профиля…</div>;
  if (!isAuthed) return <div style={{ padding: 16 }}>Переадресация на вход…</div>;

  return children;
}
