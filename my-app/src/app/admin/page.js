"use client";

import { useState } from "react";
import { api } from "@/services/api";

export default function AdminPage() {
  const [form, setForm] = useState({
    program_id: "",
    title: "",
    description: "",
    video: null
  });

  const submit = async e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    await api.post("/workouts", fd);
    alert("Видео загружено");
  };

  return (
    <div>
      <h1>Админка — добавление тренировки</h1>

      <form onSubmit={submit} className="card" style={{ maxWidth: 500 }}>
        <input placeholder="Program ID" onChange={e => setForm({ ...form, program_id: e.target.value })} />
        <input placeholder="Название" onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Описание" onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="file" onChange={e => setForm({ ...form, video: e.target.files[0] })} />
        <button className="button">Загрузить</button>
      </form>
    </div>
  );
}
