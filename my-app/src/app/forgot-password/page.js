"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const data = await apiPost("/auth/password/reset", { email: email.trim() });
      setResult(data);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Ошибка отправки запроса.");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <Container size="narrow" className="py-10 sm:py-14 min-h-[76vh] flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] mb-4">
              <CheckCircle2 className="w-8 h-8 text-[color:var(--accent)]" />
            </div>
            <h1 className="text-3xl font-black tracking-[-0.045em] text-[color:var(--text)]">Готово</h1>
            <p className="text-[color:var(--muted)] mt-2">{result.message || "Инструкция подготовлена."}</p>
          </div>

          <Card className="w-full p-6 md:p-8" hover={false}>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] text-sm text-[color:var(--accent)]">
                Запрос обработан для <strong>{email}</strong>.
              </div>

              {result.reset_url ? (
                <Button onClick={() => router.push(result.reset_url.replace(/^https?:\/\/[^/]+/, ""))} className="w-full">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Открыть страницу сброса
                </Button>
              ) : null}

              <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
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
          <p className="text-[color:var(--muted)] mt-2">Введите email, чтобы подготовить сброс пароля</p>
        </div>

        <Card className="w-full p-6 md:p-8" hover={false}>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[color:var(--text)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] p-3 text-sm text-[color:var(--danger)] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy || !email.trim()} className="w-full h-12 text-base">
              {busy ? "Отправка..." : "Подготовить сброс"}
            </Button>

            <Button type="button" variant="outline" onClick={() => router.push("/login")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться ко входу
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}
