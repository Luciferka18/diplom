"use client";

import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function AccountPage() {
  const { user, role, isAdmin, logout } = useAuth();

  return (
    <Card hover={false} className="p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-white/65 text-sm">Данные аккаунта</div>
          <div className="text-2xl font-bold mt-1">{user?.name || "Пользователь"}</div>
          <div className="text-white/70 mt-1">{user?.email || ""}</div>
          <div className="text-white/70 mt-1">Роль: {String(role || "user")}</div>
          {isAdmin ? <Badge className="mt-3">Admin</Badge> : null}
        </div>

        <Button variant="outline" onClick={logout}>Выйти</Button>
      </div>

      {isAdmin ? (
        <div className="mt-6">
          <Button as="a" href="/admin" variant="primary">Перейти в админку</Button>
        </div>
      ) : null}
    </Card>
  );
}
