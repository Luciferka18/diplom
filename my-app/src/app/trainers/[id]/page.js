import { headers } from 'next/headers';

async function loadTrainer(id) {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/trainers/${id}`, { cache: 'no-store' });

  if (response.status === 404) {
    const error = new Error('Trainer not found');
    error.status = 404;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`Failed to load trainer (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export default async function TrainerPage({ params }) {
  const id = params?.id;

  try {
    const trainer = await loadTrainer(id);

    return (
      <main className="container-fitlab py-10">
        <h1 className="text-3xl font-bold">{trainer.name}</h1>
        <p className="mt-2 text-gray-600">{trainer.specialization}</p>
        <p className="mt-4">{trainer.bio}</p>
      </main>
    );
  } catch (error) {
    if (error?.status === 404) {
      return <main className="container-fitlab py-10">Тренер не найден</main>;
    }

    return <main className="container-fitlab py-10">Ошибка загрузки тренера</main>;
  }
}
