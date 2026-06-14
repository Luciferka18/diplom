"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/services/api";
import ActiveMembershipCard from "@/components/account/ActiveMembershipCard";
import ProgramProgressOverview from "@/components/programs/ProgramProgressOverview";
import RecommendationHub from "@/components/recommendations/RecommendationHub";
import ActivityTimeline from "@/components/activity/ActivityTimeline";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Loader2,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";

function normalizeList(response, fallbackKey) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.[fallbackKey])) return response[fallbackKey];
  return [];
}

function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    ...options,
  });
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function getBookingDate(booking) {
  const raw = booking?.starts_at || booking?.start_at || booking?.datetime || (booking?.date ? `${booking.date}T${booking.time || "00:00"}` : null);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getOrderTotal(order) {
  const value = order?.total ?? order?.total_amount ?? order?.amount ?? order?.price;
  const number = Number(value || 0);
  if (!number) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(number);
}

function getRoleName(role) {
  return {
    admin: "Администратор",
    trainer: "Тренер",
    user: "Клиент",
  }[role] || "Клиент";
}


function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isInCurrentWeek(value) {
  const date = toDate(value);
  if (!date) return false;
  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function percent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function WeekProgressCard({ dashboard, loading }) {
  const programItems = dashboard.programs || [];
  const activeProgram = programItems.find((item) => item.status === "active") || programItems[0] || null;
  const averageProgramProgress = dashboard.programSummary?.average_progress ?? (
    programItems.length
      ? Math.round(programItems.reduce((sum, item) => sum + Number(item.progress_percent || 0), 0) / programItems.length)
      : 0
  );

  const bookingsThisWeek = dashboard.bookings.filter((booking) => isInCurrentWeek(getBookingDate(booking))).length;
  const ordersThisWeek = dashboard.orders.filter((order) => isInCurrentWeek(order.created_at)).length;
  const reviewsThisWeek = dashboard.reviews.filter((review) => isInCurrentWeek(review.created_at)).length;
  const notificationsThisWeek = dashboard.notifications.filter((item) => isInCurrentWeek(item.created_at)).length;
  const activityScore = Math.min(100, (bookingsThisWeek * 28) + (ordersThisWeek * 18) + (reviewsThisWeek * 14) + Math.min(30, notificationsThisWeek * 4));

  const rows = [
    {
      label: "Тренировки недели",
      value: percent(bookingsThisWeek ? (bookingsThisWeek / 3) * 100 : (activeProgram ? Math.min(100, Math.max(25, Number(activeProgram.progress_percent || 0))) : 0)),
      hint: bookingsThisWeek ? `${bookingsThisWeek} записей на этой неделе` : activeProgram ? `Активна программа «${activeProgram.program?.title || "тренировка"}»` : "Нет активных записей",
    },
    {
      label: "Программы",
      value: percent(averageProgramProgress),
      hint: activeProgram ? `Неделя ${activeProgram.current_week || 1} из ${activeProgram.total_weeks || 1}` : "Начните программу, чтобы видеть прогресс",
    },
    {
      label: "Активность аккаунта",
      value: percent(activityScore),
      hint: `${ordersThisWeek} заказов · ${reviewsThisWeek} отзывов · ${notificationsThisWeek} событий`,
    },
  ];

  return (
    <section className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-black text-[color:var(--text)]">Прогресс недели</h2>
          <p className="text-sm text-[color:var(--muted)]">По реальным данным аккаунта</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Считаем активность…</div>
      ) : (
        <div className="mt-5 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-[color:var(--text)]"><span>{row.label}</span><span>{row.value}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[color:var(--bg)]">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${row.value}%` }} />
              </div>
              <p className="mt-1 text-xs text-[color:var(--muted)]">{row.hint}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, caption, tone = "emerald", loading }) {
  const tones = {
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    cyan: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  };

  return (
    <div className="rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[color:var(--muted)]">{label}</p>
          <div className="mt-2 text-3xl font-black text-[color:var(--text)]">
            {loading ? <Loader2 className="h-7 w-7 animate-spin text-[color:var(--muted)]" /> : value}
          </div>
          {caption ? <p className="mt-1 text-xs font-medium text-[color:var(--muted)]">{caption}</p> : null}
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone] || tones.emerald}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, text, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 group-hover:border-emerald-500/40",
    cyan: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 group-hover:border-cyan-500/40",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-300 group-hover:border-amber-500/40",
    violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300 group-hover:border-violet-500/40",
  };

  return (
    <Link href={href} className="group block">
      <div className="h-full rounded-[1.4rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-950/10">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tones[tone] || tones.emerald}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-[color:var(--text)]">{title}</div>
            <div className="mt-0.5 line-clamp-1 text-sm text-[color:var(--muted)]">{text}</div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[color:var(--muted)] transition group-hover:translate-x-1 group-hover:text-[color:var(--accent)]" />
        </div>
      </div>
    </Link>
  );
}

