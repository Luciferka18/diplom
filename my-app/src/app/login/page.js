"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Mail, Lock, LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();

  const [nextUrl, setNextUrl] = useState("/account");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromQuery = searchParams.get("next");
    if (fromQuery) setNextUrl(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (user) router.replace(nextUrl);
  }, [user, nextUrl, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const id = String(identifier || "").trim();
      const pwd = String(password || "");

      if (!id) throw new Error("Введите логин или email");
      if (!pwd) throw new Error("Введите пароль");

      const result = await login(id, pwd);
      
      // Если требуется 2FA, перенаправляем на страницу 2FA
      if (result?.requires_2fa) {
        router.push(`/2fa?uid=${result.user_id}&2fa=true&next=${encodeURIComponent(nextUrl)}`);
        return;
      }
      
      router.replace(nextUrl);
    } catch (err) {
      setError(err?.message || "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full p-6 md:p-8" hover={false}>
      <form onSubmit={onSubmit} className="grid gap-5">
        {/* Поле ввода */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">
            Логин или email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            <Input
              placeholder="name@example.com"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={busy}
              className="pl-10"
            />
          </div>
        </div>

        {/* Пароль */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">
            Пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              className="pl-10"
            />
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Кнопка входа */}
        <Button type="submit" disabled={busy} className="w-full h-12 text-base">
          {busy ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Вход...
            </span>
          ) : (
            "Войти"
          )}
        </Button>

        {/* Ссылка на сброс пароля */}
        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Забыли пароль?
          </a>
        </div>

        {/* Ссылка на регистрацию */}
        <p className="text-center text-sm text-[color:var(--muted)]">
          Нет аккаунта?{" "}
          <a href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Зарегистрироваться
          </a>
        </p>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Container size="narrow" className="py-12 min-h-[80vh] flex items-center">
      <div className="w-full max-w-md mx-auto">
        {/* Заголовок с иконкой */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
            <LogIn className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">С возвращением!</h1>
          <p className="text-[color:var(--muted)] mt-2">Войдите в свой аккаунт</p>
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
          <LoginForm />
        </Suspense>

        {/* Дополнительная информация */}
        <div className="mt-6 text-center text-xs text-[color:var(--muted)]">
          <p>Войдите для доступа к личному кабинету, заказам и бронированиям</p>
        </div>
      </div>
    </Container>
  );
}
