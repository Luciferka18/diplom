"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, AlertCircle, CheckCircle2, Key } from "lucide-react";

function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const uid = searchParams.get("uid");
    const requires2fa = searchParams.get("2fa");
    
    if (requires2fa !== "true" || !uid) {
      router.replace("/login");
      return;
    }
    
    setUserId(uid);
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const codeToVerify = code.replace(/\s/g, "").toUpperCase();

    if (!codeToVerify) {
      setError("Введите код");
      setBusy(false);
      return;
    }

    try {
      const data = await apiPost("/auth/2fa/verify", {
        user_id: parseInt(userId),
        code: codeToVerify,
      });

      if (data.token) {
        localStorage.setItem("nashfit_token", data.token);
        if (data.user) {
          localStorage.setItem("nashfit_user", JSON.stringify(data.user));
        }
        
        setSuccess("Вход выполнен! Перенаправление...");
        setTimeout(() => {
          router.replace("/account");
        }, 1000);
      }
    } catch (e) {
      setError(e?.data?.message || "Неверный код");
    } finally {
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
                let value = e.target.value;
                if (!useRecovery) {
                  value = value.replace(/\D/g, "").slice(0, 6);
                } else {
                  value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                }
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

        <Button type="submit" disabled={busy} className="w-full h-12 text-base">
          {busy ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Проверка...
            </span>
          ) : (
            "Подтвердить"
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setUseRecovery(!useRecovery);
              setCode("");
              setError("");
            }}
            className="text-sm text-[color:var(--accent)] hover:text-[color:var(--accent-hover)] transition-colors"
          >
            {useRecovery 
              ? "Использовать код из приложения" 
              : "Использовать код восстановления"}
          </button>
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
          >
            ← Вернуться ко входу
          </a>
        </div>
      </form>

      {!useRecovery && (
        <div className="mt-6 p-4 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
          <p className="text-xs text-[color:var(--muted)] text-center">
            Откройте приложение Google Authenticator, Authy или другое совместимое приложение
            и введите 6-значный код для вашего аккаунта НашФит
          </p>
        </div>
      )}

      {useRecovery && (
        <div className="mt-6 p-4 rounded-xl bg-[color:var(--warning-soft)] border border-[color:color-mix(in_srgb,var(--warning)_40%,var(--stroke))]">
          <p className="text-xs text-[color:var(--warning)] text-center">
            Введите один из кодов восстановления, которые вы сохранили при настройке 2FA.
            Каждый код можно использовать только один раз.
          </p>
        </div>
      )}
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
          <p className="text-[color:var(--muted)] mt-2">
            Введите код для продолжения
          </p>
        </div>

        <Suspense fallback={
          <Card className="w-full p-6 md:p-8" hover={false}>
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-[color:var(--accent)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </Card>
        }>
          <TwoFactorForm />
        </Suspense>
      </div>
    </Container>
  );
}
