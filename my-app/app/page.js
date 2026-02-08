const features = [
  {
    title: 'Персональные программы',
    description: 'Планы под цель: снижение веса, набор массы или поддержание формы.',
  },
  {
    title: 'Профессиональные тренеры',
    description: 'Тренеры с практическим опытом и поддержкой на каждом этапе.',
  },
  {
    title: 'Магазин спортпита',
    description: 'Добавки и продукты для восстановления и прогресса.',
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <p className="badge">FitLab</p>
        <h1>Фронтенд проекта готов к работе</h1>
        <p>
          Обновлён интерфейс и базовая структура Next.js. API-клиент использует единый
          baseURL, чтобы избежать 404 на страницах деталей.
        </p>
      </header>

      <section className="grid">
        {features.map((feature) => (
          <article key={feature.title} className="card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
