import { apiGet } from '@/services/api';

export default async function TrainerPage({ params }) {
  const trainerId = params?.id;

  try {
    const trainer = await apiGet(`/trainers/${trainerId}`);

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
