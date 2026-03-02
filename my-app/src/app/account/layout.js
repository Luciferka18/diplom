"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // ждём гидрацию/загрузку user из localStorage
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="app-container" style={{ padding: 40 }}>
        <div className="card">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    // пока редиректится
    return (
      <div className="app-container" style={{ padding: 40 }}>
        <div className="card">Перенаправление на вход...</div>
      </div>
    );
  }

  return children;
}
