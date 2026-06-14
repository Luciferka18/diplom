"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Dumbbell,
  ClipboardList,
  Package,
  ShoppingCart,
  CalendarDays,
  MessageSquareText,
  Newspaper,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ActivityTimeline from "@/components/activity/ActivityTimeline";

const sections = [
  { key: "users", label: "Пользователи", href: "/admin/users", icon: Users },
  { key: "trainers", label: "Тренеры", href: "/admin/trainers", icon: Dumbbell },
  { key: "programs", label: "Программы", href: "/admin/programs", icon: ClipboardList },
  { key: "products", label: "Товары", href: "/admin/products", icon: Package },
  { key: "orders", label: "Заказы", href: "/admin/orders", icon: ShoppingCart },
  { key: "bookings", label: "Записи", href: "/admin/bookings", icon: CalendarDays },
  { key: "reviews", label: "Отзывы", href: "/admin/reviews", icon: MessageSquareText },
  { key: "articles", label: "Статьи", href: "/admin/articles", icon: Newspaper },
];

function totalFrom(response) {
  if (Array.isArray(response)) return response.length;
  return Number(response?.total ?? response?.meta?.total ?? response?.data?.length ?? 0);
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    const requests = sections.map(async (section) => {
      if (section.key === "users") {
        const stats = await apiGet("/admin/users/stats");
        return [section.key, Number(stats?.total ?? 0)];
      }

      const response = await apiGet(`/admin/${section.key}?per_page=1`);
      return [section.key, totalFrom(response)];
    });

    const results = await Promise.allSettled(requests);
    const nextCounts = {};
    let failed = 0;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const [key, value] = result.value;
        nextCounts[key] = value;
      } else {
        failed += 1;
      }
    });

    setCounts(nextCounts);
    if (failed === results.length) setError("Не удалось получить статистику. Проверьте Laravel API.");
    else if (failed > 0) setError(`Часть статистики недоступна (${failed} раздела).`);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">НашФит</p>
          <h1 className="mt-1 text-2xl font-bold text-[color:var(--text)] md:text-3xl">Обзор проекта</h1>
          <p className="mt-1 text-[color:var(--muted)]">Управление контентом, клиентами, заказами и записями</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {error && (
        <Card hover={false} className="border-amber-500/30 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-300">
          {error}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.key} href={section.href}>
              <Card className="group h-full p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[color:var(--muted)] transition group-hover:text-[color:var(--accent)]" />
                </div>
                <div className="mt-5 text-3xl font-bold text-[color:var(--text)]">
                  {loading && counts[section.key] === undefined ? "…" : counts[section.key] ?? "—"}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">{section.label}</div>
              </Card>
            </Link>
          );
        })}
      </div>

      <ActivityTimeline admin title="События сегодня" description="Новые заказы, записи, оплаты и решения модерации" />

      <Card hover={false} className="p-6">
        <h2 className="text-lg font-bold text-[color:var(--text)]">Быстрые действия</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button as={Link} href="/admin/products"><Package className="h-4 w-4" />Добавить товар</Button>
          <Button as={Link} href="/account/articles/new" variant="outline"><Newspaper className="h-4 w-4" />Создать статью</Button>
          <Button as={Link} href="/admin/bookings" variant="outline"><CalendarDays className="h-4 w-4" />Проверить записи</Button>
          <Button as={Link} href="/admin/orders" variant="outline"><ShoppingCart className="h-4 w-4" />Проверить заказы</Button>
        </div>
      </Card>
    </div>
  );
}
