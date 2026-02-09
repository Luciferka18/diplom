"use client";

import { useState } from "react";
import { api } from "@/services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    login: "",
    password: "",
    password_confirmation: "",
    name: "",
    phone: "",
    email: "",
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post("/register", form);
      alert("Регистрация успешна");
    } catch (e) {
      alert("Ошибка регистрации");
    }
  };

  return (
    <form onSubmit={submit}>
      <h1>Регистрация</h1>
      <input name="login" placeholder="Логин" onChange={handleChange} />
      <input name="name" placeholder="Имя (кириллица)" onChange={handleChange} />
      <input name="phone" placeholder="+79991234567" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Пароль" onChange={handleChange} />
      <input
        type="password"
        name="password_confirmation"
        placeholder="Повтор пароля"
        onChange={handleChange}
      />
      <button>Зарегистрироваться</button>
    </form>
  );
}
