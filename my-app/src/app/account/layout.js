"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`);
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <Container className="py-10">
        <Card hover={false}>Загрузка...</Card>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-10">
        <Card hover={false}>Перенаправление на вход...</Card>
      </Container>
    );
  }

  return <Container className="py-10">{children}</Container>;
}
