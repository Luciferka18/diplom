"use client";

import { useState } from "react";
import { apiPost } from "../../services/api";

export default function ContactsPage() {
  const [form, setForm] = useState({
    name: "",
    phone_or_vk: "",
    goal: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      await apiPost("/contacts", form);
      setStatus({
        type: "success",
        message: "Заявка отправлена! Мы свяжемся с тобой.",
      });
      setForm({ name: "", phone_or_vk: "", goal: "" });
    } catch {
      setStatus({
        type: "error",
        message: "Не удалось отправить заявку. Попробуй ещё раз.",
      });
    }
  };

  return (
    <div className="py-14">
      <div className="container-fitlab grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="badge mb-3">Контакты</span>
          <h1 className="section-title">Наши залы и связь</h1>
          <p className="section-subtitle mb-6">
            Приходи тренироваться в НашФит или оставь заявку — менеджер свяжется
            с тобой и подберёт программу.
          </p>

          <div className="grid gap-4 mb-8 md:grid-cols-2">
            <div className="card">
              <h2 className="font-semibold mb-1">НашФит Центр</h2>
              <p className="text-sm text-black/60 mb-1">
                Ул. Спортивная, 10
              </p>
              <p className="text-xs text-black/50">Пн–Вс: 7:00–23:00</p>
            </div>
            <div className="card">
              <h2 className="font-semibold mb-1">НашФит Север</h2>
              <p className="text-sm text-black/60 mb-1">
                Пр. Силы, 45
              </p>
              <p className="text-xs text-black/50">Пн–Вс: 8:00–22:00</p>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[var(--color-primary-soft)] h-64 flex items-center justify-center text-xs text-[var(--color-primary)]">
            Здесь может быть карта (Yandex / Google Maps)
          </div>
        </div>

        <aside className="card h-fit">
          <h2 className="font-semibold text-lg mb-2">Форма обратной связи</h2>
          <p className="text-xs text-black/60 mb-4">
            Оставь контакты и кратко опиши свою цель — мы подберём формат
            тренировок и свяжемся в ближайшее время.
          </p>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs mb-1">Имя</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                placeholder="Как к тебе обращаться"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Телефон или ВКонтакте</label>
              <input
                type="text"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                placeholder="+7... или @username"
                value={form.phone_or_vk}
                onChange={handleChange("phone_or_vk")}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Цель тренировок</label>
              <textarea
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] min-h-[80px]"
                placeholder="Похудение, набор массы, поддержание формы..."
                value={form.goal}
                onChange={handleChange("goal")}
              />
            </div>
            <button type="submit" className="btn-primary w-full text-sm">
              Отправить заявку
            </button>
            <p className="text-[10px] text-black/45">
              Нажимая на кнопку, ты соглашаешься на обработку персональных
              данных.
            </p>
            {status && (
              <p
                className={`text-xs ${
                  status.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
}

