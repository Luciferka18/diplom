"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";

export default function AccountReviewsPage() {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      await apiPost("/reviews", {
        rating: Number(rating),
        text,
        // ✅ отзыв “о платформе FitLab”
        reviewable_type: "site",
        reviewable_id: 1,
      });

      setText("");
      setRating(5);
      setStatus("Спасибо! Отзыв отправлен ✅");
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.message ||
        (typeof err?.data === "string" ? err.data : "Ошибка отправки");
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Отзывы</h2>

      <form onSubmit={submit} className="mt-4">
        <label className="block mb-2">Оценка:</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="input"
        >
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <label className="block mt-4 mb-2">Текст:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea"
          rows={4}
          placeholder="Напиши отзыв..."
        />

        {status ? (
          <div className="alert mt-4" style={{ color: status.includes("✅") ? "#bfffd1" : "#ffb4b4" }}>
            {status}
          </div>
        ) : null}

        <button className="btn mt-4" disabled={loading || !text.trim()}>
          {loading ? "Отправка..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}
