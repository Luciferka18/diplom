"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import { AlertCircle, Calendar, CheckCircle2, Clock, CreditCard, Dumbbell, MapPin, Phone, User } from "lucide-react";

const statusColors = {
  booked: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};
const statusNames = { booked: "Записан", completed: "Завершено", cancelled: "Отменено" };
const money = (value = 0) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0) / 100);
const list = (response) => Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : Array.isArray(response?.bookings) ? response.bookings : [];

function errorText(error, fallback) {
  const errors = error?.data?.errors;
  if (errors && typeof errors === "object") {
    const messages = Object.values(errors).flat().filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return error?.data?.message || error?.message || fallback;
}

export default function AccountBookingsPage() {
  const { user } = useAuth();
  const isTrainer = user?.role === "trainer";
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState("");
  const [payment, setPayment] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBookings(list(await apiGet("/bookings?per_page=100")));
    } catch (loadError) {
      setError(errorText(loadError, "Ошибка загрузки"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user?.role]);

  async function cancel(id) {
    if (!confirm(isTrainer ? "Отменить запись клиента?" : "Отменить запись?")) return;
    setActionLoading(id);
    try {
      const response = await apiPatch(`/bookings/${id}/cancel`, {});
      setBookings((prev) => prev.map((item) => item.id === id ? { ...item, ...(response?.booking || {}), status: "cancelled" } : item));
      setSuccess("Запись отменена");
      setTimeout(() => setSuccess(""), 2500);
    } catch (cancelError) {
      setError(errorText(cancelError, "Не удалось отменить запись"));
    } finally {
      setActionLoading(null);
    }
  }

  const formatDate = (booking) => new Date(booking.starts_at || booking.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const formatTime = (booking) => booking.time || new Date(booking.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[color:var(--text)]">{isTrainer ? "Клиенты и записи" : "Мои бронирования"}</h1>
        <p className="mt-1 text-[color:var(--muted)]">{isTrainer ? "Пользователи, которые записались к вам на тренировки и консультации." : "Офлайн-тренировки, услуги и оплата."}</p>
      </div>

      {success ? <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-200"><CheckCircle2 className="h-5 w-5" />{success}</div> : null}
      {error ? <div className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-red-200"><AlertCircle className="mt-0.5 h-5 w-5" /><div>{error}<button onClick={load} className="ml-2 underline">Повторить</button></div></div> : null}

      {loading ? <div className="h-44 animate-pulse rounded-3xl bg-[color:var(--panel)]" /> : bookings.length === 0 ? (
        <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-[color:var(--muted)]" />
          <h2 className="mt-4 text-xl font-bold text-[color:var(--text)]">{isTrainer ? "К вам пока никто не записан" : "Пока нет записей"}</h2>
          {isTrainer ? <p className="mt-2 text-sm text-[color:var(--muted)]">Новые клиенты появятся здесь автоматически после оформления записи.</p> : <a href="/booking" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950">Записаться к тренеру</a>}
        </div>
      ) : null}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Dumbbell className="h-6 w-6" /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-black text-[color:var(--text)]">{booking.service?.name || `Запись #${booking.id}`}</h2>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColors[booking.status] || statusColors.booked}`}>{statusNames[booking.status] || booking.status}</span>
                    {booking.payment_status === "pending" ? <span className="rounded-full bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">Ожидает оплаты</span> : null}
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(booking)}</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(booking)} · {booking.duration_minutes} мин</span>
                    {isTrainer ? <span className="flex items-center gap-2"><User className="h-4 w-4" />{booking.client_name || booking.user?.name || "Клиент"}</span> : booking.trainer?.name ? <span className="flex items-center gap-2"><User className="h-4 w-4" />{booking.trainer.name}</span> : null}
                    {booking.location?.name ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{booking.location.name}</span> : null}
                    {isTrainer && booking.client_phone ? <a href={`tel:${booking.client_phone}`} className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200"><Phone className="h-4 w-4" />{booking.client_phone}</a> : null}
                  </div>

                  {booking.discount_amount > 0 && !isTrainer ? <div className="mt-3 text-sm text-emerald-400">Скидка по промокоду: {money(booking.discount_amount)}</div> : null}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:flex-col lg:items-end">
                <div className="text-right"><div className="text-xs text-[color:var(--muted)]">Стоимость</div><div className="text-xl font-black text-[color:var(--text)]">{booking.total_amount ? money(booking.total_amount) : "Бесплатно"}</div></div>
                <div className="flex gap-2">
                  {!isTrainer && booking.payment?.status === "pending" ? <button onClick={() => setPayment(booking.payment)} className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950"><CreditCard className="h-4 w-4" />Оплатить</button> : null}
                  {booking.status === "booked" ? <button onClick={() => cancel(booking.id)} disabled={actionLoading === booking.id} className="rounded-xl border border-red-400/25 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-400/10">{actionLoading === booking.id ? "Отменяем…" : isTrainer ? "Отменить запись" : "Отменить"}</button> : null}
                </div>
              </div>
            </div>

            {booking.client_comment ? <div className="mt-5 border-t border-[color:var(--stroke)] pt-4 text-sm text-[color:var(--muted)]"><b className="text-[color:var(--text)]">Комментарий клиента:</b> {booking.client_comment}</div> : null}
          </article>
        ))}
      </div>

      {payment ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-2xl items-center py-8"><div className="w-full"><MockPaymentPanel payment={payment} title="Оплата тренировки" onCancel={() => setPayment(null)} onSuccess={async () => { setPayment(null); await load(); }} /></div></div></div> : null}
    </div>
  );
}
