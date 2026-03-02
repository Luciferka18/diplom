import RequireAdmin from "@/components/auth/RequireAdmin";
import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <RequireAdmin>
      <div className="app-container">
        <div className="lkHead">
          <h1 className="lkTitle">Админка</h1>
          <div className="lkNav">
            <Link className="lkLink" href="/admin/articles">Статьи</Link>
            <Link className="lkLink" href="/admin/products">Магазин</Link>
            <Link className="lkLink" href="/admin/orders">Заказы</Link>
            <Link className="lkLink" href="/admin/bookings">Записи</Link>
            <Link className="lkLink" href="/admin/reviews">Отзывы</Link>
            <Link className="lkLink" href="/admin/trainers">Тренеры</Link>
            <Link className="lkLink" href="/admin/programs">Программы</Link>
          </div>
        </div>

        {children}
      </div>
    </RequireAdmin>
  );
}
