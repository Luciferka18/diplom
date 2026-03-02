"use client";

import { useEffect, useState } from "react";

export default function AdminProgramsPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/programs", { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) setErr(data?.message || `Ошибка (${r.status})`);
      else setItems(Array.isArray(data) ? data : (data.data ?? []));
    })();
  }, []);

  return (
    <div className="card">
      <div className="h2">Программы</div>
      <div className="muted">CRUD для programs в API пока нет (в routes/api.php отсутствуют POST/PUT/DELETE).</div>

      {err ? <div className="error" style={{ marginTop: 10 }}>{err}</div> : null}

      <div className="list" style={{ marginTop: 10 }}>
        {items.map((p) => (
          <div key={p.id} className="listItem">
            <b>{p.title ?? p.name ?? `Программа #${p.id}`}</b>
            <div className="muted">ID: {p.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
