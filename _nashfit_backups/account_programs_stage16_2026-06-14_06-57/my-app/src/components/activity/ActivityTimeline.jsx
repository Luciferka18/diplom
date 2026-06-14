"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, Loader2 } from "lucide-react";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityTimeline({ admin = false, limit = 8, title = "Последняя активность", description = "Свежие события в вашем аккаунте" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await apiGet(`${admin ? "/admin/activity" : "/account/activity"}?limit=${limit}`);
        if (!cancelled) setItems(response?.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Не удалось загрузить активность.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [admin, limit]);

  return (
    <Card hover={false} className="p-5 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-[color:var(--accent)]"><Activity className="h-4 w-4" /> {title}</div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
        </div>
        {!admin ? <Link href="/account/notifications" className="text-sm font-bold text-[color:var(--accent)]">Все уведомления →</Link> : null}
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем события…</div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 dark:text-red-300">{error}</div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-center text-sm text-[color:var(--muted)]">Событий пока нет. Они появятся после заказов, записей, оплаты и прогресса.</div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const content = (
              <div className="flex gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 transition hover:border-[color:var(--accent)]/35">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-bold text-[color:var(--text)]">{item.title}</div>
                    <div className="text-xs text-[color:var(--muted2)]">{formatDate(item.created_at)}</div>
                  </div>
                  {item.body ? <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{item.body}</p> : null}
                </div>
                {item.action_url ? <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[color:var(--muted)]" /> : null}
              </div>
            );
            return item.action_url ? <Link key={item.id} href={item.action_url}>{content}</Link> : <div key={item.id}>{content}</div>;
          })}
        </div>
      )}
    </Card>
  );
}
