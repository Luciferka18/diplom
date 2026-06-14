"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function getErrorMessage(error) {
  if (error?.data?.errors) {
    const firstKey = Object.keys(error.data.errors)[0];
    const firstValue = error.data.errors[firstKey];
    return Array.isArray(firstValue) ? firstValue[0] : String(firstValue || "Ошибка валидации.");
  }

  return error?.data?.message || error?.message || "Не удалось отправить заявку. Попробуй ещё раз.";
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthed } = useAuth();

  const [trainers, setTrainers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [form, setForm] = useState({
    trainer_id: "",
    client_name: "",
    client_phone: "",
    client_comment: "",
    date: "",
    time: "",
    location_id: "",
    duration_minutes: 60,
  });

  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => String(trainer.id) === String(form.trainer_id)) || null,
    [trainers, form.trainer_id]
  );

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.time === form.time) || null,
    [slots, form.time]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTrainers() {
      setLoading(true);
      setStatus(null);

      try {
        const response = await apiGet("/trainers");
        const list = normalizeList(response);

        if (cancelled) return;

        setTrainers(list);

        const trainerId = searchParams.get("trainerId") || "";
        const date = searchParams.get("date") || "";
        const time = searchParams.get("time") || "";
        const locationId = searchParams.get("locationId") || "";
        const duration = Number(searchParams.get("duration") || 60);

        setForm((prev) => ({
          ...prev,
          trainer_id: trainerId && list.some((trainer) => String(trainer.id) === String(trainerId)) ? String(trainerId) : prev.trainer_id,
          date: date || prev.date,
          time: time || prev.time,
          location_id: locationId || prev.location_id,
          duration_minutes: duration || prev.duration_minutes || 60,
          client_name: prev.client_name || user?.name || user?.login || "",
          client_phone: prev.client_phone || user?.phone || "",
        }));
      } catch (error) {
        if (!cancelled) {
          setStatus({ type: "error", message: getErrorMessage(error) });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrainers();

    return () => {
      cancelled = true;
    };
  }, [searchParams, user?.login, user?.name, user?.phone]);

  useEffect(() => {
    if (!form.trainer_id || !form.date) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setStatus(null);

      try {
        const response = await apiGet(`/trainers/${form.trainer_id}/available-slots?date=${form.date}`);
        const nextSlots = Array.isArray(response?.slots) ? response.slots : [];

        if (cancelled) return;

        setSlots(nextSlots);

        if (form.time && !nextSlots.some((slot) => slot.time === form.time)) {
          setForm((prev) => ({ ...prev, time: "", location_id: "" }));
        }
      } catch (error) {
        if (!cancelled) {
          setSlots([]);
          setStatus({ type: "error", message: getErrorMessage(error) });
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [form.trainer_id, form.date]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "trainer_id" ? { time: "", location_id: "" } : {}),
      ...(field === "date" ? { time: "", location_id: "" } : {}),
    }));
  };

  const chooseSlot = (slot) => {
    setForm((prev) => ({
      ...prev,
      time: slot.time,
      location_id: slot.location_id ? String(slot.location_id) : "",
      duration_minutes: Number(slot.duration_minutes || prev.duration_minutes || 60),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!isAuthed) {
      setStatus({ type: "error", message: "Чтобы записаться на тренировку, нужно войти в аккаунт." });
      return;
    }

    if (!form.trainer_id || !form.date || !form.time || !form.client_name.trim() || !form.client_phone.trim()) {
      setStatus({ type: "error", message: "Выбери тренера, дату, свободное время, укажи имя и телефон." });
      return;
    }

    try {
      const payload = {
        trainer_id: Number(form.trainer_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim(),
        client_comment: form.client_comment.trim() || null,
        date: form.date,
        time: form.time,
        duration_minutes: Number(form.duration_minutes || selectedSlot?.duration_minutes || 60),
      };

      await apiPost("/bookings", payload);

      setStatus({ type: "success", message: "Запись создана! Сейчас открою твои бронирования." });

      setTimeout(() => {
        router.push("/account/bookings");
      }, 700);
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    }
  };

  return (
    <div className="py-14">
      <div className="container-fitlab max-w-4xl">
        <span className="badge mb-3">Запись в зал</span>
        <h1 className="section-title">Онлайн-запись на тренировку</h1>
        <p className="section-subtitle mb-6">
          Выбери тренера, дату и свободный слот. Запись сразу появится в твоём личном кабинете.
        </p>

        {!isAuthed ? (
          <div className="card mb-6 border border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-200">
            Для записи нужно войти в аккаунт. <Link href="/login?next=/booking" className="underline">Войти</Link>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="card space-y-5 text-sm">
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
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.name} — {trainer.specialization || "персональный тренер"}
                </option>
              ))}
            </select>
          </div>

          {selectedTrainer?.schedules?.length ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">Расписание тренера</div>
              <div className="grid gap-2 md:grid-cols-2">
                {selectedTrainer.schedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/75">
                    <b className="text-white">{schedule.day_name}</b>: {String(schedule.start_time).slice(0, 5)} — {String(schedule.end_time).slice(0, 5)}
                    {schedule.location_name ? <span className="block text-white/50">{schedule.location_name}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : selectedTrainer ? (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-200">
              У этого тренера пока не заполнено расписание.
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs mb-1">Дата</label>
              <input
                type="date"
                min={todayIso()}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={form.date}
                onChange={handleChange("date")}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Выбранное время</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                value={form.time || "Сначала выбери свободный слот"}
                readOnly
              />
            </div>
          </div>

          {form.trainer_id && form.date ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/60">Свободные слоты</div>
              {slotsLoading ? (
                <p className="text-xs text-white/60">Загрузка слотов...</p>
              ) : slots.length === 0 ? (
                <p className="text-xs text-white/60">На эту дату свободных слотов нет.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.schedule_id}-${slot.time}`}
                      type="button"
                      onClick={() => chooseSlot(slot)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        form.time === slot.time
                          ? "border-emerald-400 bg-emerald-400 text-slate-950"
                          : "border-white/10 bg-white/5 text-white hover:border-emerald-400/60"
                      }`}
                    >
                      {slot.time}
                      {slot.location_name ? <span className="mt-1 block text-[10px] opacity-70">{slot.location_name}</span> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

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

          <div>
            <label className="block text-xs mb-1">Комментарий</label>
            <textarea
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] min-h-[80px]"
              placeholder="Цель тренировок, особенности здоровья, пожелания..."
              value={form.client_comment}
              onChange={handleChange("client_comment")}
            />
          </div>

          {status ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${status.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
              {status.message}
            </div>
          ) : null}

          <button type="submit" className="btn-primary w-full text-sm" disabled={!isAuthed}>
            Записаться на тренировку
          </button>
        </form>
      </div>
    </div>
  );
}


export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container-fitlab py-14 text-[color:var(--muted)]">Загрузка формы записи…</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
