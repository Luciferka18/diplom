"use client";

import { useState } from "react";
import { apiPost } from "../services/api";

export function ReviewForm() {
  const [form, setForm] = useState({
    user_name: "",
    rating: 5,
    comment: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await apiPost("/reviews", {
        ...form,
        rating: Number(form.rating),
      });
      setStatus({
        type: "success",
        message: "Спасибо за отзыв!",
      });
      setForm({ user_name: "", rating: 5, comment: "" });
    } catch {
      setStatus({
        type: "error",
        message: "Не удалось отправить отзыв. Попробуй ещё раз.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-3 text-xs">
      <h3 className="font-semibold text-sm">Оставить отзыв</h3>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div>
          <label className="block mb-1">Имя</label>
          <input
            type="text"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]"
            value={form.user_name}
            onChange={handleChange("user_name")}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Оценка</label>
          <select
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)]"
            value={form.rating}
            onChange={handleChange("rating")}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block mb-1">Комментарий</label>
        <textarea
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-[var(--color-primary)] min-h-[60px]"
          value={form.comment}
          onChange={handleChange("comment")}
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full text-xs">
        Отправить отзыв
      </button>
      {status && (
        <p
          className={`text-[11px] ${
            status.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}


