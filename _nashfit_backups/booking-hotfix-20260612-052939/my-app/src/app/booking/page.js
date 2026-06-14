"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import { CalendarDays, Clock3, Dumbbell, MapPin, TicketPercent, UserRound, Check, ArrowRight, Loader2 } from "lucide-react";

const money = (v = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(v || 0) / 100);
const today = () => new Date().toISOString().slice(0, 10);
const errorText = (e) => e?.data?.message || e?.message || "Произошла ошибка.";

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthed } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({
    trainer_id: searchParams.get("trainer") || "",
    trainer_service_id: searchParams.get("service") || "",
    date: "", time: "", location_id: "",
    client_name: "", client_phone: "", client_comment: "", promo_code: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await apiGet("/trainers");
        const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        if (!cancelled) {
          setTrainers(list);
          setForm((prev) => ({ ...prev, client_name: prev.client_name || user?.name || "", client_phone: prev.client_phone || user?.phone || "" }));
        }
      } catch (e) { if (!cancelled) setStatus({ type: "error", message: errorText(e) }); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (!form.trainer_id) { setServices([]); return; }
    let cancelled = false;
    setServicesLoading(true);
    apiGet(`/trainers/${form.trainer_id}/services`).then((response) => {
      if (cancelled) return;
      const list = response?.data || [];
      setServices(list);
      setForm((prev) => ({ ...prev, trainer_service_id: list.some((x) => String(x.id) === String(prev.trainer_service_id)) ? prev.trainer_service_id : (list[0]?.id ? String(list[0].id) : ""), time: "", location_id: "" }));
    }).catch((e) => !cancelled && setStatus({ type: "error", message: errorText(e) })).finally(() => !cancelled && setServicesLoading(false));
    return () => { cancelled = true; };
  }, [form.trainer_id]);

  useEffect(() => {
    if (!form.trainer_id || !form.trainer_service_id || !form.date) { setSlots([]); return; }
    let cancelled = false;
    setSlotsLoading(true); setStatus(null);
    apiGet(`/trainers/${form.trainer_id}/available-slots?date=${form.date}&service_id=${form.trainer_service_id}`).then((response) => {
      if (cancelled) return;
      const list = response?.slots || [];
      setSlots(list);
      if (form.time && !list.some((x) => x.time === form.time)) setForm((prev) => ({ ...prev, time: "", location_id: "" }));
    }).catch((e) => !cancelled && setStatus({ type: "error", message: errorText(e) })).finally(() => !cancelled && setSlotsLoading(false));
    return () => { cancelled = true; };
  }, [form.trainer_id, form.trainer_service_id, form.date]);

  const trainer = useMemo(() => trainers.find((x) => String(x.id) === String(form.trainer_id)), [trainers, form.trainer_id]);
  const service = useMemo(() => services.find((x) => String(x.id) === String(form.trainer_service_id)), [services, form.trainer_service_id]);
  const slot = useMemo(() => slots.find((x) => x.time === form.time), [slots, form.time]);

  function change(key, value) {
    setForm((prev) => ({ ...prev, [key]: value, ...(["trainer_id", "trainer_service_id", "date"].includes(key) ? { time: "", location_id: "" } : {}) }));
  }

  async function submit(event) {
    event.preventDefault(); setStatus(null);
    if (!isAuthed) return setStatus({ type: "error", message: "Чтобы записаться, войдите в аккаунт." });
    if (!form.trainer_id || !form.trainer_service_id || !form.date || !form.time) return setStatus({ type: "error", message: "Выберите тренера, услугу, дату и свободное время." });
    setBusy(true);
    try {
      const response = await apiPost("/bookings", {
        trainer_id: Number(form.trainer_id), trainer_service_id: Number(form.trainer_service_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        client_name: form.client_name.trim(), client_phone: form.client_phone.trim(), client_comment: form.client_comment.trim() || null,
        date: form.date, time: form.time, promo_code: form.promo_code.trim() || null,
      });
      const created = response?.booking || response?.data;
      setBooking(created);
      if (created?.payment?.status === "pending") setPayment(created.payment);
      else { setStatus({ type: "success", message: "Запись создана. Открываем личный кабинет…" }); setTimeout(() => router.push("/account/bookings"), 600); }
    } catch (e) { setStatus({ type: "error", message: errorText(e) }); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg)] py-10">
      <div className="container-fitlab max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300"><Dumbbell className="h-4 w-4" /> Офлайн-тренировки</span>
              <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">Тренировка, которая учитывает именно вашу цель</h1>
              <p className="mt-4 max-w-2xl leading-7 text-white/60">Выберите формат занятия, тренера и удобный слот. Стоимость и длительность видны заранее, а запись появится в профиле.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><UserRound className="h-5 w-5 text-cyan-300" /><div className="mt-3 font-bold text-white">Личный тренер</div><div className="mt-1 text-xs text-white/50">Подбор под вашу цель</div></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><CalendarDays className="h-5 w-5 text-emerald-300" /><div className="mt-3 font-bold text-white">Живое расписание</div><div className="mt-1 text-xs text-white/50">Только свободные слоты</div></div>
            </div>
          </div>
        </section>

        {!isAuthed ? <div className="mt-6 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100">Для записи нужно <Link href="/login?next=/booking" className="font-bold underline">войти в аккаунт</Link>.</div> : null}

        <form onSubmit={submit} className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">1</span><div><h2 className="font-bold text-[color:var(--text)]">Выберите тренера</h2><p className="text-sm text-[color:var(--muted)]">Специалист и формат занятия</p></div></div>
              <select value={form.trainer_id} onChange={(e) => change("trainer_id", e.target.value)} disabled={loading} className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" required>
                <option value="">Выберите тренера</option>{trainers.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.specialization || "персональный тренер"}</option>)}
              </select>
              {trainer ? <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">{trainer.photo_url ? <img src={trainer.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><UserRound /></div>}<div><div className="font-bold text-[color:var(--text)]">{trainer.name}</div><div className="text-sm text-[color:var(--muted)]">{trainer.specialization}</div></div></div> : null}

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {servicesLoading ? <div className="col-span-full flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем услуги…</div> : services.map((x) => {
                  const active = String(form.trainer_service_id) === String(x.id);
                  return <button key={x.id} type="button" onClick={() => change("trainer_service_id", String(x.id))} className={`relative rounded-2xl border p-4 text-left transition ${active ? "border-emerald-400 bg-emerald-400/10" : "border-[color:var(--stroke)] bg-[color:var(--bg)] hover:border-emerald-400/40"}`}>
                    {active ? <Check className="absolute right-4 top-4 h-5 w-5 text-emerald-400" /> : null}
                    {x.badge ? <span className="mb-2 inline-block rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-bold uppercase text-cyan-300">{x.badge}</span> : null}
                    <div className="pr-7 font-bold text-[color:var(--text)]">{x.name}</div><p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{x.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-[color:var(--muted)]"><Clock3 className="h-4 w-4" /> {x.duration_minutes} мин</span><b className="text-emerald-400">{x.price ? money(x.price) : "Бесплатно"}</b></div>
                  </button>;
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">2</span><div><h2 className="font-bold text-[color:var(--text)]">Дата и время</h2><p className="text-sm text-[color:var(--muted)]">Показываем только доступные окна</p></div></div>
              <input type="date" min={today()} value={form.date} onChange={(e) => change("date", e.target.value)} className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" required />
              {form.date && form.trainer_service_id ? <div className="mt-5">{slotsLoading ? <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Ищем свободное время…</div> : slots.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{slots.map((x) => <button key={`${x.schedule_id}-${x.time}`} type="button" onClick={() => setForm((prev) => ({ ...prev, time: x.time, location_id: x.location_id ? String(x.location_id) : "" }))} className={`rounded-xl border px-3 py-3 text-sm font-bold ${form.time === x.time ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--text)]"}`}>{x.time}</button>)}</div> : <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">На выбранную дату свободных слотов нет.</div>}</div> : <p className="mt-4 text-sm text-[color:var(--muted)]">Сначала выберите тренера, услугу и дату.</p>}
            </section>

            <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">3</span><div><h2 className="font-bold text-[color:var(--text)]">Контактные данные</h2><p className="text-sm text-[color:var(--muted)]">Тренер увидит цель и ваши пожелания</p></div></div>
              <div className="grid gap-4 md:grid-cols-2"><input value={form.client_name} onChange={(e) => change("client_name", e.target.value)} placeholder="Имя" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" required /><input value={form.client_phone} onChange={(e) => change("client_phone", e.target.value)} placeholder="Телефон" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" required /></div>
              <textarea value={form.client_comment} onChange={(e) => change("client_comment", e.target.value)} placeholder="Цель тренировок, ограничения, пожелания…" className="mt-4 min-h-28 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" />
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-[color:var(--text)]">Ваша запись</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3"><UserRound className="h-5 w-5 shrink-0 text-cyan-400" /><div><div className="text-[color:var(--muted)]">Тренер</div><div className="font-bold text-[color:var(--text)]">{trainer?.name || "Не выбран"}</div></div></div>
              <div className="flex gap-3"><Dumbbell className="h-5 w-5 shrink-0 text-emerald-400" /><div><div className="text-[color:var(--muted)]">Услуга</div><div className="font-bold text-[color:var(--text)]">{service?.name || "Не выбрана"}</div></div></div>
              <div className="flex gap-3"><CalendarDays className="h-5 w-5 shrink-0 text-violet-400" /><div><div className="text-[color:var(--muted)]">Когда</div><div className="font-bold text-[color:var(--text)]">{form.date && form.time ? `${new Date(`${form.date}T00:00:00`).toLocaleDateString("ru-RU")} в ${form.time}` : "Не выбрано"}</div></div></div>
              {slot?.location_name ? <div className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-orange-400" /><div><div className="text-[color:var(--muted)]">Локация</div><div className="font-bold text-[color:var(--text)]">{slot.location_name}</div></div></div> : null}
            </div>
            <div className="my-5 border-t border-[color:var(--stroke)]" />
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]"><TicketPercent className="h-4 w-4" /> Промокод</label>
            <input value={form.promo_code} onChange={(e) => change("promo_code", e.target.value.toUpperCase())} placeholder="START10" className="mt-2 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-bold uppercase text-[color:var(--text)] outline-none focus:border-emerald-400" />
            <div className="mt-5 flex items-end justify-between"><div className="text-sm text-[color:var(--muted)]">Стоимость</div><div className="text-2xl font-black text-[color:var(--text)]">{service ? (service.price ? money(service.price) : "Бесплатно") : "—"}</div></div>
            {status ? <div className={`mt-4 rounded-xl border p-3 text-sm ${status.type === "success" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-red-400/25 bg-red-400/10 text-red-200"}`}>{status.message}</div> : null}
            <button disabled={!isAuthed || busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-50">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}{busy ? "Создаём запись…" : service?.price ? "Перейти к оплате" : "Записаться бесплатно"}</button>
            <p className="mt-3 text-center text-xs text-[color:var(--muted)]">Оплата пока работает в демонстрационном режиме.</p>
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
