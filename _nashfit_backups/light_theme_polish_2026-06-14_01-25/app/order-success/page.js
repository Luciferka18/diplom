"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, PackageCheck } from "lucide-react";
import { Suspense } from "react";
import Container from "@/components/ui/Container";

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <Container size="narrow" className="grid min-h-[72vh] place-items-center py-12">
      <section className="w-full overflow-hidden rounded-[30px] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[var(--shadow-md)]">
        <div className="border-b border-[color:var(--stroke)] bg-[color:var(--accent-soft)] p-7 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)]"><Check size={28} strokeWidth={3} /></span>
          <div className="nf-eyebrow mt-5">Заказ принят</div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Спасибо за покупку</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]">{orderId ? <>Номер заказа <b className="text-[color:var(--text)]">#{orderId}</b>. Мы сообщим, когда его статус изменится.</> : "Мы получили ваш заказ и скоро начнём его обрабатывать."}</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3 rounded-[18px] bg-[color:var(--panel-2)] p-4 text-sm text-[color:var(--muted)]"><PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--accent)]" /><span>Состав заказа, оплата и текущий статус всегда доступны в личном кабинете.</span></div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/account/orders" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-6 font-black text-[color:var(--on-accent)]">Мои заказы</Link>
            <Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-6 font-black text-[color:var(--text)]">Вернуться в магазин</Link>
          </div>
        </div>
      </section>
    </Container>
  );
}

export default function OrderSuccessPage() {
  return <Suspense fallback={<Container size="narrow" className="grid min-h-[72vh] place-items-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--stroke)] border-t-[color:var(--accent)]" /></Container>}><OrderSuccessContent /></Suspense>;
}
