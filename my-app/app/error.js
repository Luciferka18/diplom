'use client';

import Link from 'next/link';

export default function GlobalPageError({ error, reset }) {
  return (
    <main className="page">
      <article className="card details">
        <h1>Произошла ошибка интерфейса</h1>
        <p>{error?.message || 'Неизвестная ошибка.'}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button" onClick={() => reset()}>Повторить</button>
          <Link href="/" className="button button--ghost">На главную</Link>
        </div>
      </article>
    </main>
  );
}
