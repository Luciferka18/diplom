"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Calendar, RefreshCw, CreditCard, Truck, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "@/services/api";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";
import { useCart } from "@/context/CartContext";

const money = (kopecks) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(kopecks || 0) / 100);
const statusNames = { awaiting_payment: "Ожидает оплаты", new: "Новый", paid: "Оплачен", processing: "Собирается", shipped: "Отправлен", completed: "Получен", cancelled: "Отменён", refunded: "Возврат" };
const steps = ["paid", "processing", "shipped", "completed"];

export default function OrdersPage() {
  const { refreshCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  async function load() {
    setLoading(true);
    try { const response = await apiGet("/orders"); setOrders(response?.data || response?.orders || []); }
    catch (e) { setError(e?.message || "Не удалось загрузить заказы."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function repeat(order) {
    const response = await apiPost(`/orders/${order.id}/repeat`, {});
    await refreshCart();
    if (response?.added) window.location.href = "/cart";
    else setError(response?.message || "Товары недоступны.");
  }

  return (
    <div>
      <div className="mb-6"><div className="text-xs font-black uppercase tracking-[.18em] text-[color:var(--accent)]">Покупки</div><h1 className="mt-1 text-3xl font-black text-[color:var(--text)]">Мои заказы</h1><p className="mt-2 text-[color:var(--muted)]">Оплата, доставка и история покупок.</p></div>
      {error ? <div className="mb-5 rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] bg-[color:var(--danger-soft)] p-4 text-[color:var(--danger)]">{error}</div> : null}
      {loading ? <div className="space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="h-56 animate-pulse rounded-3xl bg-[color:var(--panel)]" />)}</div> : orders.length ? <div className="space-y-5">{orders.map((order) => {
        const stepIndex = steps.indexOf(order.status);
        return <article key={order.id} className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--accent-soft)]"><Package className="h-6 w-6 text-[color:var(--accent)]" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-[color:var(--text)]">Заказ #{order.id}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${order.status === "completed" ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)]" : order.status === "cancelled" ? "bg-[color:var(--danger-soft)] text-[color:var(--danger)]" : "bg-[color:var(--secondary-soft)] text-[color:var(--secondary)]"}`}>{statusNames[order.status] || order.status}</span></div><div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--muted)]"><Calendar className="h-4 w-4" /> {new Date(order.created_at).toLocaleDateString("ru-RU")}</div></div></div><div className="text-right"><div className="text-2xl font-black text-[color:var(--accent)]">{money(order.total)}</div><div className="text-xs text-[color:var(--muted)]">{order.items_count} товаров</div></div></div>
          {!["cancelled","refunded","awaiting_payment"].includes(order.status) ? <div className="mt-6 grid grid-cols-4 gap-2">{steps.map((step,index)=><div key={step}><div className={`h-2 rounded-full ${index <= stepIndex ? "bg-[color:var(--accent)]" : "bg-[color:var(--stroke)]"}`} /><div className={`mt-2 text-center text-[10px] font-bold ${index <= stepIndex ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"}`}>{statusNames[step]}</div></div>)}</div> : null}
          <div className="mt-6 space-y-3 border-t border-[color:var(--stroke)] pt-5">{(order.items || order.order_items || []).map((item)=><div key={item.id} className="flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-900">{item.image_url || item.product?.image_url ? <img src={item.image_url || item.product.image_url} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><div className="truncate font-bold text-[color:var(--text)]">{item.name || item.product?.name}</div><div className="text-xs text-[color:var(--muted)]">{item.variant_name ? `${item.variant_name} · ` : ""}{item.quantity || item.qty} шт.</div></div><b className="text-[color:var(--text)]">{money(item.line_total || item.price * item.quantity)}</b></div>)}</div>
          <div className="mt-5 flex flex-wrap gap-3">{order.payment_status === "pending" && order.payment ? <button onClick={() => setPayment(order.payment)} className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2.5 font-black text-[color:var(--on-accent)]"><CreditCard className="h-4 w-4" /> Оплатить</button> : null}<button onClick={() => repeat(order)} className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] px-4 py-2.5 font-bold text-[color:var(--text)]"><RefreshCw className="h-4 w-4" /> Повторить заказ</button>{order.status === "completed" ? <Link href="/account/reviews" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--accent-border)] px-4 py-2.5 font-bold text-[color:var(--accent)]"><CheckCircle2 className="h-4 w-4" /> Оставить отзыв</Link> : null}<span className="ml-auto inline-flex items-center gap-2 text-sm text-[color:var(--muted)]">{order.delivery_method === "courier" ? <Truck className="h-4 w-4" /> : <Package className="h-4 w-4" />}{order.delivery_method === "courier" ? "Доставка" : "Самовывоз"}</span></div>
        </article>;
      })}</div> : <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center"><Package className="mx-auto h-12 w-12 text-[color:var(--accent)]" /><h2 className="mt-4 text-xl font-black text-[color:var(--text)]">Пока нет заказов</h2><Link href="/shop" className="mt-6 inline-flex rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-[color:var(--on-accent)]">Перейти в магазин</Link></div>}
      {payment ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-2xl items-center"><div className="w-full"><MockPaymentPanel payment={payment} title="Оплата заказа" onCancel={() => setPayment(null)} onSuccess={async()=>{setPayment(null);await load();}} /></div></div></div> : null}
    </div>
  );
}