function getProgramTitle(item) {
  return item?.program?.title || item?.program?.name || item?.title || item?.name || "Активная программа";
}

function getProgramHref(item) {
  const id = item?.program?.id || item?.program_id || item?.id;
  return id ? `/programs/${id}` : "/account/programs";
}

function TodayPanel({ user, dashboard, upcomingBooking, latestOrder, loading }) {
  const date = new Date();
  const isTrainer = user?.role === "trainer";
  const activeProgram = (dashboard.programs || []).find((item) => item.status === "active") || (dashboard.programs || [])[0] || null;
  const bookingDate = getBookingDate(upcomingBooking);
  const hasRealItems = Boolean(activeProgram || upcomingBooking || latestOrder || dashboard.unreadCount);

  const realItems = [
    activeProgram ? {
      icon: Dumbbell,
      label: "Активная программа",
      value: getProgramTitle(activeProgram),
      meta: activeProgram.current_week ? `Неделя ${activeProgram.current_week}${activeProgram.total_weeks ? ` из ${activeProgram.total_weeks}` : ""}` : "Можно продолжить тренировки",
      href: getProgramHref(activeProgram),
      tone: "emerald",
    } : null,
    upcomingBooking ? {
      icon: Calendar,
      label: isTrainer ? "Ближайший клиент" : "Ближайшая запись",
      value: upcomingBooking.service?.name || upcomingBooking.title || "Тренировка",
      meta: `${formatDate(bookingDate)} ${formatTime(bookingDate)}`.trim(),
      href: "/account/bookings",
      tone: "cyan",
    } : null,
    latestOrder ? {
      icon: ShoppingBag,
      label: "Последний заказ",
      value: `Заказ #${latestOrder.id}`,
      meta: `${getOrderTotal(latestOrder)} · ${latestOrder.status_label || latestOrder.status || "в обработке"}`,
      href: "/account/orders",
      tone: "amber",
    } : null,
    dashboard.unreadCount ? {
      icon: Bell,
      label: "Новые уведомления",
      value: `${dashboard.unreadCount} непрочитанных`,
      meta: "Откройте центр уведомлений",
      href: "/account/notifications",
      tone: "violet",
    } : null,
  ].filter(Boolean);

  const toneClasses = {
    emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    cyan: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  };

  return (
    <section className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" /> Сегодня
          </div>
          <h2 className="mt-3 text-2xl font-black text-[color:var(--text)]">{formatDate(date, { weekday: "long" })}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Только реальные данные аккаунта: программа, записи, заказы и уведомления.
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/12 text-cyan-700 dark:text-cyan-300">
          <Zap className="h-6 w-6" />
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm text-[color:var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Загружаем данные дня…
        </div>
      ) : hasRealItems ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {realItems.map((item) => (
            <Link key={`${item.label}-${item.value}`} href={item.href} className="group rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 transition hover:border-emerald-500/35 hover:bg-emerald-500/5">
              <div className="flex items-start gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClasses[item.tone] || toneClasses.emerald}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-wide text-[color:var(--muted)]">{item.label}</p>
                  <p className="mt-1 line-clamp-1 font-black text-[color:var(--text)]">{item.value}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[color:var(--muted)]">{item.meta}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[color:var(--muted)] transition group-hover:translate-x-1 group-hover:text-[color:var(--accent)]" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] p-5">
          <h3 className="font-black text-[color:var(--text)]">На сегодня нет запланированных событий</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Начните программу, запишитесь к тренеру или оформите заказ — после этого здесь появятся реальные события, без фейковых целей и серий.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/programs" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-500">Выбрать программу</Link>
            <Link href="/booking" className="rounded-xl border border-[color:var(--stroke)] px-4 py-2 text-sm font-black text-[color:var(--text)] transition hover:border-emerald-500/35">Записаться</Link>
          </div>
        </div>
      )}
    </section>
  );
}

function UpcomingCard({ upcomingBooking, loading }) {
  const bookingDate = getBookingDate(upcomingBooking);

  return (
    <section className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[color:var(--text)]">Ближайшая тренировка</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Следующее событие из ваших записей.</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
          <Calendar className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем запись…</div>
      ) : upcomingBooking ? (
        <div className="mt-5 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-black text-[color:var(--text)]">{upcomingBooking.service?.name || upcomingBooking.title || "Персональная тренировка"}</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">{upcomingBooking.trainer?.name || upcomingBooking.trainer_name || "Тренер НашФит"}</div>
            </div>
            <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">Записан</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-[color:var(--text)]">
            <Clock3 className="h-4 w-4 text-[color:var(--muted)]" />
            {formatDate(bookingDate)} {formatTime(bookingDate)}
          </div>
          <Link href="/account/bookings" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[color:var(--accent)]">
            Все записи <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 text-sm leading-6 text-[color:var(--muted)]">
          Пока нет ближайшей записи. Выберите тренера и забронируйте удобный слот.
          <div>
            <Link href="/booking" className="mt-3 inline-flex items-center gap-2 font-black text-[color:var(--accent)]">Записаться <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      )}
    </section>
  );
}

