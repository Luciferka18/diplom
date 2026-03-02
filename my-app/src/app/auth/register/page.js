"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    login: "",
    password: "",
    password_confirmation: "",
    name: "",
    phone: "",
    email: "",
  });

  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiPost("/auth/register", form);

      if (res?.token) localStorage.setItem("fitlab_token", res.token);
      if (res?.user) localStorage.setItem("fitlab_user", JSON.stringify(res.user));
      localStorage.removeItem("user");

      location.href = "/";
    } catch (e2) {
      const msg =
        e2?.data?.message ||
        (e2?.data?.errors ? "Проверь поля формы" : "Ошибка регистрации");
      setError(msg);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Регистрация</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          placeholder="Логин"
          value={form.login}
          onChange={(e) => setForm({ ...form, login: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Имя (кириллица)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="+79991234567"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Пароль (мин. 8)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Повтор пароля"
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <button className="w-full bg-[#2D6033] text-white py-2 rounded hover:opacity-90">
          Создать аккаунт
        </button>

        <p className="text-sm text-center">
          Уже есть аккаунт?{" "}
          <a href="/auth/login" className="text-[#2D6033] font-semibold hover:underline">
            Войти
          </a>
        </p>
      </form>
    </div>
  );
}
