"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  if (loading) return <div style={{ padding: 16 }}>Загрузка…</div>;
  if (!isAuthed) return <div style={{ padding: 16 }}>Переадресация…</div>;

  return children;
}
