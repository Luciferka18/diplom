'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const routes = [
  '/programs',
  '/trainers',
  '/shop',
  '/blog',
  '/contacts',
  '/cart',
  '/dashboard',
  '/auth/login',
  '/auth/register',
];

export default function HomePage() {
  const [status, setStatus] = useState({ state: 'loading', message: 'Checking backend...' });

  useEffect(() => {
    let active = true;

    fetch('/api/health', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!active) return;

        if (response.ok && payload?.ok) {
          setStatus({ state: 'ok', message: payload.message || 'Backend is reachable' });
          return;
        }

        setStatus({
          state: 'error',
          message: payload?.error || payload?.message || `Health check failed (${response.status})`,
        });
      })
      .catch((error) => {
        if (!active) return;
        setStatus({ state: 'error', message: error.message || 'Network error' });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page">
      <section className="card" style={{ marginBottom: 16 }}>
        <h1>FitLab Home (Smoke Test)</h1>
        <p>Быстрые ссылки для проверки UI и роутинга.</p>
        <ul>
          {routes.map((route) => (
            <li key={route}>
              <Link href={route}>{route}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Backend status</h2>
        <p>
          {status.state === 'loading' && 'Checking...'}
          {status.state === 'ok' && `OK: ${status.message}`}
          {status.state === 'error' && `ERROR: ${status.message}`}
        </p>
      </section>
    </main>
  );
}