function NotificationsPreview({ notifications, unreadCount, loading }) {
  return (
    <section className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[color:var(--text)]">Уведомления</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Новые события аккаунта и записи.</p>
        </div>
        <Link href="/account/notifications" className="rounded-full bg-emerald-500/12 px-3 py-1.5 text-sm font-black text-emerald-700 dark:text-emerald-300">
          {unreadCount || 0} новых
        </Link>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем уведомления…</div>
      ) : notifications.length ? (
        <div className="mt-5 space-y-3">
          {notifications.slice(0, 3).map((item) => (
            <Link key={item.id} href={item.action_url || "/account/notifications"} className="block rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 transition hover:border-emerald-500/35">
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.is_read ? "bg-[color:var(--muted2)]" : "bg-emerald-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 font-bold text-[color:var(--text)]">{item.title}</div>
                  <p className="mt-1 line-clamp-1 text-sm text-[color:var(--muted)]">{item.body || item.message}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 text-sm text-[color:var(--muted)]">Новых уведомлений пока нет.</div>
      )}
    </section>
  );
}

function TrainerClientsCard({ items, loading }) {
  return (
    <section className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5 p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[color:var(--text)]">Ближайшие клиенты</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Записи пользователей к вам на тренировки и консультации.</p>
        </div>
        <Link href="/account/bookings" className="text-sm font-black text-cyan-700 dark:text-cyan-300">Все записи →</Link>
      </div>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Загружаем записи…</div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--stroke)] p-6 text-center text-sm text-[color:var(--muted)]">Ближайших записей пока нет.</div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {items.map((booking) => {
            const start = getBookingDate(booking);
            return (
              <div key={booking.id} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-[color:var(--text)]">{booking.client_name || booking.user?.name || "Клиент"}</div>
                    <div className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">{booking.service?.name || "Тренировка"}</div>
                  </div>
                  <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Записан</span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(start)} {formatTime(start)}</div>
                </div>
                {booking.client_comment ? <p className="mt-3 line-clamp-2 text-xs leading-5 text-[color:var(--muted)]">{booking.client_comment}</p> : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({
    orders: [],
    bookings: [],
    reviews: [],
    notifications: [],
    unreadCount: 0,
    programs: [],
    programSummary: null,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    refreshUser?.();
  }, [refreshUser]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      const [ordersResponse, bookingsResponse, reviewsResponse, notificationsResponse, programsResponse] = await Promise.allSettled([
        apiGet("/orders"),
        apiGet("/bookings"),
        apiGet("/reviews"),
        apiGet("/account/notifications?per_page=8"),
        apiGet("/account/programs"),
      ]);

      if (cancelled) return;

      const orders = ordersResponse.status === "fulfilled" ? normalizeList(ordersResponse.value, "orders") : [];
      const bookings = bookingsResponse.status === "fulfilled" ? normalizeList(bookingsResponse.value, "bookings") : [];
      const allReviews = reviewsResponse.status === "fulfilled" ? normalizeList(reviewsResponse.value, "reviews") : [];
      const notifications = notificationsResponse.status === "fulfilled" ? normalizeList(notificationsResponse.value, "notifications") : [];
      const unreadCount = notificationsResponse.status === "fulfilled" ? Number(notificationsResponse.value?.unread_count || notifications.filter((item) => !item.is_read).length || 0) : 0;
      const programs = programsResponse.status === "fulfilled" && Array.isArray(programsResponse.value?.data) ? programsResponse.value.data : [];
      const programSummary = programsResponse.status === "fulfilled" ? programsResponse.value?.summary || null : null;

      const reviews = user?.id
        ? allReviews.filter((review) => String(review.user_id ?? review.user?.id ?? review.author_id ?? review.author?.id) === String(user.id))
        : allReviews;

      setDashboard({ orders, bookings, reviews, notifications, unreadCount, programs, programSummary });

      const failedCore = [ordersResponse, bookingsResponse].some((item) => item.status === "rejected");
      if (failedCore) setError("Часть данных кабинета не загрузилась. Проверь backend Laravel и авторизацию.");
      setLoading(false);
    }

    loadDashboard().catch((e) => {
      if (!cancelled) {
        setError(e?.message || "Не удалось загрузить кабинет.");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const upcomingBooking = useMemo(() => {
    return dashboard.bookings
      .map((booking) => ({ booking, date: getBookingDate(booking) }))
      .filter((entry) => entry.date && entry.date.getTime() >= Date.now() - 60 * 60 * 1000)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.booking || null;
  }, [dashboard.bookings]);

  const trainerBookings = useMemo(() => {
    if (user?.role !== "trainer") return [];
    return dashboard.bookings
      .map((booking) => ({ booking, date: getBookingDate(booking) }))
      .filter((entry) => entry.date && entry.date.getTime() >= Date.now() - 60 * 60 * 1000)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6)
      .map((entry) => entry.booking);
  }, [dashboard.bookings, user?.role]);

  const latestOrder = useMemo(() => {
    return [...dashboard.orders]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0] || null;
  }, [dashboard.orders]);

  const stats = useMemo(() => [
    {
      label: "Заказы",
      value: dashboard.orders.length,
      caption: latestOrder ? `Последний: ${getOrderTotal(latestOrder)}` : "История покупок",
      icon: Package,
      tone: "emerald",
    },
    {
      label: user?.role === "trainer" ? "Записи ко мне" : "Записи",
      value: dashboard.bookings.length,
      caption: upcomingBooking ? `Ближайшая: ${formatDate(getBookingDate(upcomingBooking))}` : "Тренировки и консультации",
      icon: Calendar,
      tone: "cyan",
    },
    {
      label: "Отзывы",
      value: dashboard.reviews.length,
      caption: "Оценки товаров и сервиса",
      icon: Star,
      tone: "amber",
    },
    {
      label: "Уведомления",
      value: dashboard.unreadCount,
      caption: "Новые события аккаунта",
      icon: Bell,
      tone: "violet",
    },
  ], [dashboard, latestOrder, upcomingBooking, user?.role]);

  const quickActions = user?.role === "trainer"
    ? [
        { href: "/account/bookings", title: "Мои клиенты", text: "Записи и расписание", icon: Calendar, tone: "cyan" },
        { href: "/account/notifications", title: "Уведомления", text: "Новые заявки и оплаты", icon: Bell, tone: "violet" },
        { href: "/trainers", title: "Профиль тренера", text: "Как вас видят клиенты", icon: User, tone: "emerald" },
      ]
    : [
        { href: "/programs", title: "Продолжить программу", text: "Тренировки и прогресс", icon: Dumbbell, tone: "emerald" },
        { href: "/booking", title: "Записаться", text: "Тренер и удобное время", icon: Calendar, tone: "cyan" },
        { href: "/memberships", title: "Абонемент", text: "Продлить или выбрать план", icon: Wallet, tone: "amber" },
        { href: "/shop", title: "Магазин", text: "Товары под цели", icon: ShoppingBag, tone: "violet" },
      ];

  return (
    <div className="space-y-6">
      {showWelcome ? (
        <div className="rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-200">Добро пожаловать, {user?.name}!</p>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">Аккаунт создан. Теперь можно покупать товары, запускать программы и записываться к тренерам.</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.4rem] bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl font-black text-white shadow-xl shadow-emerald-950/20">
              {user?.name?.charAt(0)?.toUpperCase() || "Н"}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--bg)] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /> {getRoleName(user?.role)}
              </div>
              <h1 className="mt-3 text-3xl font-black leading-tight text-[color:var(--text)] md:text-5xl">
                {user?.name ? `Привет, ${user.name}` : "Личный кабинет"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)] md:text-base">
                Главный экран аккаунта: абонемент, тренировки, записи, заказы, уведомления и персональные рекомендации в одном месте.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/account/profile" className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-sm font-black text-[color:var(--text)] transition hover:border-emerald-500/35">
              Личные данные
            </Link>
            <Link href="/account/notifications" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500">
              Уведомления
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/25 bg-red-500/10 p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-red-700 dark:text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => <QuickAction key={action.href} {...action} />)}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} loading={loading} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <TodayPanel user={user} dashboard={dashboard} upcomingBooking={upcomingBooking} latestOrder={latestOrder} loading={loading} />
          <ActiveMembershipCard />
          {user?.role !== "trainer" ? <ProgramProgressOverview /> : <TrainerClientsCard items={trainerBookings} loading={loading} />}
          <ActivityTimeline limit={5} />
        </div>

        <div className="space-y-6">
          <UpcomingCard upcomingBooking={upcomingBooking} loading={loading} />
          <NotificationsPreview notifications={dashboard.notifications} unreadCount={dashboard.unreadCount} loading={loading} />
<WeekProgressCard dashboard={dashboard} loading={loading} />
        </div>
      </div>

      {user?.role !== "trainer" ? <RecommendationHub contextType="account" /> : null}
    </div>
  );
}
