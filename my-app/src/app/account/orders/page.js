"use client";

import { useEffect, useState } from "react";

export default function AccountOrdersPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const r = await fetch("/api/orders", { cache: "no-store" });
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
      <div className="h2">Мои заказы</div>

      {loading ? <div className="muted">Загрузка…</div> : null}
      {err ? <div className="error">{err}</div> : null}

      {!loading && !err && items.length === 0 ? (
        <div className="muted">Пока нет заказов.</div>
      ) : null}

      <div className="list">
        {items.map((o) => (
          <div key={o.id} className="listItem">
            <div><b>ID:</b> {o.id}</div>
            <div><b>Статус:</b> {o.status ?? "—"}</div>
            <div><b>Сумма:</b> {o.total ?? o.sum ?? "—"}</div>
            <div><b>Создан:</b> {o.created_at ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
