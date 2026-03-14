"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/services/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Star, Send, AlertCircle, CheckCircle2, MessageSquare, Trash2 } from "lucide-react";

export default function AccountReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await apiGet("/reviews");
      const list = Array.isArray(data) ? data : (data.data ?? []);
      setReviews(list);
    } catch (e) {
      setError(e.message || "Ошибка загрузки отзывов");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await apiPost("/reviews", {
        rating: Number(rating),
        text,
        reviewable_type: "site",
        reviewable_id: 1,
      });

      setText("");
      setRating(5);
      setSuccessMessage("Отзыв успешно отправлен!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadReviews();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StarRating = ({ value, size = "md" }) => {
    const sizeClass = size === "lg" ? "w-6 h-6" : "w-4 h-4";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-[color:var(--stroke)]"
            }`}
          />
        ))}
      </div>
    );
  };

  const InteractiveStarRating = ({ value, onChange }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hover || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-[color:var(--stroke)]"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Мои отзывы</h1>
        <p className="text-[color:var(--muted)] mt-1">
          Оставьте отзыв о нашей работе или посмотрите свои предыдущие отзывы
        </p>
      </div>

      {successMessage && (
        <Card hover={false} className="p-4 bg-emerald-500/10 border-emerald-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300">{successMessage}</p>
          </div>
        </Card>
      )}

      {error && (
        <Card hover={false} className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        </Card>
      )}

      {/* Форма отправки отзыва */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Написать отзыв</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
              Ваша оценка:
            </label>
            <InteractiveStarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
              Текст отзыва:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)] min-h-[120px] resize-y"
              placeholder="Расскажите о своём опыте работы с FitLab..."
              disabled={submitting}
            />
            <p className="text-xs text-[color:var(--muted)] mt-1">
              Минимум 10 символов
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting || !text.trim() || text.length < 10}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Отправка...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Отправить отзыв
              </span>
            )}
          </Button>
        </form>
      </Card>

      {/* Список отзывов */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Ваши отзывы</h2>

        {loading && (
          <Card hover={false} className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-[color:var(--muted)]">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Загрузка отзывов...
            </div>
          </Card>
        )}

        {!loading && reviews.length === 0 && (
          <Card hover={false} className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-[color:var(--muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[color:var(--text)] mb-2">
              Пока нет отзывов
            </h3>
            <p className="text-[color:var(--muted)]">
              Будьте первым, кто оставит отзыв о FitLab
            </p>
          </Card>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} hover={false} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <StarRating value={review.rating} />
                  <p className="text-xs text-[color:var(--muted)] mt-2">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <Badge className={review.status === "approved" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}>
                  {review.status === "approved" ? "Опубликован" : "На модерации"}
                </Badge>
              </div>

              <p className="text-[color:var(--text)] whitespace-pre-wrap">
                {review.text}
              </p>

              {review.response && (
                <div className="mt-4 p-4 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
                  <p className="text-sm font-medium text-emerald-400 mb-1">
                    Ответ администрации:
                  </p>
                  <p className="text-[color:var(--text)]">
                    {review.response}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
