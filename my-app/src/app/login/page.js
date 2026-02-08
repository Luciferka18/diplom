"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiPost("/auth/login", { login, password });
      localStorage.setItem("user", JSON.stringify(res.user));
      location.href = "/";
    } catch {
      setError("Неверный логин или пароль");
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
          onChange={e => setLogin(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <button className="w-full bg-[#2D6033] text-white py-2 rounded hover:opacity-90">
          Войти
        </button>

        <p className="text-sm text-center">
          Нет аккаунта?{" "}
          <a href="/register" className="text-[#2D6033] font-semibold hover:underline">
            Регистрация
          </a>
        </p>
      </form>
    </div>
  );
}
