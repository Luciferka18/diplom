"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/services/api";
import { CalendarRange, Gift, ArrowRight } from "lucide-react";

export default function ActiveMembershipCard() {
  const [item, setItem] = useState(null);
  useEffect(() => {
    let active = true;
    apiGet("/account/memberships").then((r) => {
      const list = r?.data || [];
      const paid = list.find((x) => x.status === "active" && !x.is_trial_grant);
      const trial = list.find((x) => x.status === "active");
      if (active) setItem(paid || trial || null);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  if (!item) return null;
  return (
    <Link href="/account/membership" className="group block overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-r from-emerald-400/15 via-cyan-400/10 to-transparent p-5 transition hover:border-emerald-400/45">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{item.is_trial_grant ? <Gift className="h-6 w-6" /> : <CalendarRange className="h-6 w-6" />}</div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-emerald-300">{item.is_trial_grant ? "Пробное предложение" : "Активный абонемент"}</div><div className="mt-1 text-xl font-black text-[color:var(--text)]">{item.membership?.name}</div><div className="mt-1 text-sm text-[color:var(--muted)]">До {item.ends_at ? new Date(item.ends_at).toLocaleDateString("ru-RU") : "без ограничения"}</div></div>
        </div>
        <span className="flex items-center gap-2 text-sm font-bold text-emerald-300">Подробнее <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}
