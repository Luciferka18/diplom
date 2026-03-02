"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/services/api";

function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="rev-stars" aria-label={`Рейтинг ${v} из 5`}>
      {"★★★★★".slice(0, v)}
      <span className="rev-stars-dim">{"★★★★★".slice(v)}</span>
    </div>
  );
}

export default function ReviewsSection() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        const data = await apiGet("/reviews?limit=6");
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "Не удалось загрузить отзывы");
      }
    })();
    return () => (alive = false);
  }, []);

  return (
    <section className="rev-section">
      <div className="rev-top">
        <div>
          <h2 className="rev-title">Отзывы</h2>
          <p className="rev-sub">Реальные впечатления пользователей</p>
        </div>
      </div>

      {err ? <div className="rev-error">{err}</div> : null}

      {items.length === 0 && !err ? (
        <div className="rev-empty">Пока нет отзывов.</div>
      ) : (
        <div className="rev-grid">
          {items.map((r) => {
            const name = r.user?.name || r.user?.login || "Пользователь";
            const text = (r.text || "").trim();
            const date = r.created_at
              ? new Date(r.created_at).toLocaleDateString("ru-RU")
              : "";

            return (
              <article key={r.id} className="rev-card">
                <header className="rev-card__head">
                  <div className="rev-card__name" title={name}>
                    {name}
                  </div>
                  <Stars value={r.rating} />
                </header>

                <p className="rev-card__text">{text || "—"}</p>

                <footer className="rev-card__foot">
                  <span className="rev-card__date">{date}</span>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
