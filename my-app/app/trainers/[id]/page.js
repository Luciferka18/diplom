'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/src/services/api';

export default function TrainerPage() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setStatus('loading');

    apiGet(`/trainers/${id}`)
      .then((data) => {
        if (!mounted) return;
        setTrainer(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <main className="page">
        <article className="card details">
          <h1>Загружаем профиль тренера...</h1>
          <p>Подождите несколько секунд.</p>
        </article>
      </main>
    );
  }

  if (status === 'error' || !trainer) {
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
}
