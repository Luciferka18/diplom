"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/services/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle2 } from "lucide-react";

const statusColors = {
  booked: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const statusNames = {
  booked: "Записан",
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  completed: "Завершено",
  cancelled: "Отменено",
};

function normalizeBookings(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.bookings)) return response.bookings;
  return [];
}

function getErrorMessage(error) {
  return error?.data?.message || error?.message || "Ошибка загрузки";
}

export default function AccountBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadBookings = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiGet("/bookings");
      setBookings(normalizeBookings(data));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError("");
      setLoading(true);

      try {
        const data = await apiGet("/bookings");
        if (!cancelled) setBookings(normalizeBookings(data));
      } catch (error) {
        if (!cancelled) setError(getErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm("Вы уверены, что хотите отменить запись?")) return;

    setActionLoading(bookingId);
    setError("");

    try {
      const data = await apiPatch(`/bookings/${bookingId}/cancel`, {});
      const updatedBooking = data?.booking ?? data?.data ?? null;

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...(updatedBooking || {}), status: "cancelled" }
            : booking
        )
      );

      setSuccessMessage("Запись отменена");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (booking) => {
    const source = booking.date || booking.starts_at;
    if (!source) return "—";

    return new Date(source).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (booking) => {
    if (booking.time) return booking.time;
    if (!booking.starts_at) return "—";

    return new Date(booking.starts_at).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Мои бронирования</h1>
        <p className="text-[color:var(--muted)] mt-1">
          Записи на тренировки и занятия с тренерами
        </p>
      </div>

      {successMessage ? (
        <Card hover={false} className="p-4 bg-emerald-500/10 border-emerald-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300">{successMessage}</p>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <Card hover={false} className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-[color:var(--muted)]">
            <Clock className="w-5 h-5 animate-spin" />
            Загрузка бронирований...
          </div>
        </Card>
      ) : null}

      {error ? (
        <Card hover={false} className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-300">{error}</p>
              <button onClick={loadBookings} className="mt-2 text-xs text-red-200 underline">
                Попробовать ещё раз
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      {!loading && !error && bookings.length === 0 ? (
        <Card hover={false} className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-[color:var(--muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[color:var(--text)] mb-2">
            Пока нет записей
          </h3>
          <p className="text-[color:var(--muted)] mb-4">
            Запишитесь на первую тренировку с тренером
          </p>
          <a href="/trainers" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors">
            Выбрать тренера
          </a>
        </Card>
      ) : null}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} hover={false} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-white">Запись #{booking.id}</span>
                    <Badge className={statusColors[booking.status] || statusColors.booked}>
                      {statusNames[booking.status] || booking.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[color:var(--muted)]">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[color:var(--muted)]">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(booking)}</span>
                    </div>

                    {booking.trainer?.name ? (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <User className="w-4 h-4" />
                        <span>Тренер: {booking.trainer.name}</span>
                      </div>
                    ) : null}

                    {booking.location?.name ? (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <MapPin className="w-4 h-4" />
                        <span>Филиал: {booking.location.name}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {booking.status === "booked" ? (
                <Button
                  variant="outline"
                  onClick={() => handleCancel(booking.id)}
                  disabled={actionLoading === booking.id}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  {actionLoading === booking.id ? "Отмена..." : "Отменить запись"}
                </Button>
              ) : null}
            </div>

            {(booking.comment || booking.client_comment) ? (
              <div className="border-t border-[color:var(--stroke)] pt-4 mt-4">
                <p className="text-sm text-[color:var(--muted)]">
                  <span className="font-medium">Комментарий:</span> {booking.comment || booking.client_comment}
                </p>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
