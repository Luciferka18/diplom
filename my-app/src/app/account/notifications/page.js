"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { apiGet, apiPatch } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";


function normalizeNotificationType(type) {
  return String(type || "").replace(/^admin\./, "");
}

function notificationKey(item) {
  const data = item?.data || {};
  const paymentId = data.payment_id || data.paymentId;
  const orderId = data.order_id || data.orderId;
  if (paymentId || orderId) {
    return `${normalizeNotificationType(item.type)}:${paymentId ? `payment-${paymentId}` : `order-${orderId}`}:${item.title || ""}`;
  }
  return `${item?.type || ""}:${item?.title || ""}:${item?.body || ""}:${item?.action_url || ""}`;
}

function uniqueNotifications(list) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).filter((item) => {
    const key = notificationKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await apiGet("/account/notifications?per_page=50");
      setItems(uniqueNotifications(response?.data || []));
      setUnread(Number(response?.unread_count || 0));
    } catch (e) {
      setError(e?.message || "Не удалось загрузить уведомления.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markRead(item) {
    if (item.is_read) return;
    try {
      const response = await apiPatch(`/account/notifications/${item.id}/read`, {});
      setItems((prev) => prev.map((n) => n.id === item.id ? response.data : n));
      setUnread(Number(response?.unread_count || 0));
    } catch {}
  }

  async function markAll() {
    try {
      await apiPatch("/account/notifications/read-all", {});
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnread(0);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[color:var(--accent)]">Центр событий</p>
          <h1 className="mt-1 text-2xl font-black text-[color:var(--text)] md:text-3xl">Уведомления</h1>
          <p className="mt-1 text-[color:var(--muted)]">Заказы, записи, статьи, абонементы и важные изменения аккаунта.</p>
        </div>
        <Button variant="outline" onClick={markAll} disabled={!unread}>
          <CheckCheck className="h-4 w-4" /> Прочитать всё
        </Button>
      </div>

      <Card hover={false} className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]"><Bell className="h-5 w-5" /></div>
          <div>
            <div className="text-2xl font-black text-[color:var(--text)]">{unread}</div>
            <div className="text-sm text-[color:var(--muted)]">непрочитанных уведомлений</div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card hover={false} className="flex items-center gap-2 p-6 text-[color:var(--muted)]"><Loader2 className="h-5 w-5 animate-spin" /> Загружаем уведомления…</Card>
      ) : error ? (
        <Card hover={false} className="border-red-500/25 bg-red-500/10 p-5 text-red-500 dark:text-red-300">{error}</Card>
      ) : items.length === 0 ? (
        <Card hover={false} className="p-10 text-center text-[color:var(--muted)]">Пока уведомлений нет.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const body = (
              <Card hover className={cn("p-5", !item.is_read && "border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5")}>
                <div className="flex gap-4">
                  <span className={cn("mt-2 h-3 w-3 shrink-0 rounded-full", item.is_read ? "bg-[color:var(--stroke)]" : "bg-[color:var(--accent)]")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="font-black text-[color:var(--text)]">{item.title}</h2>
                      <span className="text-xs text-[color:var(--muted2)]">{dateTime(item.created_at)}</span>
                    </div>
                    {item.body ? <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.body}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
                      <span className="rounded-full bg-[color:var(--bg)] px-2 py-1">{item.is_read ? "Прочитано" : "Новое"}</span>
                      {item.action_url ? <span>Нажмите, чтобы открыть связанный раздел</span> : null}
                    </div>
                  </div>
                </div>
              </Card>
            );
            return item.action_url ? <Link key={item.id} href={item.action_url} onClick={() => markRead(item)}>{body}</Link> : <button key={item.id} onClick={() => markRead(item)} className="block w-full text-left">{body}</button>;
          })}
        </div>
      )}
    </div>
  );
}
