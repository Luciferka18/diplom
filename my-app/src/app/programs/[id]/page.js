import { apiGet } from '@/services/api';

export default async function ProgramPage({ params }) {
  const resolvedParams =
    params && typeof params.then === 'function' ? await params : params;

  const id = resolvedParams?.id;

  if (!id) {
    return <main className="container-fitlab py-10">Программа не найдена</main>;
  }

  let program = null;

  try {
    program = await apiGet(`/programs/${id}`);
  } catch (e) {
    if (e?.status === 404) {
      return <main className="container-fitlab py-10">Программа не найдена</main>;
    }
    return <main className="container-fitlab py-10">Ошибка загрузки программы</main>;
  }

  if (!program) {
    return <main className="container-fitlab py-10">Программа не найдена</main>;
  }

  return (
    <main className="container-fitlab py-10">
      <h1 className="text-3xl font-bold">{program.title ?? program.name}</h1>

      {program.description ? <p className="mt-4">{program.description}</p> : null}

      {program.price != null ? (
        <p className="mt-4 font-semibold">Цена: {program.price} ₽</p>
      ) : null}

      {program.duration ? (
        <p className="mt-2 text-gray-600">Длительность: {program.duration}</p>
      ) : null}
    </main>
  );
}
