"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiPost("/auth/login", { login, password });
      if (res?.token) localStorage.setItem("fitlab_token", res.token);
      if (res?.user) localStorage.setItem("fitlab_user", JSON.stringify(res.user));
      localStorage.removeItem("user");
      location.href = "/";
    } catch (e2) {
      const msg = e2?.data?.message || (e2?.status === 401 ? "Неверный логин или пароль" : "Ошибка входа");
      setError(msg);
    }
  };

  return (
    <Container size="narrow" className="py-16 min-h-[70vh] flex items-center">
      <Card className="w-full p-8" hover={false}>
        <h1 className="text-3xl font-bold text-center">Вход</h1>
        {error && <p className="mt-4 text-red-300 text-sm text-center">{error}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} />
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full">Войти</Button>
        </form>

        <p className="mt-4 text-sm text-center text-[color:var(--muted)]">
          Нет аккаунта? <a href="/auth/register" className="text-emerald-300 font-semibold hover:underline">Регистрация</a>
        </p>
      </Card>
    </Container>
  );
}
