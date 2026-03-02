"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
    <div className="app-container" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="h2">Вход</div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <input
            className="input"
            placeholder="Логин или email"
            autoComplete="username"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            disabled={busy}
          />

          <input
            className="input"
            placeholder="Пароль"
            type="password"
            autoComplete="current-password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            disabled={busy}
          />

          {error ? <div className="error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
