"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiPut } from "@/services/api";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-black text-[color:var(--text)]">
        {Icon ? <Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> : null}
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">{hint}</span> : null}
    </label>
  );
}

function InfoCard({ icon: Icon, title, text, href, cta }) {
  return (
    <Link
      href={href}
      className="group block w-full rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-xl hover:shadow-emerald-950/10"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-[color:var(--text)]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
          <div className="mt-3 text-sm font-black text-emerald-700 dark:text-emerald-300">{cta} →</div>
        </div>
      </div>
    </Link>
  );
}

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", login: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      login: user?.login || "",
    });
  }, [user]);

  const initials = useMemo(() => String(form.name || user?.name || "Н").trim().charAt(0).toUpperCase(), [form.name, user?.name]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setSuccess("");
  };

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiPut("/auth/profile", form);
      await refreshUser?.();
      setSuccess("Личные данные обновлены.");
    } catch (requestError) {
      setError(requestError?.message || "Не удалось сохранить профиль.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.4rem] bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl font-black text-white shadow-xl shadow-emerald-950/20">
              {initials}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                <User className="h-4 w-4" /> Личный профиль
              </div>
              <h1 className="mt-3 text-3xl font-black text-[color:var(--text)] md:text-4xl">Личные данные</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                Здесь можно проверить и обновить имя, телефон, почту и логин. Настройки безопасности и 2FA вынесены рядом, чтобы не смешивать их с основными данными.
              </p>
            </div>
          </div>
          <Link href="/account/security" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500">
            <ShieldCheck className="h-4 w-4" /> Безопасность и 2FA
          </Link>
        </div>
      </section>

      {success ? (
        <div className="rounded-[1.4rem] border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="mr-2 inline h-5 w-5" /> {success}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/25 bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-200">
          <AlertCircle className="mr-2 inline h-5 w-5" /> {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
        <form onSubmit={saveProfile} className="min-w-0 rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[color:var(--text)]">Основная информация</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Эти данные используются для заказов, записей и связи с клубом.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Имя" icon={User}>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-semibold text-[color:var(--text)] outline-none transition focus:border-emerald-500/50" placeholder="Иван Иванов" />
            </Field>
            <Field label="Логин" icon={KeyRound} hint="Логин можно использовать для входа вместо почты.">
              <input value={form.login} onChange={(event) => update("login", event.target.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-semibold text-[color:var(--text)] outline-none transition focus:border-emerald-500/50" placeholder="nashfit_user" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-semibold text-[color:var(--text)] outline-none transition focus:border-emerald-500/50" placeholder="user@example.com" />
            </Field>
            <Field label="Телефон" icon={Phone} hint="Формат: +79991234567">
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 font-semibold text-[color:var(--text)] outline-none transition focus:border-emerald-500/50" placeholder="+79991234567" />
            </Field>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-500 disabled:opacity-60">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />} Сохранить изменения
            </button>
            <Link href="/account" className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-5 py-3 font-black text-[color:var(--text)] transition hover:border-emerald-500/35">
              Вернуться в кабинет
            </Link>
          </div>
        </form>

        <div className="min-w-0 space-y-4">
          <InfoCard icon={ShieldCheck} title="Безопасность и 2FA" text="Пароль, двухфакторная аутентификация и коды восстановления находятся в отдельном разделе." href="/account/security" cta="Открыть защиту" />
          <InfoCard icon={CreditCard} title="Абонемент" text="Срок действия, активный тариф и история покупок абонементов." href="/account/membership" cta="Проверить абонемент" />
          <InfoCard icon={Bell} title="Уведомления" text="Настройки событий, записи, заказы, программа и важные системные сообщения." href="/account/notifications" cta="Посмотреть уведомления" />
        </div>
      </section>
    </div>
  );
}
