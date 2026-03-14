"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/services/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle2 } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const statusNames = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  completed: "Завершено",
  cancelled: "Отменено",
};

export default function AccountBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    
    const loadBookings = async () => {
      try {
        const data = await apiGet("/bookings");
        const list = Array.isArray(data) ? data : (data.data ?? []);
        if (!cancelled) setBookings(list);
      } catch (e) {
        if (!cancelled) setError(e.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBookings();
    return () => { cancelled = true; };
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm("Вы уверены, что хотите отменить запись?")) return;

    setActionLoading(bookingId);
    try {
      await apiPatch(`/admin/bookings/${bookingId}/status`, { status: "cancelled" });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
      setSuccessMessage("Запись отменена");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      setError(e.message || "Ошибка при отмене");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
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

      {successMessage && (
        <Card hover={false} className="p-4 bg-emerald-500/10 border-emerald-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300">{successMessage}</p>
          </div>
        </Card>
      )}

      {loading && (
        <Card hover={false} className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-[color:var(--muted)]">
            <Clock className="w-5 h-5 animate-spin" />
            Загрузка бронирований...
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

      {!loading && !error && bookings.length === 0 && (
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
      )}

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
                    <span className="text-lg font-bold text-white">
                      Запись #{booking.id}
                    </span>
                    <Badge className={statusColors[booking.status] || statusColors.pending}>
                      {statusNames[booking.status] || booking.status}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {booking.date && (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                    )}
                    {booking.starts_at && (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(booking.starts_at)}</span>
                      </div>
                    )}
                    {booking.trainer?.name && (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <User className="w-4 h-4" />
                        <span>Тренер: {booking.trainer.name}</span>
                      </div>
                    )}
                    {booking.program?.title && (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <MapPin className="w-4 h-4" />
                        <span>Программа: {booking.program.title}</span>
                      </div>
                    )}
                    {booking.gym_location_id && (
                      <div className="flex items-center gap-2 text-[color:var(--muted)]">
                        <MapPin className="w-4 h-4" />
                        <span>Филиал: {booking.gym_location_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {booking.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={() => handleCancel(booking.id)}
                  disabled={actionLoading === booking.id}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  {actionLoading === booking.id ? "Отмена..." : "Отменить запись"}
                </Button>
              )}
            </div>

            {booking.comment && (
              <div className="border-t border-[color:var(--stroke)] pt-4 mt-4">
                <p className="text-sm text-[color:var(--muted)]">
                  <span className="font-medium">Комментарий:</span> {booking.comment}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
