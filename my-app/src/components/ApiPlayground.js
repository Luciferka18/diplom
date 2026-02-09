'use client';

import { useState } from 'react';
import { apiPost, apiBaseUrl } from '@/services/api';

const initial = {
  register: { login: '', password: '', password_confirmation: '', name: '' },
  login: { login: '', password: '' },
  contact: { name: '', phone_or_telegram: '', goal: '' },
};

export default function ApiPlayground() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState('Результат запросов появится здесь...');
  const [loading, setLoading] = useState(false);

  const update = (scope, key, value) => {
    setForm((prev) => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [key]: value,
      },
    }));
  };

  const submit = async (endpoint, payload) => {
    setLoading(true);

    try {
      const data = await apiPost(endpoint, payload);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      const message = error?.response?.data || error.message;
      setResult(JSON.stringify(message, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="playground">
      <div className="playground__header">
        <h2>Проверка функционала API</h2>
        <p>
          Base URL: <code>{apiBaseUrl}</code>
        </p>
      </div>

      <div className="playground__grid">
        <article className="panel">
          <h3>Регистрация</h3>
          <input placeholder="Логин" value={form.register.login} onChange={(e) => update('register', 'login', e.target.value)} />
          <input placeholder="Имя" value={form.register.name} onChange={(e) => update('register', 'name', e.target.value)} />
          <input type="password" placeholder="Пароль" value={form.register.password} onChange={(e) => update('register', 'password', e.target.value)} />
          <input
            type="password"
            placeholder="Подтверждение пароля"
            value={form.register.password_confirmation}
            onChange={(e) => update('register', 'password_confirmation', e.target.value)}
          />
          <button disabled={loading} onClick={() => submit('/auth/register', form.register)}>Отправить</button>
        </article>

        <article className="panel">
          <h3>Вход</h3>
          <input placeholder="Логин" value={form.login.login} onChange={(e) => update('login', 'login', e.target.value)} />
          <input type="password" placeholder="Пароль" value={form.login.password} onChange={(e) => update('login', 'password', e.target.value)} />
          <button disabled={loading} onClick={() => submit('/auth/login', form.login)}>Войти</button>
        </article>

        <article className="panel">
          <h3>Заявка на контакт</h3>
          <input placeholder="Имя" value={form.contact.name} onChange={(e) => update('contact', 'name', e.target.value)} />
          <input
            placeholder="Телефон или Telegram"
            value={form.contact.phone_or_telegram}
            onChange={(e) => update('contact', 'phone_or_telegram', e.target.value)}
          />
          <textarea placeholder="Цель" value={form.contact.goal} onChange={(e) => update('contact', 'goal', e.target.value)} />
          <button disabled={loading} onClick={() => submit('/contacts', form.contact)}>Оставить заявку</button>
        </article>
      </div>

      <pre className="result">{result}</pre>
    </section>
  );
}
