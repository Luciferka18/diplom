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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-[color:var(--muted)]">Загрузка профиля...</div>
      </div>
    );
  }
  
  if (!isAuthed) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-[color:var(--muted)]">Переадресация на вход...</div>
      </div>
    );
  }

  return children;
}
