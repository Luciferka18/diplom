"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import AccountNavigation from "@/components/account/AccountNavigation";
import { Loader2 } from "lucide-react";

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthed } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthed) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`);
    }
  }, [loading, isAuthed, router, pathname]);

  if (loading) {
    return (
      <Container className="py-16 min-h-[60vh] flex items-center justify-center">
        <Card hover={false} className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
          <p className="mt-4 text-[color:var(--muted)]">Загрузка...</p>
        </Card>
      </Container>
    );
  }

  if (!isAuthed) {
    return (
      <Container className="py-16 min-h-[60vh] flex items-center justify-center">
        <Card hover={false} className="p-8 text-center">
          <p className="text-[color:var(--muted)]">Перенаправление на вход...</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Боковая панель */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-8">
            <Card hover={false} className="p-4">
              <AccountNavigation />
            </Card>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </Container>
  );
}
