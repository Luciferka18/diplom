import Link from 'next/link';
import ApiPlayground from '@/components/ApiPlayground';
import { apiBaseUrl } from '@/src/services/api';

async function getHomeData() {
  try {
    const response = await fetch(`${apiBaseUrl}/home`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  const trainers = data?.trainers || [];
  const programs = data?.programs || [];
  const gym = data?.gym || { name: 'FitLab', description: 'API пока недоступен.' };

  return (
    <main className="page">
      <section className="hero card">
        <p className="badge">FitLab • тестовый интерфейс</p>
        <h1>{gym.name}</h1>
        <p>{gym.description}</p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Тренеры</h2>
          <p>Переходи на страницу тренера, чтобы проверить роут и API-запрос по id.</p>
        </div>
        <div className="grid">
          {trainers.length > 0 ? (
            trainers.map((trainer) => (
              <article className="card" key={trainer.id}>
                <h3>{trainer.name}</h3>
                <p>{trainer.specialization || 'Специализация не указана'}</p>
                <Link href={`/trainers/${trainer.id}`} className="button button--ghost">
                  Открыть профиль
                </Link>
              </article>
            ))
          ) : (
            <article className="card">
              <h3>Нет данных о тренерах</h3>
              <p>Заполни сидеры в backend или проверь доступность API.</p>
            </article>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Программы</h2>
        </div>
        <div className="grid">
          {programs.length > 0 ? (
            programs.map((program) => (
              <article className="card" key={program.id}>
                <h3>{program.title}</h3>
                <p>{program.short_description || program.description || 'Описание скоро появится.'}</p>
              </article>
            ))
          ) : (
            <article className="card">
              <h3>Нет данных о программах</h3>
              <p>Добавь программы через сидер или админку.</p>
            </article>
          )}
        </div>
      </section>

      <ApiPlayground />
    </main>
  );
}
