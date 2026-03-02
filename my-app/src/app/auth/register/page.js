"use client";

import { useState } from "react";
import { apiPost } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const [form, setForm] = useState({ login: "", password: "", password_confirmation: "", name: "", phone: "", email: "" });
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
      const msg = e2?.data?.message || (e2?.data?.errors ? "Проверь поля формы" : "Ошибка регистрации");
      setError(msg);
    }
  };

  return (
    <Container size="narrow" className="py-16 min-h-[70vh] flex items-center">
      <Card className="w-full p-8" hover={false}>
        <h1 className="text-3xl font-bold text-center">Регистрация</h1>
        {error && <p className="mt-4 text-red-300 text-sm text-center">{error}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input placeholder="Логин" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
          <Input placeholder="Имя (кириллица)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="+79991234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input type="password" placeholder="Пароль (мин. 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input type="password" placeholder="Повтор пароля" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
          <Button className="w-full">Создать аккаунт</Button>
        </form>

        <p className="mt-4 text-sm text-center text-white/75">
          Уже есть аккаунт? <a href="/auth/login" className="text-emerald-300 font-semibold hover:underline">Войти</a>
        </p>
      </Card>
    </Container>
  );
}
