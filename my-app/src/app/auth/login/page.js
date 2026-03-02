"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";

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

      // на всякий случай убираем старый ключ, если где-то использовался
      localStorage.removeItem("user");

      location.href = "/";
    } catch (e2) {
      const msg =
        e2?.data?.message ||
        (e2?.status === 401 ? "Неверный логин или пароль" : "Ошибка входа");
      setError(msg);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Вход</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <button className="w-full bg-[#2D6033] text-white py-2 rounded hover:opacity-90">
          Войти
        </button>

        <p className="text-sm text-center">
          Нет аккаунта?{" "}
          <a href="/auth/register" className="text-[#2D6033] font-semibold hover:underline">
            Регистрация
          </a>
        </p>
      </form>
    </div>
  );
}
