import { apiGet } from '@/services/api';
import Link from 'next/link';

export default async function TrainersPage() {
  let trainers = [];

  try {
    trainers = await apiGet('/trainers');
  } catch (e) {
    console.error('[trainers] failed to load list', e);
    trainers = [];
  }

  return (
    <main className="container-fitlab py-10">
      <h1 className="text-3xl font-bold">Наши тренеры</h1>
      <p className="mt-2 text-gray-600">
        Профессионалы, которые приведут тебя к результату
      </p>

      {trainers.length === 0 ? (
        <p className="mt-6">Тренеры не найдены</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {trainers.map((t) => (
            <li key={t.id} className="border rounded-md p-4">
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-600">
                {t.specialization}
              </div>

              <Link
                href={`/trainers/${t.id}`}
                className="underline mt-2 inline-block"
              >
                Подробнее
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
