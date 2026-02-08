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

  const submit = async (e) => {
    e.preventDefault();
    const res = await apiPost("/auth/register", form);
    localStorage.setItem("user", JSON.stringify(res.user));
    location.href = "/";
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Регистрация</h1>

        {["login", "name", "phone", "email"].map(f => (
          <input
            key={f}
            placeholder={f}
            value={form[f]}
            onChange={e => setForm({ ...form, [f]: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        ))}

        <input
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Повтор пароля"
          value={form.password_confirmation}
          onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <button className="w-full bg-[#2D6033] text-white py-2 rounded hover:opacity-90">
          Создать аккаунт
        </button>
      </form>
    </div>
  );
}
