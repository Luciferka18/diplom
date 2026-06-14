"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/services/api";

const TYPE_OPTIONS = [
  { value: "site", label: "Зал НашФит", endpoint: null, apiType: "site" },
  { value: "trainer", label: "Тренер", endpoint: "/trainers", apiType: "App\\Models\\Trainer" },
  { value: "program", label: "Программа", endpoint: "/programs", apiType: "App\\Models\\Program" },
];

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function ReviewForm({ compact = false, title = "Оставить отзыв", onSuccess }) {
  const [type, setType] = useState("site");
  const [items, setItems] = useState([]);
  const [reviewableId, setReviewableId] = useState("1");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const selectedType = useMemo(() => TYPE_OPTIONS.find((item) => item.value === type) ?? TYPE_OPTIONS[0], [type]);

  useEffect(() => {
    let alive = true;

    async function loadItems() {
      setError("");
      setOk("");
      setItems([]);

      if (!selectedType.endpoint) {
        setReviewableId("1");
        return;
      }

      setLoadingItems(true);
      setReviewableId("");

      try {
        const data = await apiGet(selectedType.endpoint);
        const arr = normalizeList(data);
        if (!alive) return;
        setItems(arr);
        if (arr.length > 0) setReviewableId(String(arr[0].id));
      } catch (e) {
        if (!alive) return;
        setError(e?.data?.message || e?.message || "Не удалось загрузить список для отзыва");
      } finally {
        if (alive) setLoadingItems(false);
      }
    }

    loadItems();
    return () => {
      alive = false;
    };
  }, [selectedType]);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setOk("");

    if (selectedType.endpoint && !reviewableId) return setError("Выбери объект отзыва.");
    if (!text.trim() || text.trim().length < 10) return setError("Напиши текст отзыва минимум на 10 символов.");

    setLoading(true);
    try {
      await apiPost("/reviews", {
        reviewable_type: selectedType.apiType,
        reviewable_id: selectedType.endpoint ? Number(reviewableId) : 1,
        rating: Number(rating),
        text: text.trim(),
      });

      setOk("Отзыв отправлен ✅");
      setText("");
      setRating(5);
      onSuccess?.();
    } catch (e) {
      const msg = e?.data?.errors
        ? Object.values(e.data.errors).flat().join(" ")
        : e?.data?.message || e?.message || "Ошибка отправки";
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
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {selectedType.endpoint ? (
            <div className="form__field">
              <label className="label">Выбор</label>
              <select className="input" value={reviewableId} onChange={(e) => setReviewableId(e.target.value)} disabled={loadingItems}>
                {items.length === 0 ? (
                  <option value="">{loadingItems ? "Загрузка..." : "Нет данных"}</option>
                ) : (
                  items.map((item) => (
                    <option key={item.id} value={String(item.id)}>{item.name || item.title || `ID ${item.id}`}</option>
                  ))
                )}
              </select>
            </div>
          ) : null}
        </div>

        <div className="form__field">
          <label className="label">Оценка</label>
          <select className="input" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="form__field">
          <label className="label">Текст</label>
          <textarea className="input input--textarea" rows={compact ? 3 : 5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Напиши свой опыт, что понравилось/не понравилось…" />
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {ok ? <div className="alert alert--ok">{ok}</div> : null}

        <button className="btn" type="submit" disabled={loading}>{loading ? "Отправка..." : "Отправить"}</button>
      </form>
    </div>
  );
}
