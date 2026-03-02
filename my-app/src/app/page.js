import Link from "next/link";
import HomeReviews from "@/components/HomeReviews";

export default function HomePage() {
  return (
    <div>
      <p className="kicker">Платформа тренировок • программы • магазин</p>
      <h1 className="page-title">Добро пожаловать в FitLab</h1>
      <p className="page-subtitle">
        Выбирай тренера, проходи программы тренировок, покупай спортивные товары и веди прогресс.
      </p>

      <div className="grid" style={{ marginTop: 18 }}>
        <Link href="/trainers" className="card col-4">
          <div className="card-title">Тренеры</div>
          <p className="card-text">Подбор специалиста под цель: похудение, набор массы, функционал.</p>
          <div className="card-cta">Перейти →</div>
        </Link>

        <Link href="/programs" className="card col-4">
          <div className="card-title">Программы</div>
          <p className="card-text">Готовые планы занятий. Уровень, длительность и результат.</p>
          <div className="card-cta">Перейти →</div>
        </Link>

        <Link href="/shop" className="card col-4">
          <div className="card-title">Магазин</div>
          <p className="card-text">Добавки, питание, инвентарь. Всё в одной корзине.</p>
          <div className="card-cta">Перейти →</div>
        </Link>

        <Link href="/articles" className="card col-6">
          <div className="card-title">Статьи и гайды</div>
          <p className="card-text">Питание, восстановление, техника и полезные советы.</p>
          <div className="card-cta">Читать →</div>
        </Link>

        <Link href="/booking" className="card col-6">
          <div className="card-title">Запись на тренировку</div>
          <p className="card-text">Бронирование занятий и управление расписанием.</p>
          <div className="card-cta">Записаться →</div>
        </Link>
      </div>

      <HomeReviews />
    </div>
  );
}
