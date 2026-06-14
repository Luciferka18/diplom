"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Loader2,
  MapPin,
  Phone,
  TicketPercent,
  UserRound,
} from "lucide-react";

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const money = (v = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(v || 0) / 100);
const pad = (value) => String(value).padStart(2, "0");
const dateKey = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
const monthKey = ({ year, month }) => `${year}-${pad(month + 1)}`;
const parseDate = (value) => value ? new Date(`${value}T12:00:00`) : new Date();

function errorText(error) {
  const errors = error?.data?.errors;
  if (errors && typeof errors === "object") {
    const messages = Object.values(errors).flat().filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  if (error?.data?.message && error.data.message !== "Validation failed") return error.data.message;
  return error?.message || "Произошла ошибка.";
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthed } = useAuth();
  const initialDate = searchParams.get("date") || "";
  const initialCursor = parseDate(initialDate);

  const [trainers, setTrainers] = useState([]);
  const [services, setServices] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [cursor, setCursor] = useState({ year: initialCursor.getFullYear(), month: initialCursor.getMonth() });
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [daysLoading, setDaysLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({
    trainer_id: searchParams.get("trainer") || searchParams.get("trainerId") || "",
    trainer_service_id: searchParams.get("service") || searchParams.get("serviceId") || "",
    date: initialDate,
    time: searchParams.get("time") || "",
    location_id: searchParams.get("locationId") || "",
    client_name: "",
    client_phone: "",
    client_comment: "",
    promo_code: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await apiGet("/trainers");
        const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        if (!cancelled) {
          setTrainers(list);
          setForm((prev) => ({
            ...prev,
            client_name: prev.client_name || user?.name || "",
            client_phone: prev.client_phone || user?.phone || "",
          }));
        }
      } catch (error) {
        if (!cancelled) setStatus({ type: "error", message: errorText(error) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (!form.trainer_id) {
      setServices([]);
      return;
    }
    let cancelled = false;
    setServicesLoading(true);
    apiGet(`/trainers/${form.trainer_id}/services`)
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response?.data) ? response.data : [];
        setServices(list);
        setForm((prev) => ({
          ...prev,
          trainer_service_id: list.some((item) => String(item.id) === String(prev.trainer_service_id))
            ? prev.trainer_service_id
            : (list[0]?.id ? String(list[0].id) : ""),
        }));
      })
      .catch((error) => !cancelled && setStatus({ type: "error", message: errorText(error) }))
      .finally(() => !cancelled && setServicesLoading(false));
    return () => { cancelled = true; };
  }, [form.trainer_id]);

  useEffect(() => {
    if (!form.trainer_id || !form.trainer_service_id) {
      setAvailableDays([]);
      return;
    }
    let cancelled = false;
    setDaysLoading(true);
    apiGet(`/trainers/${form.trainer_id}/available-days?month=${monthKey(cursor)}&service_id=${form.trainer_service_id}`)
      .then((response) => {
        if (cancelled) return;
        const days = Array.isArray(response?.days) ? response.days : [];
        setAvailableDays(days);
        if (form.date?.startsWith(monthKey(cursor)) && !days.some((item) => item.date === form.date)) {
          setForm((prev) => ({ ...prev, date: "", time: "", location_id: "" }));
        }
      })
      .catch((error) => !cancelled && setStatus({ type: "error", message: errorText(error) }))
      .finally(() => !cancelled && setDaysLoading(false));
    return () => { cancelled = true; };
  }, [form.trainer_id, form.trainer_service_id, cursor.year, cursor.month]);

  useEffect(() => {
    if (!form.trainer_id || !form.trainer_service_id || !form.date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setStatus(null);
    apiGet(`/trainers/${form.trainer_id}/available-slots?date=${form.date}&service_id=${form.trainer_service_id}`)
      .then((response) => {
        if (cancelled) return;
        const list = Array.isArray(response?.slots) ? response.slots : [];
        setSlots(list);
        if (form.time && !list.some((item) => item.time === form.time)) {
          setForm((prev) => ({ ...prev, time: "", location_id: "" }));
        }
      })
      .catch((error) => !cancelled && setStatus({ type: "error", message: errorText(error) }))
      .finally(() => !cancelled && setSlotsLoading(false));
    return () => { cancelled = true; };
  }, [form.trainer_id, form.trainer_service_id, form.date]);

  const trainer = useMemo(() => trainers.find((item) => String(item.id) === String(form.trainer_id)), [trainers, form.trainer_id]);
  const service = useMemo(() => services.find((item) => String(item.id) === String(form.trainer_service_id)), [services, form.trainer_service_id]);
  const slot = useMemo(() => slots.find((item) => item.time === form.time), [slots, form.time]);
  const availableMap = useMemo(() => new Map(availableDays.map((item) => [item.date, item])), [availableDays]);

  function change(key, value) {
    setStatus(null);
    setForm((prev) => {
      if (key === "trainer_id") {
        return { ...prev, trainer_id: value, trainer_service_id: "", date: "", time: "", location_id: "" };
      }
      if (key === "trainer_service_id") {
        return { ...prev, trainer_service_id: value, date: "", time: "", location_id: "" };
      }
      if (key === "date") {
        return { ...prev, date: value, time: "", location_id: "" };
      }
      return { ...prev, [key]: value };
    });
  }

  function moveMonth(direction) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + direction, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setForm((prev) => ({ ...prev, date: "", time: "", location_id: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus(null);
    if (!isAuthed) return setStatus({ type: "error", message: "Чтобы записаться, войдите в аккаунт." });
    if (!form.trainer_id || !form.trainer_service_id || !form.date || !form.time) {
      return setStatus({ type: "error", message: "Выберите тренера, услугу, свободный день и время." });
    }
    if (!form.client_name.trim() || !form.client_phone.trim()) {
      return setStatus({ type: "error", message: "Укажите имя и телефон для связи с тренером." });
    }

    setBusy(true);
    try {
      const response = await apiPost("/bookings", {
        trainer_id: Number(form.trainer_id),
        trainer_service_id: Number(form.trainer_service_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim(),
        client_comment: form.client_comment.trim() || null,
        date: form.date,
        time: form.time,
        promo_code: form.promo_code.trim() || null,
      });
      const created = response?.booking || response?.data;
      setBooking(created);
      if (created?.payment?.status === "pending") {
        setPayment(created.payment);
      } else {
        setStatus({ type: "success", message: "Запись создана. Открываем личный кабинет…" });
        setTimeout(() => router.push("/account/bookings"), 600);
      }
    } catch (error) {
      setStatus({ type: "error", message: errorText(error) });
    } finally {
      setBusy(false);
    }
  }

  const now = new Date();
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const calendarCells = [];
  for (let index = 0; index < firstWeekday; index += 1) calendarCells.push(<div key={`empty-${index}`} />);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(cursor.year, cursor.month, day);
    const availability = availableMap.get(key);
    const active = form.date === key;
    const disabled = !availability;
    calendarCells.push(
      <button
        key={key}
        type="button"
        disabled={disabled}
        onClick={() => change("date", key)}
        className={`relative min-h-12 rounded-xl border text-sm font-bold transition ${active
          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--on-accent)]"
          : availability
            ? "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]"
            : "border-transparent text-[color:var(--muted)] opacity-35"}`}
        title={availability ? `${availability.slots_count} свободных слотов` : "Свободного времени нет"}
      >
        {day}
        {availability && !active ? <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[color:var(--accent)]" /> : null}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] py-10">
      <div className="container-fitlab max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-[color:var(--secondary-border)] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--secondary-soft)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[color:var(--secondary)]"><Dumbbell className="h-4 w-4" /> Офлайн-тренировки</span>
              <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">Тренировка, которая учитывает именно вашу цель</h1>
              <p className="mt-4 max-w-2xl leading-7 text-white/60">Выберите формат, свободный день и время. Выбор слота ничего не оформляет — запись создастся только после нажатия отдельной кнопки.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UserRound className="h-5 w-5 text-[color:var(--secondary)]" /><div className="mt-3 font-bold text-white">Личный тренер</div><div className="mt-1 text-xs text-white/50">Подбор под вашу цель</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="h-5 w-5 text-[color:var(--accent)]" /><div className="mt-3 font-bold text-white">Свободные дни</div><div className="mt-1 text-xs text-white/50">Календарь обновляется автоматически</div></div>
            </div>
          </div>
        </section>

        {!isAuthed ? <div className="mt-6 rounded-2xl border border-yellow-400/25 bg-[color:var(--warning-soft)] p-4 text-sm text-yellow-100">Для записи нужно <Link href="/login?next=/booking" className="font-bold underline">войти в аккаунт</Link>.</div> : null}

        <form onSubmit={submit} className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] font-black text-[color:var(--on-accent)]">1</span><div><h2 className="font-bold text-[color:var(--text)]">Тренер и формат</h2><p className="text-sm text-[color:var(--muted)]">Выберите специалиста и тип занятия</p></div></div>
              <select value={form.trainer_id} onChange={(event) => change("trainer_id", event.target.value)} disabled={loading} className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" required>
                <option value="">Выберите тренера</option>
                {trainers.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.specialization || "персональный тренер"}</option>)}
              </select>
              {trainer ? <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">{trainer.photo_url ? <img src={trainer.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--secondary-soft)] text-[color:var(--secondary)]"><UserRound /></div>}<div><div className="font-bold text-[color:var(--text)]">{trainer.name}</div><div className="text-sm text-[color:var(--muted)]">{trainer.specialization}</div></div></div> : null}

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {servicesLoading ? <div className="col-span-full flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем услуги…</div> : services.map((item) => {
                  const active = String(form.trainer_service_id) === String(item.id);
                  return <button key={item.id} type="button" onClick={() => change("trainer_service_id", String(item.id))} className={`relative rounded-2xl border p-4 text-left transition ${active ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--stroke)] bg-[color:var(--bg)] hover:border-[color:var(--accent-border)]"}`}>
                    {active ? <Check className="absolute right-4 top-4 h-5 w-5 text-[color:var(--accent)]" /> : null}
                    {item.badge ? <span className="mb-2 inline-block rounded-full bg-[color:var(--secondary-soft)] px-2 py-1 text-[10px] font-bold uppercase text-[color:var(--secondary)]">{item.badge}</span> : null}
                    <div className="pr-7 font-bold text-[color:var(--text)]">{item.name}</div>
                    <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-[color:var(--muted)]"><Clock3 className="h-4 w-4" /> {item.duration_minutes} мин</span><b className="text-[color:var(--accent)]">{item.price ? money(item.price) : "Бесплатно"}</b></div>
                  </button>;
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] font-black text-[color:var(--on-accent)]">2</span><div><h2 className="font-bold text-[color:var(--text)]">Свободный день и время</h2><p className="text-sm text-[color:var(--muted)]">Активны только дни, в которые у тренера остались места</p></div></div>

              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" onClick={() => moveMonth(-1)} disabled={isCurrentMonth} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--text)] disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
                  <div className="font-black text-[color:var(--text)]">{MONTHS[cursor.month]} {cursor.year}</div>
                  <button type="button" onClick={() => moveMonth(1)} className="rounded-xl border border-[color:var(--stroke)] p-2 text-[color:var(--text)]"><ChevronRight className="h-5 w-5" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1">{WEEKDAYS.map((item) => <div key={item} className="py-2 text-center text-xs font-bold text-[color:var(--muted)]">{item}</div>)}</div>
                {daysLoading ? <div className="flex h-64 items-center justify-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-5 w-5 animate-spin" /> Загружаем календарь…</div> : form.trainer_id && form.trainer_service_id ? <div className="grid grid-cols-7 gap-1">{calendarCells}</div> : <div className="flex h-40 items-center justify-center text-center text-sm text-[color:var(--muted)]">Сначала выберите тренера и услугу.</div>}
                <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--muted)]"><span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" /> Зелёные дни доступны для записи</div>
              </div>

              {form.date ? <div className="mt-5">{slotsLoading ? <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Ищем свободное время…</div> : slots.length ? <><div className="mb-3 text-sm font-bold text-[color:var(--text)]">Выберите время на {new Date(`${form.date}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</div><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map((item) => <button key={`${item.schedule_id}-${item.time}`} type="button" onClick={() => setForm((prev) => ({ ...prev, time: item.time, location_id: item.location_id ? String(item.location_id) : "" }))} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${form.time === item.time ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--on-accent)]" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)] hover:border-[color:var(--accent)]"}`}>{item.time}</button>)}</div><p className="mt-3 text-xs text-[color:var(--muted)]">Выбор времени пока ничего не оформляет. Проверьте данные справа и нажмите кнопку записи.</p></> : <div className="rounded-xl border border-yellow-400/20 bg-[color:var(--warning-soft)] p-4 text-sm text-yellow-100">На выбранную дату свободных слотов больше нет.</div>}</div> : null}
            </section>

            <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] font-black text-[color:var(--on-accent)]">3</span><div><h2 className="font-bold text-[color:var(--text)]">Контактные данные</h2><p className="text-sm text-[color:var(--muted)]">Тренер увидит цель и ваши пожелания</p></div></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Имя</label><input value={form.client_name} onChange={(event) => change("client_name", event.target.value)} placeholder="Как к вам обращаться" className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" required /></div>
                <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">Телефон</label><div className="relative"><Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" /><input value={form.client_phone} onChange={(event) => change("client_phone", event.target.value)} placeholder="+7 999 000-00-00" className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] py-3 pl-11 pr-4 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" required /></div></div>
              </div>
              <textarea value={form.client_comment} onChange={(event) => change("client_comment", event.target.value)} placeholder="Цель тренировок, ограничения, пожелания…" className="mt-4 min-h-28 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" />
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-[color:var(--text)]">Ваша запись</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3"><UserRound className="h-5 w-5 shrink-0 text-[color:var(--secondary)]" /><div><div className="text-[color:var(--muted)]">Тренер</div><div className="font-bold text-[color:var(--text)]">{trainer?.name || "Не выбран"}</div></div></div>
              <div className="flex gap-3"><Dumbbell className="h-5 w-5 shrink-0 text-[color:var(--accent)]" /><div><div className="text-[color:var(--muted)]">Услуга</div><div className="font-bold text-[color:var(--text)]">{service?.name || "Не выбрана"}</div></div></div>
              <div className="flex gap-3"><CalendarDays className="h-5 w-5 shrink-0 text-[color:var(--warm)]" /><div><div className="text-[color:var(--muted)]">Когда</div><div className="font-bold text-[color:var(--text)]">{form.date && form.time ? `${new Date(`${form.date}T12:00:00`).toLocaleDateString("ru-RU")} в ${form.time}` : "Не выбрано"}</div></div></div>
              {slot?.location_name ? <div className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-orange-400" /><div><div className="text-[color:var(--muted)]">Локация</div><div className="font-bold text-[color:var(--text)]">{slot.location_name}</div></div></div> : null}
            </div>
            <div className="my-5 border-t border-[color:var(--stroke)]" />
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]"><TicketPercent className="h-4 w-4" /> Промокод</label>
            <input value={form.promo_code} onChange={(event) => change("promo_code", event.target.value.toUpperCase())} placeholder="START10" className="mt-2 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-bold uppercase text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]" />
            <div className="mt-5 flex items-end justify-between"><div className="text-sm text-[color:var(--muted)]">Стоимость</div><div className="text-2xl font-black text-[color:var(--text)]">{service ? (service.price ? money(service.price) : "Бесплатно") : "—"}</div></div>
            {status ? <div className={`mt-4 rounded-xl border p-3 text-sm ${status.type === "success" ? "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]" : "border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"}`}>{status.message}</div> : null}
            <button type="submit" disabled={!isAuthed || busy || !form.time} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-[color:var(--on-accent)] hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}{busy ? "Создаём запись…" : service?.price ? "Записаться и перейти к оплате" : "Записаться бесплатно"}</button>
            <p className="mt-3 text-center text-xs text-[color:var(--muted)]">Запись создаётся только после нажатия этой кнопки.</p>
          </aside>
        </form>
      </div>

      {payment ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-2xl items-center py-8"><div className="w-full"><MockPaymentPanel payment={payment} title={`${booking?.service?.name || "Тренировка"} с ${booking?.trainer?.name || "тренером"}`} onCancel={() => setPayment(null)} onSuccess={() => router.push("/account/bookings")} /></div></div></div> : null}
    </main>
  );
}

export default function BookingPage() {
  return <Suspense fallback={<div className="container-fitlab py-16 text-[color:var(--muted)]">Загрузка записи…</div>}><BookingPageContent /></Suspense>;
}
