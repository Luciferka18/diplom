"use client";

import { useEffect, useState } from "react";

export default function AdminTrainersPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/trainers", { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) setErr(data?.message || `Ошибка (${r.status})`);
      else setItems(Array.isArray(data) ? data : (data.data ?? []));
    })();
  }, []);

  return (
    <div className="card">
      <div className="h2">Тренеры</div>
      <div className="muted">CRUD для trainers в API пока нет (в routes/api.php отсутствуют POST/PUT/DELETE).</div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}

      <div className="list" style={{ marginTop: 10 }}>
        {items.map((t) => (
          <div key={t.id} className="listItem">
            <b>{t.name ?? `Тренер #${t.id}`}</b>
            <div className="muted">ID: {t.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
