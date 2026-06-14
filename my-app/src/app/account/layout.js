"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import AccountNavigation from "@/components/account/AccountNavigation";

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthed } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthed) router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`);
  }, [loading, isAuthed, router, pathname]);

  if (loading || !isAuthed) {
    return (
      <Container className="grid min-h-[65vh] place-items-center py-16">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[color:var(--muted)]">{loading ? "Загружаем кабинет…" : "Перенаправляем на вход…"}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container size="wide" className="py-6 sm:py-8 lg:py-10">
      <div className="grid items-start gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <Card hover={false} className="overflow-hidden p-3 sm:p-4">
            <AccountNavigation />
          </Card>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </Container>
  );
}
