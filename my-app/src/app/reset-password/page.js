"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Lock, CheckCircle2, AlertCircle, Key, Mail } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const tokenParam = searchParams.get("token") || "";

    setEmail(emailParam);
    setToken(tokenParam);

    if (!emailParam || !tokenParam) {
      setTokenValid(null);
      return;
    }

    setChecking(true);
    apiPost("/auth/password/verify-token", {
      email: emailParam,
      token: tokenParam,
    })
      .then((data) => {
        setTokenValid(Boolean(data.valid));
        if (!data.valid) setError("Ссылка для сброса пароля недействительна или истекла.");
      })
      .catch((err) => {
        setTokenValid(false);
        setError(err?.data?.message || "Ссылка для сброса пароля недействительна или истекла.");
      })
      .finally(() => setChecking(false));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Введите email аккаунта.");
      return;
    }

    if (!token.trim()) {
      setError("Введите токен сброса или откройте ссылку из письма.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Пароли не совпадают.");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов.");
      return;
    }

    setBusy(true);

    try {
      await apiPost("/auth/password/update", {
        email: email.trim(),
        token: token.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(true);
      setTimeout(() => router.push("/login?reset=success"), 1600);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Ошибка сброса пароля.");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <Card className="w-full p-6 md:p-8" hover={false}>
        <div className="flex items-center justify-center gap-3 py-8 text-[color:var(--muted)]">
          <svg className="animate-spin h-5 w-5 text-[color:var(--accent)]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Проверяем ссылку...
        </div>
      </Card>
    );
  }

  if (tokenValid === false) {
    return (
      <Card className="w-full p-6 md:p-8" hover={false}>
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 mx-auto text-[color:var(--danger)] mb-4" />
          <h3 className="text-xl font-bold text-[color:var(--text)] mb-2">Ссылка не работает</h3>
          <p className="text-[color:var(--muted)] mb-4">Запросите новую ссылку для сброса пароля.</p>
          <Button onClick={() => router.push("/forgot-password")}>Запросить новую ссылку</Button>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full p-6 md:p-8" hover={false}>
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 mx-auto text-[color:var(--accent)] mb-4" />
          <h3 className="text-xl font-bold text-[color:var(--text)] mb-2">Пароль изменён</h3>
          <p className="text-[color:var(--muted)]">Перенаправляем на страницу входа...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-6 md:p-8" hover={false}>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={busy || Boolean(searchParams.get("email"))}
              className="pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">Токен сброса</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Токен из письма"
              disabled={busy || Boolean(searchParams.get("token"))}
              className="pl-10 font-mono text-xs"
              autoComplete="one-time-code"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">Новый пароль</label>
          <PasswordInput
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            showStrength
            leftIcon={<Lock className="w-5 h-5" />}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">Подтверждение пароля</label>
          <PasswordInput
            placeholder="Повторите пароль"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={busy}
            leftIcon={<Lock className="w-5 h-5" />}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full h-12 text-base">
          {busy ? "Сохранение..." : "Сбросить пароль"}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Container size="narrow" className="py-10 sm:py-14 min-h-[76vh] flex items-center">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] mb-4">
            <Lock className="w-8 h-8 text-[color:var(--accent)]" />
          </div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-[color:var(--text)]">Сброс пароля</h1>
          <p className="text-[color:var(--muted)] mt-2">Введите новый пароль для вашего аккаунта</p>
        </div>

        <Suspense fallback={<Card className="w-full p-6 md:p-8" hover={false}>Загрузка...</Card>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors">
            ← Вернуться ко входу
          </a>
        </div>
      </div>
    </Container>
  );
}
