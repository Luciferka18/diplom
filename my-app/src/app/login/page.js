"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get("next") || "/account";

  const { login, user } = useAuth();

  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace(nextUrl);
  }, [user, nextUrl, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const l = String(loginValue || "").trim();
      const p = String(passwordValue || "");

      if (!l) throw new Error("Введите логин или email");
      if (!p) throw new Error("Введите пароль");

      await login(l, p);
      router.replace(nextUrl);
    } catch (err) {
      setError(err?.message || "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container size="narrow" className="py-16 min-h-[70vh] flex items-center">
      <Card className="w-full p-8" hover={false}>
        <h1 className="text-3xl font-bold text-center">Вход</h1>

        <form onSubmit={onSubmit} className="grid gap-4 mt-6">
          <Input placeholder="Логин или email" autoComplete="username" value={loginValue} onChange={(e) => setLoginValue(e.target.value)} disabled={busy} />
          <Input type="password" placeholder="Пароль" autoComplete="current-password" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} disabled={busy} />
          {error ? <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
          <Button type="submit" disabled={busy}>{busy ? "Входим..." : "Войти"}</Button>
        </form>
      </Card>
    </Container>
  );
}
