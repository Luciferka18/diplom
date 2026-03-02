"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/services/api";

// ВАЖНО: если бэкенд ждёт НЕ "trainer/program/product", а например
// "App\\Models\\Trainer" — просто поменяй значения ниже.
const TYPE_OPTIONS = [
  { value: "trainer", label: "Тренер" },
  { value: "program", label: "Программа" },
  { value: "product", label: "Товар" },
];

export default function ReviewForm({ compact = false, title = "Оставить отзыв" }) {
  const [type, setType] = useState("trainer");
  const [items, setItems] = useState([]);
  const [reviewableId, setReviewableId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const endpoint = useMemo(() => {
    if (type === "trainer") return "/trainers";
    if (type === "program") return "/programs";
    return "/products";
  }, [type]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoadingItems(true);
      setError("");
      setOk("");
      setItems([]);
      setReviewableId("");

      try {
        const data = await apiGet(endpoint);
        // ожидаем массив
        const arr = Array.isArray(data) ? data : (data?.data ?? []);
        if (!alive) return;
        setItems(arr);

        // автоселект первого
        if (arr.length > 0) setReviewableId(String(arr[0].id));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Не удалось загрузить список для отзыва");
      } finally {
        if (alive) setLoadingItems(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [endpoint]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");

    // лёгкая валидация на фронте
    if (!reviewableId) return setError("Выбери объект (тренера/программу/товар).");
    if (!comment.trim()) return setError("Напиши текст отзыва.");

    setLoading(true);
    try {
      await apiPost("/reviews", {
        reviewable_type: type,
        reviewable_id: Number(reviewableId),
        rating: Number(rating),
        comment: comment.trim(),
      });

      setOk("Отзыв отправлен ✅");
      setComment("");
      setRating(5);
    } catch (e) {
      // бэкенд часто возвращает { message, errors }
      const msg =
        e?.errors
          ? Object.entries(e.errors)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
              .join(" | ")
          : e?.message || "Ошибка отправки";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`card ${compact ? "card--compact" : ""}`}>
      <div className="card__title">{title}</div>

      <form onSubmit={onSubmit} className="form">
        <div className="form__row">
          <div className="form__field">
            <label className="label">Кому/чему отзыв</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form__field">
            <label className="label">Выбор</label>
            <select
              className="input"
              value={reviewableId}
              onChange={(e) => setReviewableId(e.target.value)}
              disabled={loadingItems}
            >
              {items.length === 0 ? (
                <option value="">{loadingItems ? "Загрузка..." : "Нет данных"}</option>
              ) : (
                items.map((it) => (
                  <option key={it.id} value={String(it.id)}>
                    {it.name || it.title || `ID ${it.id}`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="form__row">
          <div className="form__field">
            <label className="label">Оценка</label>
            <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form__field">
          <label className="label">Текст</label>
          <textarea
            className="input input--textarea"
            rows={compact ? 3 : 5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напиши свой опыт, что понравилось/не понравилось…"
          />
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {ok ? <div className="alert alert--ok">{ok}</div> : null}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}
