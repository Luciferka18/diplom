"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { apiGet, apiPatch } from "@/services/api";
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

function timeAgo(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.round(hours / 24);
  return `${days} дн назад`;
}

export default function NotificationBell({ compact = false }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  async function load({ list = false } = {}) {
    try {
      if (list) setLoading(true);
      const response = list
        ? await apiGet("/account/notifications?per_page=6")
        : await apiGet("/account/notifications/unread-count");
      if (list) {
        setItems(uniqueNotifications(response?.data || []));
        setCount(Number(response?.unread_count || 0));
      } else {
        setCount(Number(response?.count || 0));
      }
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(() => load(), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    load({ list: true });
    const onClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAll() {
    try {
      await apiPatch("/account/notifications/read-all", {});
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() })));
      setCount(0);
    } catch {}
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] transition hover:bg-[color:var(--bg)]",
          compact && "h-9 w-9"
        )}
        aria-label="Уведомления"
      >
        <Bell className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-black text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-[80] w-[min(92vw,390px)] overflow-hidden rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[color:var(--stroke)] p-4">
            <div>
              <div className="font-black text-[color:var(--text)]">Уведомления</div>
              <div className="text-xs text-[color:var(--muted)]">События по заказам, записям и контенту</div>
            </div>
            <button onClick={markAll} className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold text-[color:var(--accent)] hover:bg-[color:var(--bg)]">
              <CheckCheck className="h-4 w-4" /> Всё прочитать
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center gap-2 p-5 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем…</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-sm text-[color:var(--muted)]">Пока уведомлений нет.</div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.action_url || "/account/notifications"}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-2xl p-3 transition hover:bg-[color:var(--bg)]",
                    !item.is_read && "bg-emerald-500/10"
                  )}
                >
                  <div className="flex gap-3">
                    <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", item.is_read ? "bg-[color:var(--stroke)]" : "bg-emerald-500")} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[color:var(--text)]">{item.title}</div>
                      {item.body ? <p className="mt-1 line-clamp-2 text-sm text-[color:var(--muted)]">{item.body}</p> : null}
                      <div className="mt-2 text-xs text-[color:var(--muted2)]">{timeAgo(item.created_at)}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-[color:var(--stroke)] p-3">
            <Link onClick={() => setOpen(false)} href="/account/notifications" className="block rounded-xl bg-[color:var(--bg)] px-4 py-3 text-center text-sm font-bold text-[color:var(--text)] hover:text-[color:var(--accent)]">
              Открыть центр уведомлений
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
