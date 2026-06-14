"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgramProgressOverview from "@/components/programs/ProgramProgressOverview";
import ActiveMembershipCard from "@/components/account/ActiveMembershipCard";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Package,
  Star,
  Loader2,
} from "lucide-react";

function normalizeList(response, fallbackKey) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.[fallbackKey])) return response[fallbackKey];

  return [];
}

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [statsData, setStatsData] = useState({
    orders: 0,
    bookings: 0,
    reviews: 0,
  });
  const [trainerBookings, setTrainerBookings] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true);

      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);
      setStatsError("");

      try {
        const [ordersResponse, bookingsResponse, reviewsResponse] =
          await Promise.allSettled([
            apiGet("/orders"),
            apiGet("/bookings"),
            apiGet("/reviews"),
          ]);

        const orders =
          ordersResponse.status === "fulfilled"
            ? normalizeList(ordersResponse.value, "orders")
            : [];

        const bookings =
          bookingsResponse.status === "fulfilled"
            ? normalizeList(bookingsResponse.value, "bookings")
            : [];

        const allReviews =
          reviewsResponse.status === "fulfilled"
            ? normalizeList(reviewsResponse.value, "reviews")
            : [];

        const myReviews = user?.id
          ? allReviews.filter((review) => {
              const reviewUserId =
                review.user_id ??
                review.user?.id ??
                review.author_id ??
                review.author?.id;

              return String(reviewUserId) === String(user.id);
            })
          : [];

        if (!cancelled) {
          const upcomingForTrainer = user?.role === "trainer"
            ? bookings
                .filter((booking) => booking.status === "booked" && new Date(booking.starts_at || booking.date).getTime() >= Date.now())
                .sort((a, b) => new Date(a.starts_at || a.date) - new Date(b.starts_at || b.date))
                .slice(0, 5)
            : [];

          setTrainerBookings(upcomingForTrainer);
          setStatsData({
            orders: orders.length,
            bookings: bookings.length,
            reviews: myReviews.length,
          });

          if (
            ordersResponse.status === "rejected" ||
            bookingsResponse.status === "rejected"
          ) {
            setStatsError("Не удалось загрузить часть статистики.");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setStatsError(error?.message || "Не удалось загрузить статистику.");
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const getRoleBadge = (role) => {
    const variants = {
      admin: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      trainer: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      user: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    };

    return variants[role] || variants.user;
  };

  const getRoleName = (role) => {
    const names = {
      admin: "Администратор",
      trainer: "Тренер",
      user: "Клиент",
    };

    return names[role] || "Пользователь";
  };

  const stats = useMemo(
    () => [
      {
        label: "Заказы",
        value: statsData.orders,
        icon: Package,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
      },
      {
        label: user?.role === "trainer" ? "Записи ко мне" : "Бронирования",
        value: statsData.bookings,
        icon: Calendar,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
      },
      {
        label: "Отзывы",
        value: statsData.reviews,
        icon: Star,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
      },
    ],
    [statsData, user?.role]
  );

  return (
    <div className="space-y-6">
      {/* Приветственное сообщение */}
      {showWelcome && (
        <Card
          hover={false}
          className="p-4 bg-emerald-500/10 border-emerald-500/30"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-300">
                Добро пожаловать, {user?.name}!
              </p>
              <p className="text-sm text-emerald-400/80">
                Ваш аккаунт успешно создан. Теперь вы можете делать заказы и
                записываться на тренировки.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Личный кабинет
        </h1>
        <p className="text-[color:var(--muted)] mt-1">
          Управление профилем и настройками аккаунта
        </p>
      </div>

      <ActiveMembershipCard />

      {user?.role === "trainer" ? (
        <Card hover={false} className="p-5 md:p-6 border-cyan-500/25 bg-cyan-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Ближайшие клиенты</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Записи пользователей к вам на тренировки и консультации.</p>
            </div>
            <a href="/account/bookings" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">Все записи →</a>
          </div>

          {statsLoading ? (
            <div className="mt-5 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем записи…</div>
          ) : trainerBookings.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-center text-sm text-[color:var(--muted)]">Ближайших записей пока нет.</div>
          ) : (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {trainerBookings.map((booking) => {
                const start = new Date(booking.starts_at || `${booking.date}T${booking.time || "00:00"}`);
                return (
                  <div key={booking.id} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-[color:var(--text)]">{booking.client_name || booking.user?.name || "Клиент"}</div>
                        <div className="mt-1 text-sm text-cyan-300">{booking.service?.name || "Тренировка"}</div>
                      </div>
                      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">Записан</span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{start.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в {start.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
                      {booking.client_phone ? <a href={`tel:${booking.client_phone}`} className="flex items-center gap-2 hover:text-cyan-300"><Phone className="h-4 w-4" />{booking.client_phone}</a> : null}
                    </div>
                    {booking.client_comment ? <p className="mt-3 line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">{booking.client_comment}</p> : null}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : null}

      {/* Статистика */}
      {statsError ? (
        <Card hover={false} className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{statsError}</p>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false} className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>

              <div>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[color:var(--muted)]" />
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {user?.role !== "trainer" ? <ProgramProgressOverview /> : null}

      {/* Основная информация */}
      <Card hover={false} className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {user?.name || "Пользователь"}
              </h2>

              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRoleBadge(user?.role)}>
                  {getRoleName(user?.role)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Логин */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[color:var(--muted)] text-sm">
              <User className="w-4 h-4" />
              Логин
            </div>
            <p className="text-[color:var(--text)] font-medium">
              {user?.login || "—"}
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[color:var(--muted)] text-sm">
              <Mail className="w-4 h-4" />
              Email
            </div>
            <p className="text-[color:var(--text)] font-medium">
              {user?.email || "—"}
            </p>
          </div>

          {/* Телефон */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[color:var(--muted)] text-sm">
              <Phone className="w-4 h-4" />
              Телефон
            </div>
            <p className="text-[color:var(--text)] font-medium">
              {user?.phone || "—"}
            </p>
          </div>

          {/* Дата регистрации */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[color:var(--muted)] text-sm">
              <Calendar className="w-4 h-4" />
              Дата регистрации
            </div>
            <p className="text-[color:var(--text)] font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </Card>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/account/orders" className="group">
          <Card hover className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-[color:var(--text)] group-hover:text-emerald-400 transition-colors">
                  Мои заказы
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  История покупок
                </p>
              </div>
            </div>
          </Card>
        </a>

        <a href="/account/bookings" className="group">
          <Card hover className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-[color:var(--text)] group-hover:text-cyan-400 transition-colors">
                  {user?.role === "trainer" ? "Клиенты и записи" : "Бронирования"}
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  {user?.role === "trainer" ? "Кто записан к вам" : "Записи на тренировки"}
                </p>
              </div>
            </div>
          </Card>
        </a>

        <a href="/account/reviews" className="group">
          <Card hover className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-[color:var(--text)] group-hover:text-yellow-400 transition-colors">
                  Мои отзывы
                </p>
                <p className="text-sm text-[color:var(--muted)]">
                  Написанные отзывы
                </p>
              </div>
            </div>
          </Card>
        </a>
      </div>

      {/* Информация о безопасности */}
      <Card hover={false} className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-[color:var(--text)]">
            Безопасность
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-300">
                Аккаунт защищён
              </p>
              <p className="text-xs text-emerald-400/80">
                Ваш пароль надёжно зашифрован и хранится в безопасности
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
            <AlertCircle className="w-5 h-5 text-[color:var(--muted)] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[color:var(--text)]">
                Рекомендуется сменить пароль
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Регулярная смена пароля повышает безопасность
              </p>
            </div>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              Сменить
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}