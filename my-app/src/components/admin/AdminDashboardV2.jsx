"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  LineChart,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const oldSections = [
  { key: "users", label: "Пользователи", href: "/admin/users" },
  { key: "trainers", label: "Тренеры", href: "/admin/trainers" },
  { key: "programs", label: "Программы", href: "/admin/programs" },
  { key: "products", label: "Товары", href: "/admin/products" },
  { key: "orders", label: "Заказы", href: "/admin/orders" },
  { key: "bookings", label: "Записи", href: "/admin/bookings" },
  { key: "reviews", label: "Отзывы", href: "/admin/reviews" },
  { key: "articles", label: "Статьи", href: "/admin/articles" },
];

const statusLabels = {
  new: "Новый",
  created: "Создан",
  awaiting_payment: "Ожидает оплаты",
  paid: "Оплачен",
  processing: "Собирается",
  shipped: "Отправлен",
  completed: "Завершён",
  cancelled: "Отменён",
  refunded: "Возврат",
  booked: "Записан",
  pending: "Ожидает",
  confirmed: "Подтверждён",
  succeeded: "Успешно",
  failed: "Ошибка",
  draft: "Черновик",
  published: "Опубликована",
  submitted: "На проверке",
  review: "На проверке",
};

function totalFrom(response) {
  if (Array.isArray(response)) return response.length;
  return Number(response?.total ?? response?.meta?.total ?? response?.data?.length ?? 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
}

function formatKopecks(value) {
  const number = Number(value || 0) / 100;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(number);
}

function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function dayLabel(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function statusLabel(value) {
  return statusLabels[value] || value || "—";
}

function StatCard({ icon: Icon, label, value, hint, href }) {
  const body = (
    <Card className="h-full p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        {href ? <span className="text-xs font-semibold text-[color:var(--accent)]">Открыть</span> : null}
      </div>
      <div className="mt-5 text-3xl font-bold text-[color:var(--text)]">{value}</div>
      <div className="mt-1 text-sm font-medium text-[color:var(--text)]">{label}</div>
      {hint ? <div className="mt-1 text-xs text-[color:var(--muted)]">{hint}</div> : null}
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function BarSeries({ title, series, amount = false }) {
  const max = Math.max(1, ...series.map((item) => Number(amount ? item.amount : item.count) || 0));

  return (
    <Card hover={false} className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-[color:var(--text)]">{title}</h3>
        <LineChart className="h-4 w-4 text-[color:var(--muted)]" />
      </div>
      <div className="mt-5 flex h-36 items-end gap-2">
        {series.map((item) => {
          const value = Number(amount ? item.amount : item.count) || 0;
          const height = Math.max(8, Math.round((value / max) * 100));
          return (
            <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="text-[10px] font-semibold text-[color:var(--muted)]">
                {amount ? formatKopecks(value).replace("₽", "") : value}
              </div>
              <div className="flex h-24 w-full items-end rounded-full bg-[color:var(--bg)] p-1">
                <div
                  className="w-full rounded-full bg-[color:var(--accent)]/80"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="truncate text-[10px] text-[color:var(--muted)]">{dayLabel(item.date)}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function StatusList({ title, rows }) {
  return (
    <Card hover={false} className="p-5">
      <h3 className="font-bold text-[color:var(--text)]">{title}</h3>
      <div className="mt-4 space-y-2">
        {rows?.length ? rows.map((row) => (
          <div key={row.status} className="flex items-center justify-between rounded-xl bg-[color:var(--bg)] px-3 py-2">
            <span className="text-sm text-[color:var(--text)]">{statusLabel(row.status)}</span>
            <Badge>{formatNumber(row.total)}</Badge>
          </div>
        )) : <p className="text-sm text-[color:var(--muted)]">Пока нет данных.</p>}
      </div>
    </Card>
  );
}

function RecentList({ title, rows, render }) {
  return (
    <Card hover={false} className="p-5">
      <h3 className="font-bold text-[color:var(--text)]">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows?.length ? rows.map((row) => render(row)) : <p className="text-sm text-[color:var(--muted)]">Пока нет записей.</p>}
      </div>
    </Card>
  );
}

export default function AdminDashboardV2() {
  const [data, setData] = useState(null);
  const [fallbackCounts, setFallbackCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totals = data?.totals || fallbackCounts;
  const charts = data?.charts || { orders: [], bookings: [], users: [] };
  const health = data?.health;

  const mainStats = useMemo(() => [
    { icon: Users, label: "Пользователи", value: formatNumber(totals.users), hint: `Новых сегодня: ${formatNumber(data?.today?.users)}`, href: "/admin/users" },
    { icon: ShoppingCart, label: "Заказы", value: formatNumber(totals.orders), hint: `Сегодня: ${formatKopecks(data?.today?.orders_amount)}`, href: "/admin/orders" },
    { icon: CalendarDays, label: "Записи", value: formatNumber(totals.bookings), hint: `Сегодня по календарю: ${formatNumber(data?.today?.bookings)}`, href: "/admin/bookings" },
    { icon: CreditCard, label: "Оплаты за месяц", value: formatKopecks(data?.month?.payments_amount), hint: `Абонементов: ${formatNumber(data?.month?.memberships)}`, href: "/admin/monetization" },
    { icon: Package, label: "Товары", value: formatNumber(totals.products), hint: `Вариантов: ${formatNumber(totals.product_variants)}`, href: "/admin/products" },
    { icon: Dumbbell, label: "Программы", value: formatNumber(totals.programs), hint: `Тренировок: ${formatNumber(totals.workouts)}`, href: "/admin/programs" },
    { icon: Sparkles, label: "Отзывы", value: formatNumber(totals.reviews), hint: "Контроль качества", href: "/admin/reviews" },
    { icon: Activity, label: "Уведомления", value: formatNumber(totals.notifications), hint: `Активность: ${formatNumber(totals.activities)}` },
  ], [totals, data]);

  async function loadFallbackCounts() {
    const requests = oldSections.map(async (section) => {
      if (section.key === "users") {
        const stats = await apiGet("/admin/users/stats");
        return [section.key, Number(stats?.total ?? 0)];
      }
      const response = await apiGet(`/admin/${section.key}?per_page=1`);
      return [section.key, totalFrom(response)];
    });

    const results = await Promise.allSettled(requests);
    const next = {};
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const [key, value] = result.value;
        next[key] = value;
      }
    });
    setFallbackCounts(next);
  }

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await apiGet("/admin/dashboard/overview");
      setData(response);
    } catch (err) {
      setData(null);
      setError("Новый API дашборда пока недоступен. Показываю базовую статистику, проверь, что патч применился и Laravel перезапущен.");
      await loadFallbackCounts();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">НашФит / Stage 10</p>
          <h1 className="mt-1 text-2xl font-bold text-[color:var(--text)] md:text-3xl">Живой дашборд проекта</h1>
          <p className="mt-1 text-[color:var(--muted)]">Продажи, записи, пользователи, склад и состояние базы в одном месте.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {error ? (
        <Card hover={false} className="border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
          {error}
        </Card>
      ) : null}

      {health ? (
        <Card
          hover={false}
          className={health.ok ? "border-emerald-500/30 bg-emerald-500/10 p-4" : "border-amber-500/30 bg-amber-500/10 p-4"}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {health.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />}
              <div>
                <div className="font-bold text-[color:var(--text)]">
                  {health.ok ? "Схема базы выглядит нормально" : "Есть проблемы в схеме базы"}
                </div>
                <div className="mt-1 text-sm text-[color:var(--muted)]">
                  {health.ok
                    ? "Критичные таблицы и колонки на месте."
                    : [...(health.missing_tables || []), ...(health.missing_columns || [])].join(", ") || "Проверь nashfit:qa."}
                </div>
              </div>
            </div>
            {!health.ok ? (
              <code className="rounded-xl bg-[color:var(--panel)] px-3 py-2 text-xs text-[color:var(--text)]">php artisan nashfit:qa --fix</code>
            ) : null}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mainStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <BarSeries title="Заказы за 7 дней" series={charts.orders || []} amount />
        <BarSeries title="Записи за 7 дней" series={charts.bookings || []} />
        <BarSeries title="Новые пользователи" series={charts.users || []} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <StatusList title="Статусы заказов" rows={data?.status?.orders || []} />
        <StatusList title="Статусы записей" rows={data?.status?.bookings || []} />
        <StatusList title="Статусы оплат" rows={data?.status?.payments || []} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentList
          title="Последние заказы"
          rows={data?.attention?.latest_orders || []}
          render={(row) => (
            <Link key={row.id} href="/admin/orders" className="block rounded-xl bg-[color:var(--bg)] p-3 hover:bg-[color:var(--accent)]/10">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[color:var(--text)]">Заказ #{row.id}</div>
                <Badge>{statusLabel(row.status)}</Badge>
              </div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">{row.customer_name || "Клиент"} · {formatKopecks(row.total)}</div>
            </Link>
          )}
        />

        <RecentList
          title="Ближайшие / последние записи"
          rows={data?.attention?.latest_bookings || []}
          render={(row) => (
            <Link key={row.id} href="/admin/bookings" className="block rounded-xl bg-[color:var(--bg)] p-3 hover:bg-[color:var(--accent)]/10">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[color:var(--text)]">{row.client_name || `Запись #${row.id}`}</div>
                <Badge>{statusLabel(row.status)}</Badge>
              </div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">{row.trainer_name || "Тренер"} · {dateTime(row.starts_at || row.created_at)}</div>
            </Link>
          )}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentList
          title="Мало остатков на складе"
          rows={data?.attention?.low_stock || []}
          render={(row) => (
            <Link key={row.id} href="/admin/products" className="flex items-center justify-between gap-3 rounded-xl bg-[color:var(--bg)] p-3 hover:bg-[color:var(--accent)]/10">
              <div>
                <div className="font-semibold text-[color:var(--text)]">{row.product_name || row.name || `Вариант #${row.id}`}</div>
                <div className="text-sm text-[color:var(--muted)]">{row.name}</div>
              </div>
              <Badge>{formatNumber(row.stock)} шт.</Badge>
            </Link>
          )}
        />

        <RecentList
          title="Последняя активность"
          rows={data?.attention?.latest_activity || data?.attention?.latest_payments || []}
          render={(row) => (
            <div key={row.id} className="rounded-xl bg-[color:var(--bg)] p-3">
              <div className="font-semibold text-[color:var(--text)]">{row.title || row.type || `Событие #${row.id}`}</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">{row.message || row.body || row.provider || statusLabel(row.status)}</div>
              <div className="mt-2 text-xs text-[color:var(--muted)]">{dateTime(row.created_at || row.paid_at)}</div>
            </div>
          )}
        />
      </div>

      <Card hover={false} className="p-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-[color:var(--accent)]" />
          <h2 className="text-lg font-bold text-[color:var(--text)]">Быстрые действия</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button as={Link} href="/admin/orders"><ShoppingCart className="h-4 w-4" />Заказы</Button>
          <Button as={Link} href="/admin/bookings" variant="outline"><CalendarDays className="h-4 w-4" />Записи</Button>
          <Button as={Link} href="/admin/products" variant="outline"><Package className="h-4 w-4" />Товары</Button>
          <Button as={Link} href="/admin/recommendations" variant="outline"><Sparkles className="h-4 w-4" />Рекомендации</Button>
        </div>
      </Card>
    </div>
  );
}
