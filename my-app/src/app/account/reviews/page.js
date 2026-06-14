"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/services/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Star, Send, AlertCircle, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";

function normalizeList(response, key) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.[key])) return response[key];
  return [];
}

function getErrorMessage(error, fallback = "Ошибка") {
  if (error?.data?.errors) {
    const firstKey = Object.keys(error.data.errors)[0];
    const firstValue = error.data.errors[firstKey];
    return Array.isArray(firstValue) ? firstValue[0] || fallback : String(firstValue || fallback);
  }
  return error?.data?.message || error?.message || fallback;
}

function StarsView({ value = 0, size = "md" }) {
  const sizeClass = size === "lg" ? "w-7 h-7" : "w-4 h-4";
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${sizeClass} ${star <= safeValue ? "fill-yellow-400 text-[color:var(--warning)]" : "text-[color:var(--stroke)]"}`} />
      ))}
    </div>
  );
}

function InteractiveStars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110" aria-label={`${star} из 5`}>
          <Star className={`w-8 h-8 ${star <= (hover || value) ? "fill-yellow-400 text-[color:var(--warning)]" : "text-[color:var(--stroke)]"}`} />
        </button>
      ))}
    </div>
  );
}

const REVIEW_TYPES = [
  { value: "site", label: "Зал НашФит", endpoint: null, apiType: "site" },
  { value: "trainer", label: "Тренер", endpoint: "/trainers", apiType: "App\\Models\\Trainer" },
  { value: "program", label: "Программа", endpoint: "/programs", apiType: "App\\Models\\Program" },
];

export default function AccountReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [type, setType] = useState("site");
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [reviewableId, setReviewableId] = useState("1");

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedType = useMemo(() => REVIEW_TYPES.find((item) => item.value === type) ?? REVIEW_TYPES[0], [type]);

  async function loadReviews() {
    setReviewsLoading(true);
    setError("");
    try {
      const data = await apiGet("/account/reviews");
      setReviews(normalizeList(data, "reviews"));
    } catch (error) {
      setError(getErrorMessage(error, "Ошибка загрузки отзывов"));
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTargets() {
      setError("");
      setItems([]);

      if (!selectedType.endpoint) {
        setReviewableId("1");
        return;
      }

      setItemsLoading(true);
      setReviewableId("");

      try {
        const data = await apiGet(selectedType.endpoint);
        const list = normalizeList(data, selectedType.value === "trainer" ? "trainers" : "programs");
        const normalized = list.map((item) => ({ id: item.id, label: item.name ?? item.title ?? `#${item.id}` })).filter((item) => item.id);
        if (!cancelled) {
          setItems(normalized);
          setReviewableId(normalized[0] ? String(normalized[0].id) : "");
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error, "Не удалось загрузить список для отзыва"));
          setItems([]);
          setReviewableId("");
        }
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    }

    loadTargets();
    return () => {
      cancelled = true;
    };
  }, [selectedType]);

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!text.trim() || text.trim().length < 10) return false;
    if (selectedType.endpoint && !reviewableId) return false;
    return true;
  }, [submitting, text, selectedType, reviewableId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!canSubmit) {
      setError("Заполни текст отзыва минимум на 10 символов и выбери объект отзыва.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/reviews", {
        rating: Number(rating),
        text: text.trim(),
        reviewable_type: selectedType.apiType,
        reviewable_id: selectedType.endpoint ? Number(reviewableId) : 1,
      });

      setText("");
      setRating(5);
      setSuccessMessage("Отзыв успешно отправлен!");
      setTimeout(() => setSuccessMessage(""), 3000);
      await loadReviews();
    } catch (error) {
      setError(getErrorMessage(error, "Ошибка отправки отзыва"));
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">Мои отзывы</h1>
        <p className="text-[color:var(--muted)] mt-1">Оставьте отзыв о зале, тренере или программе и смотрите свои отзывы</p>
      </div>

      {successMessage ? <Card hover={false} className="p-4 bg-[color:var(--accent-soft)] border-[color:var(--accent-border)]"><div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[color:var(--accent)] flex-shrink-0" /><p className="text-[color:var(--accent)]">{successMessage}</p></div></Card> : null}
      {error ? <Card hover={false} className="p-4 bg-[color:var(--danger-soft)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))]"><div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-[color:var(--danger)] flex-shrink-0" /><p className="text-[color:var(--danger)]">{error}</p></div></Card> : null}

      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-[color:var(--accent)]" /><h2 className="text-lg font-semibold text-[color:var(--text)]">Написать отзыв</h2></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Кому/чему отзыв</label>
            <select value={type} onChange={(event) => setType(event.target.value)} className="h-12 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" disabled={submitting}>
              {REVIEW_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {selectedType.endpoint ? (
            <div>
              <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Выбор</label>
              <select value={reviewableId} onChange={(event) => setReviewableId(event.target.value)} className="h-12 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" disabled={submitting || itemsLoading}>
                {itemsLoading ? <option value="">Загрузка...</option> : items.length === 0 ? <option value="">Нет данных</option> : items.map((item) => <option key={item.id} value={String(item.id)}>{item.label}</option>)}
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Ваша оценка</label>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Текст отзыва</label>
            <textarea value={text} onChange={(event) => setText(event.target.value)} className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)] min-h-[120px] resize-y" placeholder="Расскажите о своём опыте..." disabled={submitting} />
            <p className="text-xs text-[color:var(--muted)] mt-1">Минимум 10 символов</p>
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
            {submitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Отправка...</span> : <span className="flex items-center gap-2"><Send className="w-4 h-4" />Отправить отзыв</span>}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-[color:var(--text)] mb-4">Ваши отзывы</h2>
        {reviewsLoading ? <Card hover={false} className="p-8 text-center"><div className="flex items-center justify-center gap-3 text-[color:var(--muted)]"><Loader2 className="w-5 h-5 animate-spin" />Загрузка отзывов...</div></Card> : null}

        {!reviewsLoading && reviews.length === 0 ? (
          <Card hover={false} className="p-8 text-center"><MessageSquare className="w-12 h-12 mx-auto text-[color:var(--muted)] mb-4" /><h3 className="text-lg font-semibold text-[color:var(--text)] mb-2">Пока нет отзывов</h3><p className="text-[color:var(--muted)]">Вы ещё не оставляли отзывы</p></Card>
        ) : null}

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} hover={false} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <StarsView value={review.rating} />
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
                    <span>{formatDate(review.created_at)}</span>
                    <span>•</span>
                    <span>{review.target_label || "Объект отзыва"}</span>
                  </div>
                </div>
                <Badge className={review.status === "approved" ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)] border-[color:var(--accent-border)]" : "bg-yellow-500/20 text-[color:var(--warning)] border-yellow-500/30"}>{review.status === "approved" ? "Опубликован" : "На модерации"}</Badge>
              </div>
              <p className="text-[color:var(--text)] whitespace-pre-wrap">{review.text}</p>
              {review.response ? <div className="mt-4 p-4 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]"><p className="text-sm font-medium text-[color:var(--accent)] mb-1">Ответ администрации:</p><p className="text-[color:var(--text)]">{review.response}</p></div> : null}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
