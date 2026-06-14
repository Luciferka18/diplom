"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Package, Calendar, DollarSign, Clock, AlertCircle } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const statusNames = {
  pending: "В обработке",
  processing: "Выполняется",
  completed: "Завершён",
  cancelled: "Отменён",
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    const loadOrders = async () => {
      try {
        const data = await apiGet("/orders");
        const list = Array.isArray(data) ? data : (data.data ?? []);
        if (!cancelled) setOrders(list);
      } catch (e) {
        if (!cancelled) setError(e.message || "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₽";
    return `${Number(price).toLocaleString("ru-RU")} ₽`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Мои заказы</h1>
        <p className="text-[color:var(--muted)] mt-1">
          История покупок и статусы заказов
        </p>
      </div>

      {loading && (
        <Card hover={false} className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-[color:var(--muted)]">
            <Clock className="w-5 h-5 animate-spin" />
            Загрузка заказов...
          </div>
        </Card>
      )}

      {error && (
        <Card hover={false} className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        </Card>
      )}

      {!loading && !error && orders.length === 0 && (
        <Card hover={false} className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-[color:var(--muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[color:var(--text)] mb-2">
            Пока нет заказов
          </h3>
          <p className="text-[color:var(--muted)] mb-4">
            Как только вы сделаете первый заказ, он появится здесь
          </p>
          <a href="/shop" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors">
            Перейти в магазин
          </a>
        </Card>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} hover={false} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      Заказ #{order.id}
                    </span>
                    <Badge className={statusColors[order.status] || statusColors.pending}>
                      {statusNames[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-[color:var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-2xl font-bold text-emerald-400">
                {formatPrice(order.total || order.sum)}
              </div>
            </div>

            {/* Товары в заказе */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="border-t border-[color:var(--stroke)] pt-4 mt-4">
                <p className="text-sm font-medium text-[color:var(--muted)] mb-3">
                  Товары в заказе:
                </p>
                <div className="space-y-2">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[color:var(--text)]">
                          {item.product?.name || item.name || "Товар"}
                        </span>
                        <span className="text-sm text-[color:var(--muted)]">
                          × {item.quantity || 1}
                        </span>
                      </div>
                      <span className="text-[color:var(--text)] font-medium">
                        {formatPrice(item.price * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Информация о доставке */}
            {order.address && (
              <div className="border-t border-[color:var(--stroke)] pt-4 mt-4">
                <p className="text-sm text-[color:var(--muted)]">
                  <span className="font-medium">Адрес доставки:</span> {order.address}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
