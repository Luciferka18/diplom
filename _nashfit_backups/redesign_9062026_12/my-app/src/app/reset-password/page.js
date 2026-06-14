"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Lock, CheckCircle2, AlertCircle, Key } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    // Проверяем токен
    if (emailParam && tokenParam) {
      apiPost("/auth/password/verify-token", {
        email: emailParam,
        token: tokenParam,
      })
        .then((data) => {
          setTokenValid(data.valid);
          if (!data.valid) {
            setError("Неверный или истёкший токен");
          }
        })
        .catch(() => {
          setTokenValid(false);
          setError("Ошибка проверки токена");
        });
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      return;
    }

    setBusy(true);

    try {
      await apiPost("/auth/password/update", {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (err) {
      setError(err?.data?.message || "Ошибка сброса пароля");
    } finally {
      setBusy(false);
    }
  };

  if (tokenValid === false) {
    return (
      <Card className="w-full p-6 md:p-8" hover={false}>
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Неверный токен
          </h3>
          <p className="text-[color:var(--muted)] mb-4">
            Ссылка для сброса пароля недействительна или истекла
          </p>
          <Button onClick={() => router.push("/forgot-password")}>
            Запросить новую ссылку
          </Button>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full p-6 md:p-8" hover={false}>
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Пароль изменён
          </h3>
          <p className="text-[color:var(--muted)]">
            Перенаправляем на страницу входа...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-6 md:p-8" hover={false}>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">
            Новый пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            <PasswordInput
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              className="pl-10"
              showStrength
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">
            Подтверждение пароля
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            <PasswordInput
              placeholder="Повторите пароль"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={busy}
              className="pl-10"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full h-12 text-base">
          {busy ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Сохранение...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Сбросить пароль
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Container size="narrow" className="py-12 min-h-[80vh] flex items-center">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Сброс пароля</h1>
          <p className="text-[color:var(--muted)] mt-2">
            Введите новый пароль для вашего аккаунта
          </p>
        </div>

        <Suspense fallback={
          <Card className="w-full p-6 md:p-8" hover={false}>
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-emerald-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
          >
            ← Вернуться ко входу
          </a>
        </div>
      </div>
    </Container>
  );
}
