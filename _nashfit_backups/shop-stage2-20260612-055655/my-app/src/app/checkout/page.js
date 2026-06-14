"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Store, Truck, TicketPercent, ShieldCheck, Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/services/api";
import MockPaymentPanel from "@/components/payments/MockPaymentPanel";

const money = (value) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthed, loading: authLoading } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [delivery, setDelivery] = useState("pickup");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", city: "", address_line: "", postal_code: "", comment: "" });

  useEffect(() => {
    setForm((current) => ({ ...current, customer_name: current.customer_name || user?.name || "", customer_phone: current.customer_phone || user?.phone || "", customer_email: current.customer_email || user?.email || "" }));
  }, [user]);

  useEffect(() => {
    if (!isAuthed) return;
    apiGet("/account/addresses").then((response) => {
      const list = response?.data || [];
      setAddresses(list);
      const preferred = list.find((item) => item.is_default) || list[0];
      if (preferred) chooseAddress(preferred);
    }).catch(() => {});
    const stored = localStorage.getItem("nashfit_store_promo") || "";
    setPromo(stored);
    if (stored && totalPrice) validatePromo(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, totalPrice]);

  function chooseAddress(address) {
    setSelectedAddress(address.id);
    setForm((current) => ({ ...current, customer_name: address.recipient_name || current.customer_name, customer_phone: address.phone || current.customer_phone, city: address.city || "", address_line: address.address_line || "", postal_code: address.postal_code || "" }));
  }

  async function validatePromo(value = promo) {
    if (!value.trim() || !isAuthed) { setDiscount(0); return; }
    try {
      const response = await apiPost("/promo-codes/validate", { code: value.trim(), target: "store", subtotal: Math.round(totalPrice * 100) });
      setDiscount(Number(response.discount_amount || 0) / 100);
      setError("");
    } catch (e) { setDiscount(0); setError(e?.data?.errors?.promo_code?.[0] || e?.message || "Промокод не подошёл."); }
  }

  const deliveryCost = delivery === "pickup" || Math.max(0, totalPrice - discount) >= 5000 ? 0 : 390;
  const total = Math.max(0, totalPrice - discount) + deliveryCost;

  async function submit(event) {
    event.preventDefault(); setError("");
    if (!cart.length) return setError("Корзина пуста.");
    if (!form.customer_name.trim() || !form.customer_phone.trim()) return setError("Укажите имя и телефон.");
    if (delivery === "courier" && (!form.city.trim() || !form.address_line.trim())) return setError("Укажите город и адрес доставки.");
    setBusy(true);
    try {
      const response = await apiPost("/orders", {
        items: cart.map((item) => ({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity })),
        ...form,
        delivery_method: delivery,
        pickup_location: "Фитнес-клуб «НашФит»",
        promo_code: promo.trim() || null,
      });
      if (delivery === "courier" && saveAddress && !selectedAddress) {
        await apiPost("/account/addresses", {
          label: "Дом",
          recipient_name: form.customer_name,
          phone: form.customer_phone,
          city: form.city,
          address_line: form.address_line,
          postal_code: form.postal_code || null,
          is_default: addresses.length === 0,
        }).catch(() => null);
      }
      setOrder(response?.order || response?.data);
      if (response?.payment?.status === "pending") setPayment(response.payment);
      else { await clearCart(); router.push(`/order-success?orderId=${response?.order?.id || response?.data?.id}`); }
    } catch (e) {
      const first = e?.data?.errors ? Object.values(e.data.errors)?.[0]?.[0] : null;
      setError(first || e?.data?.message || e?.message || "Не удалось оформить заказ.");
    } finally { setBusy(false); }
  }

  if (authLoading) return <main className="container-fitlab py-12"><div className="h-96 animate-pulse rounded-3xl bg-[color:var(--panel)]" /></main>;
  if (!isAuthed) return <main className="container-fitlab py-16"><div className="mx-auto max-w-xl rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-8 text-center"><h1 className="text-3xl font-black text-[color:var(--text)]">Войдите для оформления</h1><p className="mt-3 text-[color:var(--muted)]">Так заказ сохранится в профиле, а корзина будет доступна на других устройствах.</p><Link href="/login?next=/checkout" className="mt-6 inline-flex rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950">Войти</Link></div></main>;
  if (!cart.length && !payment) return <main className="container-fitlab py-16"><div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center"><h1 className="text-3xl font-black text-[color:var(--text)]">Корзина пуста</h1><Link href="/shop" className="mt-6 inline-flex rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950">В магазин</Link></div></main>;

  return (
    <main className="min-h-screen bg-[color:var(--bg)] pb-20 pt-10">
      <form onSubmit={submit} className="container-fitlab">
        <div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-400">Оформление</div><h1 className="mt-1 text-4xl font-black text-[color:var(--text)]">Доставка и оплата</h1></div>
        {error ? <div className="mt-5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-red-200">{error}</div> : null}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 font-black text-slate-950">1</span><div><h2 className="text-xl font-black text-[color:var(--text)]">Контакты</h2><p className="text-sm text-[color:var(--muted)]">Для подтверждения заказа</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><input value={form.customer_name} onChange={(e) => setForm({...form,customer_name:e.target.value})} placeholder="Имя получателя" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" /><input value={form.customer_phone} onChange={(e) => setForm({...form,customer_phone:e.target.value})} placeholder="Телефон" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400" /><input value={form.customer_email} onChange={(e) => setForm({...form,customer_email:e.target.value})} placeholder="Email" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none focus:border-emerald-400 md:col-span-2" /></div></div>

            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 font-black text-slate-950">2</span><div><h2 className="text-xl font-black text-[color:var(--text)]">Способ получения</h2><p className="text-sm text-[color:var(--muted)]">Самовывоз или курьер</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setDelivery("pickup")} className={`rounded-2xl border p-5 text-left ${delivery === "pickup" ? "border-emerald-400 bg-emerald-400/10" : "border-[color:var(--stroke)]"}`}><Store className="h-6 w-6 text-emerald-400" /><div className="mt-3 font-black text-[color:var(--text)]">Самовывоз</div><div className="mt-1 text-sm text-[color:var(--muted)]">Бесплатно из клуба «НашФит»</div></button><button type="button" onClick={() => setDelivery("courier")} className={`rounded-2xl border p-5 text-left ${delivery === "courier" ? "border-emerald-400 bg-emerald-400/10" : "border-[color:var(--stroke)]"}`}><Truck className="h-6 w-6 text-cyan-400" /><div className="mt-3 font-black text-[color:var(--text)]">Курьер</div><div className="mt-1 text-sm text-[color:var(--muted)]">390 ₽ или бесплатно от 5 000 ₽</div></button></div>
              {delivery === "pickup" ? <div className="mt-4 rounded-xl border border-[color:var(--stroke)] p-4 text-sm text-[color:var(--muted)]"><b className="text-[color:var(--text)]">Фитнес-клуб «НашФит»</b><br />Заберите заказ после уведомления о готовности.</div> : <div className="mt-5"><div className="mb-3 flex flex-wrap gap-2">{addresses.map((address) => <button type="button" key={address.id} onClick={() => chooseAddress(address)} className={`rounded-full border px-3 py-1.5 text-sm ${selectedAddress === address.id ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-[color:var(--stroke)] text-[color:var(--muted)]"}`}><MapPin className="mr-1 inline h-3.5 w-3.5" />{address.label}</button>)}</div><div className="grid gap-4 md:grid-cols-2"><input value={form.city} onChange={(e) => setForm({...form,city:e.target.value})} placeholder="Город" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" /><input value={form.postal_code} onChange={(e) => setForm({...form,postal_code:e.target.value})} placeholder="Индекс" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none" /><input value={form.address_line} onChange={(e) => setForm({...form,address_line:e.target.value})} placeholder="Улица, дом, квартира" className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-[color:var(--text)] outline-none md:col-span-2" /></div>{!selectedAddress ? <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-[color:var(--muted)]"><input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-emerald-400" /> Сохранить адрес для следующих заказов</label> : null}</div>}
            </div>

            <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 font-black text-slate-950">3</span><div><h2 className="text-xl font-black text-[color:var(--text)]">Комментарий</h2><p className="text-sm text-[color:var(--muted)]">Необязательно</p></div></div><textarea value={form.comment} onChange={(e) => setForm({...form,comment:e.target.value})} placeholder="Например, позвонить за час до доставки" className="mt-5 min-h-28 w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-[color:var(--text)] outline-none focus:border-emerald-400" /></div>
          </section>

          <aside className="h-fit lg:sticky lg:top-24"><div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6"><h2 className="text-xl font-black text-[color:var(--text)]">Итого</h2><div className="mt-5 max-h-60 space-y-3 overflow-auto pr-1">{cart.map((item) => <div key={item.key} className="flex gap-3"><div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-900">{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-[color:var(--text)]">{item.name}</div><div className="text-xs text-[color:var(--muted)]">{item.variant?.name ? `${item.variant.name} · ` : ""}{item.quantity} шт.</div></div><b className="text-sm text-[color:var(--text)]">{money(item.price * item.quantity)}</b></div>)}</div><div className="mt-5 border-t border-[color:var(--stroke)] pt-5"><label className="text-xs font-black uppercase tracking-wider text-[color:var(--muted)]"><TicketPercent className="mr-1 inline h-4 w-4" /> Промокод</label><div className="mt-2 flex gap-2"><input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} className="min-w-0 flex-1 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-2.5 font-bold uppercase text-[color:var(--text)] outline-none" /><button type="button" onClick={() => validatePromo()} className="rounded-xl border border-emerald-400/30 px-3 font-bold text-emerald-400"><Check className="h-4 w-4" /></button></div></div><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between text-[color:var(--muted)]"><span>Товары</span><b className="text-[color:var(--text)]">{money(totalPrice)}</b></div>{discount ? <div className="flex justify-between text-emerald-400"><span>Скидка</span><b>−{money(discount)}</b></div> : null}<div className="flex justify-between text-[color:var(--muted)]"><span>Доставка</span><b className="text-[color:var(--text)]">{deliveryCost ? money(deliveryCost) : "Бесплатно"}</b></div><div className="flex justify-between border-t border-[color:var(--stroke)] pt-4 text-xl"><span className="font-black text-[color:var(--text)]">К оплате</span><b className="text-emerald-400">{money(total)}</b></div></div><button disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-black text-slate-950 disabled:opacity-50"><ShieldCheck className="h-5 w-5" />{busy ? "Создаём заказ…" : "Оформить и оплатить"}</button><p className="mt-3 text-center text-xs text-[color:var(--muted)]">Оплата работает в демонстрационном режиме</p></div></aside>
        </div>
      </form>

      {payment ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-2xl items-center py-8"><div className="w-full"><MockPaymentPanel payment={payment} title={`Заказ #${order?.id || ""}`} onCancel={() => setPayment(null)} onSuccess={async () => { await clearCart(); localStorage.removeItem("nashfit_store_promo"); router.push(`/order-success?orderId=${order?.id}`); }} /></div></div></div> : null}
    </main>
  );
}
