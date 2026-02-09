"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../services/api";

export default function BookingPage({ searchParams }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    trainer_id: "",
    client_name: "",
    client_phone: "",
    client_comment: "",
    date: "",
    time: "",
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    apiGet("/trainers")
      .then((data) => {
        setTrainers(data);
        const fromQuery = searchParams?.trainerId;
        if (fromQuery && data.some((t) => String(t.id) === String(fromQuery))) {
          setForm((prev) => ({ ...prev, trainer_id: String(fromQuery) }));
        }
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await apiPost("/bookings", form);
      setStatus({ type: "success", message: "Заявка на тренировку отправлена!" });
      setForm((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        client_comment: "",
        date: "",
        time: "",
      }));
    } catch (error) {
      setStatus({
        type: "error",
        message: "Не удалось отправить заявку. Попробуй ещё раз.",
      });
    }
  };

  return (
    <div className="py-14">
      <div className="container-fitlab max-w-3xl">
        <span className="badge mb-3">Запись в зал</span>
        <h1 className="section-title">Онлайн-запись на тренировку</h1>
        <p className="section-subtitle mb-6">
          Выбери тренера, дату и время. Мы свяжемся с тобой, чтобы подтвердить
          запись и детали абонемента.
        </p>

        <form onSubmit={handleSubmit} className="card space-y-3 text-sm">
          <div>
            <label className="block text-xs mb-1">Тренер</label>
            <select
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
              value={form.trainer_id}
              onChange={handleChange("trainer_id")}
              disabled={loading}
              required
            >
              <option value="">Выбери тренера</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs mb-1">Имя</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={form.client_name}
                onChange={handleChange("client_name")}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Телефон</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={form.client_phone}
                onChange={handleChange("client_phone")}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs mb-1">Дата</label>
              <input
                type="date"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={form.date}
                onChange={handleChange("date")}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Время</label>
              <input
                type="time"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={form.time}
                onChange={handleChange("time")}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1">Комментарий</label>
            <textarea
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] min-h-[80px]"
              placeholder="Цель тренировок, удобное время, особенности здоровья..."
              value={form.client_comment}
              onChange={handleChange("client_comment")}
            />
          </div>
          <button type="submit" className="btn-primary w-full text-sm">
            Отправить заявку
          </button>
          {status && (
            <p
              className={`text-xs ${
                status.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}


