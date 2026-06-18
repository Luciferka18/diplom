"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, AlertCircle, CheckCircle2, Key } from "lucide-react";

function safeNextUrl(value) {
  const fallback = "/account";
  const raw = String(value || fallback).trim();

  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.startsWith("/login") || raw.startsWith("/2fa")) return fallback;

  return raw;
}

function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeLogin } = useAuth();
  const [userId, setUserId] = useState("");
  const [nextUrl, setNextUrl] = useState("/account");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const uid = searchParams.get("uid");
    const requires2fa = searchParams.get("2fa");
    const next = safeNextUrl(searchParams.get("next"));

    if (requires2fa !== "true" || !uid) {
      router.replace("/login");
      return;
    }

    setUserId(uid);
    setNextUrl(next);
  }, [searchParams, router]);

  const finishLogin = (user, token) => {
    completeLogin?.(user, token);

    localStorage.setItem("nashfit_token", token);
    localStorage.setItem("nashfit_user", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("nashfit:auth-changed"));

    // Hard navigation is intentional: it remounts AccountLayout/AuthProvider,
    // so protected pages no longer see the old unauthenticated state after 2FA.
    window.setTimeout(() => {
      window.location.replace(safeNextUrl(nextUrl));
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const codeToVerify = useRecovery
      ? code.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : code.replace(/\D/g, "");

    if (!codeToVerify) {
      setError("Введите код.");
      return;
    }

    if (!useRecovery && codeToVerify.length !== 6) {
      setError("Код из приложения должен состоять из 6 цифр.");
      return;
    }

    setBusy(true);

    try {
      const data = await apiPost("/auth/2fa/verify", {
        user_id: Number(userId),
        code: codeToVerify,
      });

      const token = data?.token ?? data?.data?.token ?? null;
      const user = data?.user ?? data?.data?.user ?? null;

      if (!token || !user) {
        throw new Error("Сервер вернул неполный ответ.");
      }

      setSuccess(data?.message || "Вход выполнен. Открываем кабинет...");
      finishLogin(user, token);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Неверный код.");
      setBusy(false);
    }
  };

  return (
    <Card className="w-full p-6 md:p-8" hover={false}>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[color:var(--text)]">
            {useRecovery ? "Код восстановления" : "Код из приложения"}
          </label>
          <div className="relative">
            {useRecovery ? (
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            ) : (
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
            )}
            <Input
              placeholder={useRecovery ? "XXXXXXXX" : "000000"}
              value={code}
              onChange={(e) => {
                const value = useRecovery
                  ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
                  : e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(value);
              }}
              disabled={busy}
              className="pl-10 text-center tracking-widest"
              maxLength={useRecovery ? 8 : 6}
              autoComplete="one-time-code"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] p-3 text-sm text-[color:var(--accent)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <Button type="submit" disabled={busy || !userId} className="w-full h-12 text-base">
          {busy ? "Проверка..." : "Подтвердить"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setUseRecovery((v) => !v);
              setCode("");
              setError("");
              setSuccess("");
            }}
            className="text-sm text-[color:var(--accent)] hover:text-[color:var(--accent-hover)] transition-colors"
          >
            {useRecovery ? "Использовать код из приложения" : "Использовать код восстановления"}
          </button>
        </div>

        <div className="text-center">
          <a href="/login" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors">
            ← Вернуться ко входу
          </a>
        </div>
      </form>

      <div className="mt-6 p-4 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
        <p className="text-xs text-[color:var(--muted)] text-center">
          {useRecovery
            ? "Введите один из одноразовых кодов восстановления. После входа код будет удалён."
            : "Откройте Google Authenticator, Authy или другое приложение и введите 6-значный код."}
        </p>
      </div>
    </Card>
  );
}

export default function TwoFactorPage() {
  return (
    <Container size="narrow" className="py-10 sm:py-14 min-h-[76vh] flex items-center">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] mb-4">
            <Shield className="w-8 h-8 text-[color:var(--accent)]" />
          </div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-[color:var(--text)]">Двухфакторная аутентификация</h1>
          <p className="text-[color:var(--muted)] mt-2">Введите код для продолжения</p>
        </div>

        <Suspense fallback={<Card className="w-full p-6 md:p-8" hover={false}>Загрузка...</Card>}>
          <TwoFactorForm />
        </Suspense>
      </div>
    </Container>
  );
}
