import Link from 'next/link';
import { apiGet } from '@/src/services/api';

export default async function TrainerPage({ params }) {
  const { id } = await params;

  try {
    const trainer = await apiGet(`/trainers/${id}`);

    return (
      <main className="page">
        <article className="card details">
          <h1>{trainer.name}</h1>
          <p><strong>Специализация:</strong> {trainer.specialization || 'не указана'}</p>
          <p><strong>Опыт:</strong> {trainer.experience_years ?? 0} лет</p>
          <p>{trainer.bio || 'Описание скоро появится.'}</p>
          <Link href="/" className="button">← На главную</Link>
        </article>
      </main>
    );
  } catch {
    return (
      <main className="page">
        <article className="card details">
          <h1>Тренер не найден</h1>
          <p>Проверьте ID или доступность API backend.</p>
          <Link href="/" className="button">← На главную</Link>
        </article>
      </main>
    );
  }
}
