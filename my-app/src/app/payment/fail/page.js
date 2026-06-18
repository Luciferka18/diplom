import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailPage() {
  return (
    <main className="container-fitlab py-16">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-8 text-center">
        <XCircle className="mx-auto h-14 w-14 text-[color:var(--danger)]" />
        <h1 className="mt-5 text-3xl font-black text-[color:var(--text)]">Оплата не завершена</h1>
        <p className="mt-3 text-[color:var(--muted)]">Платёж отменён или не прошёл. Можно вернуться в личный кабинет и повторить оплату.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account/orders" className="rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-[color:var(--on-accent)]">К заказам</Link>
          <Link href="/cart" className="rounded-xl border border-[color:var(--stroke)] px-5 py-3 font-black text-[color:var(--text)]">В корзину</Link>
        </div>
      </div>
    </main>
  );
}
