"use client";

import { useEffect, useState } from "react";

export default function AccountBookingsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const r = await fetch("/api/bookings", { cache: "no-store" });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || `Ошибка (${r.status})`);

        const list = Array.isArray(data) ? data : (data.data ?? []);
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Ошибка");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card">
      <div className="h2">Мои записи</div>

      {loading ? <div className="muted">Загрузка…</div> : null}
      {err ? <div className="error">{err}</div> : null}

      {!loading && !err && items.length === 0 ? (
        <div className="muted">Пока нет записей.</div>
      ) : null}

      <div className="list">
        {items.map((b) => (
          <div key={b.id} className="listItem">
            <div><b>ID:</b> {b.id}</div>
            <div><b>Дата:</b> {b.date ?? b.starts_at ?? "—"}</div>
            <div><b>Статус:</b> {b.status ?? "—"}</div>
            <div><b>Тренер/программа:</b> {b.trainer?.name ?? b.program?.title ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
