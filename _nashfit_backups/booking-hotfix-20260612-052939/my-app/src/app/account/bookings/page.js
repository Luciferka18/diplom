"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/services/api";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle2, CreditCard, Dumbbell } from "lucide-react";

const statusColors = {
  booked: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};
const statusNames = { booked: "Записан", completed: "Завершено", cancelled: "Отменено" };
const money = (v = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(v || 0) / 100);
const list = (r) => Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : Array.isArray(r?.bookings) ? r.bookings : [];

export default function AccountBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState("");
  const [payment, setPayment] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try { setBookings(list(await apiGet("/bookings?per_page=100"))); }
    catch (e) { setError(e?.data?.message || e?.message || "Ошибка загрузки"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm("Отменить запись?")) return;
    setActionLoading(id);
    try {
      const r = await apiPatch(`/bookings/${id}/cancel`, {});
      setBookings((prev) => prev.map((x) => x.id === id ? { ...x, ...(r?.booking || {}), status: "cancelled" } : x));
      setSuccess("Запись отменена"); setTimeout(() => setSuccess(""), 2500);
    } catch (e) { setError(e?.data?.message || e?.message || "Не удалось отменить запись"); }
    finally { setActionLoading(null); }
  }

  const formatDate = (b) => new Date(b.starts_at || b.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const formatTime = (b) => b.time || new Date(b.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black text-[color:var(--text)]">Мои бронирования</h1><p className="mt-1 text-[color:var(--muted)]">Офлайн-тренировки, услуги и оплата.</p></div>
      {success ? <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-200"><CheckCircle2 className="h-5 w-5" />{success}</div> : null}
      {error ? <div className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-red-200"><AlertCircle className="mt-0.5 h-5 w-5" /><div>{error}<button onClick={load} className="ml-2 underline">Повторить</button></div></div> : null}
      {loading ? <div className="h-44 animate-pulse rounded-3xl bg-[color:var(--panel)]" /> : bookings.length === 0 ? <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-8 text-center"><Calendar className="mx-auto h-10 w-10 text-[color:var(--muted)]" /><h2 className="mt-4 text-xl font-bold text-[color:var(--text)]">Пока нет записей</h2><a href="/booking" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">Записаться к тренеру</a></div> : null}

      <div className="space-y-4">
        {bookings.map((b) => (
          <article key={b.id} className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Dumbbell className="h-6 w-6" /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-black text-[color:var(--text)]">{b.service?.name || `Запись #${b.id}`}</h2><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColors[b.status] || statusColors.booked}`}>{statusNames[b.status] || b.status}</span>{b.payment_status === "pending" ? <span className="rounded-full bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">Ожидает оплаты</span> : null}</div>
                  <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(b)}</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(b)} · {b.duration_minutes} мин</span>
                    {b.trainer?.name ? <span className="flex items-center gap-2"><User className="h-4 w-4" />{b.trainer.name}</span> : null}
                    {b.location?.name ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{b.location.name}</span> : null}
                  </div>
                  {b.discount_amount > 0 ? <div className="mt-3 text-sm text-emerald-400">Скидка по промокоду: {money(b.discount_amount)}</div> : null}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:flex-col lg:items-end">
                <div className="text-right"><div className="text-xs text-[color:var(--muted)]">Стоимость</div><div className="text-xl font-black text-[color:var(--text)]">{b.total_amount ? money(b.total_amount) : "Бесплатно"}</div></div>
                <div className="flex gap-2">
                  {b.payment?.status === "pending" ? <button onClick={() => setPayment(b.payment)} className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950"><CreditCard className="h-4 w-4" />Оплатить</button> : null}
                  {b.status === "booked" ? <button onClick={() => cancel(b.id)} disabled={actionLoading === b.id} className="rounded-xl border border-red-400/25 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-400/10">{actionLoading === b.id ? "Отменяем…" : "Отменить"}</button> : null}
                </div>
              </div>
            </div>
            {b.client_comment ? <div className="mt-5 border-t border-[color:var(--stroke)] pt-4 text-sm text-[color:var(--muted)]"><b className="text-[color:var(--text)]">Комментарий:</b> {b.client_comment}</div> : null}
          </article>
        ))}
      </div>

      {payment ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-2xl items-center py-8"><div className="w-full"><MockPaymentPanel payment={payment} title="Оплата тренировки" onCancel={() => setPayment(null)} onSuccess={async () => { setPayment(null); await load(); }} /></div></div></div> : null}
    </div>
  );
}
