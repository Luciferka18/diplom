"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const data = await apiPost("/auth/password/reset", { email: email.trim() });
      setSuccess(true);
      setResetToken(data.reset_token);
    } catch (err) {
      setError(err?.data?.message || "Ошибка отправки запроса");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <Container size="narrow" className="py-10 sm:py-14 min-h-[76vh] flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] mb-4">
              <CheckCircle2 className="w-8 h-8 text-[color:var(--accent)]" />
            </div>
            <h1 className="text-3xl font-black tracking-[-0.045em] text-[color:var(--text)]">Письмо отправлено</h1>
            <p className="text-[color:var(--muted)] mt-2">
              Следуйте инструкциям в письме для сброса пароля
            </p>
          </div>

          <Card className="w-full p-6 md:p-8" hover={false}>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)]">
                <p className="text-sm text-[color:var(--accent)]">
                  ✅ Запрос на сброс пароля отправлен на <strong>{email}</strong>
                </p>
              </div>

              {/* Для разработки - показываем токен */}
              <div className="p-4 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
                <p className="text-xs text-[color:var(--muted)] mb-2">
                  Токен для разработки (в продакшене отправляется на email):
                </p>
                <code className="text-xs text-[color:var(--text)] break-all">
                  {resetToken}
                </code>
              </div>

              <Button
                onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`)}
                className="w-full"
              >
                Перейти к сбросу пароля
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Вернуться ко входу
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container size="narrow" className="py-10 sm:py-14 min-h-[76vh] flex items-center">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] mb-4">
            <Mail className="w-8 h-8 text-[color:var(--accent)]" />
          </div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-[color:var(--text)]">Забыли пароль?</h1>
          <p className="text-[color:var(--muted)] mt-2">
            Введите email и мы отправим инструкцию по сбросу
          </p>
        </div>

        <Card className="w-full p-6 md:p-8" hover={false}>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[color:var(--text)]">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)] flex items-start gap-2">
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
                  Отправка...
                </span>
              ) : (
                "Отправить инструкцию"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться ко входу
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
            <p className="text-xs text-[color:var(--muted)]">
              💡 Введите email, который вы использовали при регистрации. 
              Мы отправим на него ссылку для сброса пароля.
            </p>
          </div>
        </Card>
      </div>
    </Container>
  );
}
