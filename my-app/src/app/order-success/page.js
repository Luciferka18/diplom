"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-12">
      <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-emerald-400/20" />
        <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--text)] dark:text-white">
          Заказ оформлен
        </h1>

        <p className="mt-2 text-[color:var(--muted)] dark:text-white/70">
          {orderId ? (
            <>
              Номер заказа: <b className="text-[color:var(--text)] dark:text-white">#{orderId}</b>
            </>
          ) : (
            "Мы получили ваш заказ."
          )}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
          >
            В магазин
          </Link>
          <Link
            href="/account/orders"
            className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] hover:bg-[color:var(--panel)] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-10 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-emerald-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
