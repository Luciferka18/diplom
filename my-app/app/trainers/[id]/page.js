import { apiGet } from '@/src/services/api';

export default async function TrainerPage({ params }) {
  const { id } = await params;

  try {
    const trainer = await apiGet(`/trainers/${id}`);

    return (
      <main className="page">
        <article className="card">
          <h1>{trainer.name}</h1>
          <p>{trainer.specialization || 'Специализация не указана'}</p>
          <p>Опыт: {trainer.experience_years ?? 0} лет</p>
          <p>{trainer.bio || 'Описание скоро появится.'}</p>
        </article>
      </main>
    );
  } catch {
    return (
      <main className="page">
        <article className="card">
          <h1>Тренер не найден</h1>
          <p>Проверьте ID или доступность API.</p>
        </article>
      </main>
    );
  }
}
