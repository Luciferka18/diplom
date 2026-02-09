"use client";

import { useState } from "react";
import { api } from "@/services/api";

export default function LoginPage() {
  const [form, setForm] = useState({ login: "", password: "" });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("fitlab_user", JSON.stringify(data.user || null));
      alert("Вход выполнен");
    } catch {
      alert("Ошибка входа");
    }
  };

  return (
    <form onSubmit={submit}>
      <h1>Вход</h1>
      <input name="login" placeholder="Логин" onChange={handleChange} />
      <input type="password" name="password" placeholder="Пароль" onChange={handleChange} />
      <button>Войти</button>
    </form>
  );
}
