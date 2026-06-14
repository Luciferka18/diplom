"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  HeartPulse,
  MapPin,
  Package,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import HomeReviews from "@/components/HomeReviews";

const productMoney = (value = 0) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const billingMoney = (value = 0) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value || 0) / 100);

const number = (value = 0) => new Intl.NumberFormat("ru-RU").format(Number(value || 0));

const fallbackGroups = [
  {
    key: "chest",
    label: "Грудь",
    short_label: "Грудные мышцы",
    description: "Сила верхней части тела, техника жимов и уверенная осанка.",
    view: "front",
  },
  {
    key: "shoulders",
    label: "Плечи",
    short_label: "Плечевой пояс",
    description: "Мобильность плеч, стабильность суставов и выразительный силуэт.",
    view: "front",
  },
  {
    key: "arms",
    label: "Руки",
    short_label: "Бицепс и трицепс",
    description: "Развитие силы рук, хвата и техники упражнений с отягощением.",
    view: "front",
  },
  {
    key: "core",
    label: "Корпус",
    short_label: "Пресс и мышцы кора",
    description: "Сильный центр тела, баланс и контроль движения.",
    view: "front",
  },
  {
    key: "legs",
    label: "Ноги",
    short_label: "Бёдра и голени",
    description: "Сила ног, беговая выносливость и устойчивость в движении.",
    view: "front",
  },
  {
    key: "back",
    label: "Спина",
    short_label: "Широчайшие и поясница",
    description: "Здоровая спина, осанка и безопасная техника тяг.",
    view: "back",
  },
  {
    key: "glutes",
    label: "Ягодицы",
    short_label: "Ягодичные мышцы",
    description: "Сильный таз, стабильные колени и мощное движение.",
    view: "back",
  },
  {
    key: "mobility",
    label: "Всё тело",
    short_label: "Мобильность и восстановление",
    description: "Снятие напряжения, развитие гибкости и качественное восстановление.",
    view: "back",
  },
];

function safeImage(value, fallback) {
  return value || fallback;
}

function SectionHeader({ eyebrow, title, description, link, linkLabel = "Смотреть все" }) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-3xl font-black tracking-[-0.03em] md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-[color:var(--muted)]">{description}</p> : null}
      </div>
      {link ? (
        <Link href={link} className="inline-flex items-center gap-2 font-bold text-[color:var(--accent)] hover:gap-3">
          {linkLabel} <ArrowRight size={18} />
        </Link>
      ) : null}
    </div>
  );
}

function Media({ src, alt, className = "", fallback = "/demo/covers/functional.svg" }) {
  return (
    <div className={`overflow-hidden bg-[color:var(--bg2)] ${className}`}>
      <img
        src={safeImage(src, fallback)}
        alt={alt || ""}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );
}

function BodyBase({ back = false }) {
  return (
    <g opacity="0.95">
      <circle cx="130" cy="47" r="31" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="2" />
      <rect x="116" y="74" width="28" height="29" rx="12" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="2" />
      <path
        d="M96 99 C74 105 65 128 66 158 L72 270 C74 301 88 322 103 333 L94 481 C93 500 105 510 119 498 L130 355 L141 498 C155 510 167 500 166 481 L157 333 C172 322 186 301 188 270 L194 158 C195 128 186 105 164 99 C151 94 109 94 96 99Z"
        fill="var(--panel)"
        stroke="var(--stroke)"
        strokeWidth="2"
      />
      <path
        d="M75 116 C57 127 48 150 43 185 L32 294 C30 311 40 319 50 306 L68 228 L76 163Z"
        fill="var(--panel)"
        stroke="var(--stroke)"
        strokeWidth="2"
      />
      <path
        d="M185 116 C203 127 212 150 217 185 L228 294 C230 311 220 319 210 306 L192 228 L184 163Z"
        fill="var(--panel)"
        stroke="var(--stroke)"
        strokeWidth="2"
      />
      {!back ? (
        <path d="M130 108 L130 323" stroke="var(--stroke)" strokeWidth="1" opacity="0.35" />
      ) : (
        <path d="M130 104 L130 325" stroke="var(--stroke)" strokeWidth="2" opacity="0.45" />
      )}
    </g>
  );
}

function Zone({ active, label, onClick, children }) {
  return (
    <g
      role="button"
      tabIndex="0"
      aria-label={label}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      className="cursor-pointer outline-none"
      style={{
        fill: active ? "var(--accent)" : "rgba(34, 183, 143, 0.22)",
        stroke: active ? "#ecfdf5" : "rgba(34, 183, 143, 0.82)",
        strokeWidth: active ? 2.5 : 1.5,
        filter: active ? "drop-shadow(0 0 10px rgba(34,183,143,.72))" : "none",
      }}
    >
      {children}
    </g>
  );
}

function MuscleBody({ view, activeKey, onSelect }) {
  const back = view === "back";

  return (
    <svg viewBox="0 0 260 525" className="mx-auto h-[430px] w-full max-w-[290px]" aria-label="Интерактивная карта мышц">
      <BodyBase back={back} />

      {!back ? (
        <>
          <Zone active={activeKey === "shoulders"} label="Плечи" onClick={() => onSelect("shoulders")}>
            <ellipse cx="86" cy="130" rx="23" ry="18" />
            <ellipse cx="174" cy="130" rx="23" ry="18" />
          </Zone>
          <Zone active={activeKey === "chest"} label="Грудь" onClick={() => onSelect("chest")}>
            <path d="M92 143 C105 132 124 133 128 153 L128 198 C108 197 96 184 91 162Z" />
            <path d="M168 143 C155 132 136 133 132 153 L132 198 C152 197 164 184 169 162Z" />
          </Zone>
          <Zone active={activeKey === "arms"} label="Руки" onClick={() => onSelect("arms")}>
            <ellipse cx="59" cy="189" rx="15" ry="48" transform="rotate(7 59 189)" />
            <ellipse cx="201" cy="189" rx="15" ry="48" transform="rotate(-7 201 189)" />
          </Zone>
          <Zone active={activeKey === "core"} label="Корпус" onClick={() => onSelect("core")}>
            <path d="M103 201 C113 196 147 196 157 201 L153 296 C145 310 115 310 107 296Z" />
            <path d="M130 207 L130 299 M111 235 L149 235 M109 266 L151 266" fill="none" />
          </Zone>
          <Zone active={activeKey === "legs"} label="Ноги" onClick={() => onSelect("legs")}>
            <path d="M104 322 C113 317 126 321 127 341 L118 477 C116 489 102 488 100 475Z" />
            <path d="M156 322 C147 317 134 321 133 341 L142 477 C144 489 158 488 160 475Z" />
          </Zone>
        </>
      ) : (
        <>
          <Zone active={activeKey === "shoulders"} label="Плечи" onClick={() => onSelect("shoulders")}>
            <ellipse cx="86" cy="130" rx="23" ry="18" />
            <ellipse cx="174" cy="130" rx="23" ry="18" />
          </Zone>
          <Zone active={activeKey === "back"} label="Спина" onClick={() => onSelect("back")}>
            <path d="M93 143 C108 132 121 137 128 153 L126 268 C109 263 96 245 91 211Z" />
            <path d="M167 143 C152 132 139 137 132 153 L134 268 C151 263 164 245 169 211Z" />
          </Zone>
          <Zone active={activeKey === "arms"} label="Руки" onClick={() => onSelect("arms")}>
            <ellipse cx="59" cy="189" rx="15" ry="48" transform="rotate(7 59 189)" />
            <ellipse cx="201" cy="189" rx="15" ry="48" transform="rotate(-7 201 189)" />
          </Zone>
          <Zone active={activeKey === "glutes"} label="Ягодицы" onClick={() => onSelect("glutes")}>
            <ellipse cx="113" cy="296" rx="22" ry="25" />
            <ellipse cx="147" cy="296" rx="22" ry="25" />
          </Zone>
          <Zone active={activeKey === "legs"} label="Ноги" onClick={() => onSelect("legs")}>
            <path d="M104 322 C113 317 126 321 127 341 L118 477 C116 489 102 488 100 475Z" />
            <path d="M156 322 C147 317 134 321 133 341 L142 477 C144 489 158 488 160 475Z" />
          </Zone>
        </>
      )}
    </svg>
  );
}

function RecommendationMiniCard({ type, item }) {
  if (!item) return null;

  const config = {
    program: {
      label: "Бесплатная программа",
      title: item.title,
      text: `${item.duration_weeks || 1} нед. · ${item.level || "Для любого уровня"}`,
      href: `/programs/${item.id}`,
      image: item.image_url,
      fallback: "/demo/covers/functional.svg",
      icon: <Play size={15} />,
    },
    trainer: {
      label: "Подходящий тренер",
      title: item.name,
      text: item.specialization || "Персональный тренер",
      href: `/trainers/${item.id}`,
      image: item.photo_url,
      fallback: "/demo/trainers/anna-volkova.svg",
      icon: <Users size={15} />,
    },
    article: {
      label: "Материал эксперта",
      title: item.title,
      text: `${item.reading_time_minutes || 5} мин чтения`,
      href: `/articles/${item.slug || item.id}`,
      image: item.cover_image_url,
      fallback: "/demo/covers/recovery.svg",
      icon: <Sparkles size={15} />,
    },
    product: {
      label: "Полезный инвентарь",
      title: item.name || item.title,
      text: productMoney(item.price),
      href: `/shop/${item.id}`,
      image: item.image_url,
      fallback: "/demo/products/equipment.svg",
      icon: <Package size={15} />,
    },
  }[type];

  return (
    <Link
      href={config.href}
      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--panel)]"
    >
      <Media src={config.image} alt={config.title} fallback={config.fallback} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[color:var(--accent)]">
          {config.icon} {config.label}
        </div>
        <div className="mt-1 line-clamp-1 font-extrabold">{config.title}</div>
        <div className="mt-0.5 line-clamp-1 text-xs text-[color:var(--muted)]">{config.text}</div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-[color:var(--muted)] transition group-hover:translate-x-1 group-hover:text-[color:var(--accent)]" />
    </Link>
  );
}

function MuscleExplorer({ groups }) {
  const safeGroups = groups?.length ? groups : fallbackGroups;
  const [activeKey, setActiveKey] = useState(safeGroups[0]?.key || "chest");
  const [view, setView] = useState(safeGroups.find((item) => item.key === activeKey)?.view || "front");

  const active = useMemo(
    () => safeGroups.find((item) => item.key === activeKey) || safeGroups[0],
    [safeGroups, activeKey]
  );

  function selectGroup(key) {
    const item = safeGroups.find((group) => group.key === key);
    setActiveKey(key);
    if (item?.view) setView(item.view);
  }

  return (
    <section className="px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Навигатор по телу"
          title="Выберите мышечную группу — мы соберём путь к результату"
          description="Нажмите на область тела и получите бесплатную программу, материал тренера, специалиста и подходящий инвентарь."
        />

        <div className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[0_30px_80px_rgba(0,0,0,.16)]">
          <div className="grid lg:grid-cols-[430px_1fr]">
            <div className="relative border-b border-[color:var(--stroke)] bg-[radial-gradient(circle_at_50%_30%,rgba(34,183,143,.15),transparent_56%)] p-5 lg:border-b-0 lg:border-r lg:p-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">Карта мышц</div>
                  <div className="mt-1 font-extrabold">Интерактивный выбор</div>
                </div>
                <div className="flex rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-1">
                  {[{ key: "front", label: "Спереди" }, { key: "back", label: "Сзади" }].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => {
                        setView(item.key);
                        const first = safeGroups.find((group) => group.view === item.key);
                        if (first) setActiveKey(first.key);
                      }}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        view === item.key ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <MuscleBody view={view} activeKey={activeKey} onSelect={selectGroup} />

              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {safeGroups
                  .filter((item) => item.view === view || item.key === "mobility")
                  .map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => selectGroup(item.key)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        activeKey === item.key
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                          : "border-[color:var(--stroke)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-5 md:p-8 lg:p-10">
              <div className="flex flex-col gap-5 border-b border-[color:var(--stroke)] pb-7 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
                    <Target size={15} /> {active?.short_label || active?.label}
                  </div>
                  <h3 className="mt-4 text-3xl font-black tracking-[-0.03em] md:text-4xl">Работаем: {active?.label}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted)]">{active?.description}</p>
                </div>
                <Link
                  href="/booking"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white transition hover:bg-[color:var(--accent-hover)]"
                >
                  Записаться к тренеру <ArrowRight size={18} />
                </Link>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-2">
                <RecommendationMiniCard type="program" item={active?.program} />
                <RecommendationMiniCard type="trainer" item={active?.trainer} />
                <RecommendationMiniCard type="article" item={active?.article} />
                <RecommendationMiniCard type="product" item={active?.product} />
              </div>

              {!active?.program && !active?.trainer && !active?.article && !active?.product ? (
                <div className="mt-7 rounded-2xl border border-dashed border-[color:var(--stroke)] p-7 text-center text-[color:var(--muted)]">
                  Запустите демо-сидер, чтобы здесь появились связанные рекомендации.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ item }) {
  return (
    <Link href={`/programs/${item.id}`} className="group overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]">
      <Media src={item.image_url} alt={item.title} className="aspect-[16/10]" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[color:var(--muted)]">
          <span className="rounded-full bg-[color:var(--accentGlow)] px-2.5 py-1 text-[color:var(--accent)]">Бесплатно</span>
          <span>{item.level || "Для любого уровня"}</span>
          <span>·</span>
          <span>{item.duration_weeks || 1} нед.</span>
        </div>
        <h3 className="mt-3 text-xl font-black tracking-[-0.02em] group-hover:text-[color:var(--accent)]">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
        <div className="mt-5 flex items-center justify-between font-bold">
          <span className="text-sm">Начать программу</span>
          <ArrowRight size={18} className="text-[color:var(--accent)] transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function TrainerCard({ item }) {
  return (
    <Link href={`/trainers/${item.id}`} className="group relative overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]">
      <Media src={item.photo_url} alt={item.name} fallback="/demo/trainers/anna-volkova.svg" className="aspect-[4/4.2]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07101e] via-[#07101eea] to-transparent p-5 pt-20 text-white">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
          <BadgeCheck size={15} /> Тренер НашФит
        </div>
        <h3 className="mt-2 text-xl font-black">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/70">{item.specialization}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/65">
          <span>{item.experience_years || 1} лет опыта</span>
          {Number(item.avg_rating) > 0 ? (
            <span className="inline-flex items-center gap-1"><Star size={13} fill="currentColor" className="text-amber-300" /> {item.avg_rating}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function ProductCard({ item }) {
  return (
    <Link href={`/shop/${item.id}`} className="group rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-3">
      <Media src={item.image_url} alt={item.name} fallback="/demo/products/equipment.svg" className="aspect-square rounded-[1.1rem]" />
      <div className="p-2 pt-4">
        <div className="text-[10px] font-black uppercase tracking-[0.13em] text-[color:var(--accent)]">{item.category || item.brand || "НашФит Store"}</div>
        <h3 className="mt-2 line-clamp-2 min-h-[48px] font-extrabold group-hover:text-[color:var(--accent)]">{item.name || item.title}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-black">{productMoney(item.price)}</div>
            {item.old_price ? <div className="text-xs text-[color:var(--muted)] line-through">{productMoney(item.old_price)}</div> : null}
          </div>
          <div className="rounded-xl bg-[color:var(--accent)] p-2.5 text-white"><ShoppingBag size={18} /></div>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ item, featured = false }) {
  return (
    <Link
      href={`/articles/${item.slug || item.id}`}
      className={`group overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] ${featured ? "md:grid md:grid-cols-[1.1fr_.9fr]" : ""}`}
    >
      <Media src={item.cover_image_url} alt={item.title} fallback="/demo/covers/nutrition.svg" className={featured ? "min-h-[280px]" : "aspect-[16/9]"} />
      <div className="flex flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-[color:var(--accentGlow)] px-2.5 py-1 text-[color:var(--accent)]">{item.category || "Журнал"}</span>
          {item.is_trainer_article ? <span className="inline-flex items-center gap-1 text-[color:var(--muted)]"><BadgeCheck size={14} /> Материал тренера</span> : null}
        </div>
        <h3 className={`${featured ? "mt-5 text-3xl" : "mt-3 text-xl"} font-black tracking-[-0.025em] group-hover:text-[color:var(--accent)]`}>{item.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{item.excerpt}</p>
        <div className="mt-auto pt-5 text-sm font-bold text-[color:var(--accent)]">Читать · {item.reading_time_minutes || 5} мин</div>
      </div>
    </Link>
  );
}

function MembershipCard({ item, featured }) {
  if (!item) return null;

  return (
    <div className={`relative rounded-[1.7rem] border p-6 ${featured ? "border-[color:var(--accent)] bg-[linear-gradient(145deg,var(--panel),rgba(34,183,143,.12))]" : "border-[color:var(--stroke)] bg-[color:var(--panel)]"}`}>
      {item.badge ? <div className="inline-flex rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-black text-white">{item.badge}</div> : null}
      <h3 className="mt-4 text-2xl font-black">{item.name}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-black">{billingMoney(item.price)}</span>
        {item.old_price ? <span className="mb-1 text-sm text-[color:var(--muted)] line-through">{billingMoney(item.old_price)}</span> : null}
      </div>
      <ul className="mt-5 space-y-2.5">
        {(item.features || []).slice(0, 4).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check size={17} className="mt-0.5 shrink-0 text-[color:var(--accent)]" /> {feature}
          </li>
        ))}
      </ul>
      <Link href="/memberships" className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black ${featured ? "bg-[color:var(--accent)] text-white" : "border border-[color:var(--stroke)]"}`}>
        Выбрать тариф <ArrowRight size={17} />
      </Link>
    </div>
  );
}

export default function HomeExperience({ data = {} }) {
  const stats = data.stats || {};
  const programs = Array.isArray(data.programs) ? data.programs : [];
  const trainers = Array.isArray(data.trainers) ? data.trainers : [];
  const products = Array.isArray(data.products) ? data.products : [];
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const memberships = Array.isArray(data.memberships) ? data.memberships : [];
  const promotion = data.promotion;
  const trial = data.trial_membership;

  return (
    <main className="overflow-hidden">
      <section className="relative px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(34,183,143,.22), transparent 32%), radial-gradient(circle at 85% 15%, rgba(34,184,207,.16), transparent 30%), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "auto, auto, 44px 44px, 44px 44px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accentGlow)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">
              <Sparkles size={16} /> Фитнес-клуб и digital-платформа
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.055em] md:text-7xl">
              Тренируйтесь бесплатно онлайн. <span className="text-[color:var(--accent)]">Становитесь сильнее</span> вместе с залом.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Бесплатные программы и экспертные статьи помогают начать. Тренеры, абонементы и магазин НашФит — перейти от намерения к реальному результату.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/memberships" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 py-4 font-black text-white shadow-[0_16px_40px_var(--accentGlow)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-hover)]">
                Получить 3 бесплатных посещения <ArrowRight size={19} />
              </Link>
              <Link href="/programs" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-6 py-4 font-black transition hover:border-[color:var(--accent)]">
                <Play size={18} /> Начать бесплатную программу
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-[color:var(--accent)]" /> Без скрытой оплаты</span>
              <span className="inline-flex items-center gap-2"><Trophy size={18} className="text-[color:var(--accent)]" /> Прогресс в кабинете</span>
              <span className="inline-flex items-center gap-2"><MapPin size={18} className="text-[color:var(--accent)]" /> Реальный фитнес-клуб</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[color:var(--accentGlow)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[0_35px_90px_rgba(0,0,0,.22)] md:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-[color:var(--stroke)] pb-5">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.17em] text-[color:var(--accent)]">Ваш быстрый старт</div>
                  <div className="mt-2 text-2xl font-black">{trial?.name || "3 бесплатных посещения"}</div>
                </div>
                <div className="rounded-2xl bg-[color:var(--accentGlow)] p-3 text-[color:var(--accent)]"><Zap size={25} /></div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { icon: Users, value: number(stats.trainers), label: "тренеров" },
                  { icon: Dumbbell, value: number(stats.programs), label: "программ" },
                  { icon: Sparkles, value: number(stats.articles), label: "статей" },
                  { icon: Star, value: stats.rating || "—", label: "рейтинг" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                    <item.icon size={18} className="text-[color:var(--accent)]" />
                    <div className="mt-3 text-2xl font-black">{item.value}</div>
                    <div className="text-xs text-[color:var(--muted)]">{item.label}</div>
                  </div>
                ))}
              </div>

              {promotion ? (
                <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-400"><Sparkles size={15} /> {promotion.badge || "Акция"}</div>
                  <div className="mt-2 font-black">{promotion.banner_title || promotion.name}</div>
                  <div className="mt-1 text-sm text-[color:var(--muted)]">{promotion.banner_text || promotion.description}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 py-6 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            { icon: Target, title: "Выберите цель", text: "Программа и материалы под ваш уровень." },
            { icon: HeartPulse, title: "Двигайтесь регулярно", text: "Отмечайте прогресс и сохраняйте мотивацию." },
            { icon: Users, title: "Подключите эксперта", text: "Тренер адаптирует нагрузку и технику." },
          ].map((item, index) => (
            <div key={item.title} className="flex items-center gap-4 rounded-2xl p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><item.icon size={23} /></div>
              <div><div className="text-xs font-black text-[color:var(--accent)]">0{index + 1}</div><div className="font-black">{item.title}</div><div className="text-sm text-[color:var(--muted)]">{item.text}</div></div>
            </div>
          ))}
        </div>
      </section>

      <MuscleExplorer groups={data.muscle_groups} />

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Бесплатные программы" title="Начните сегодня — без оплаты и сложного старта" description="Выберите цель, выполняйте готовый план и отмечайте прогресс в личном кабинете." link="/programs" />
          {programs.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{programs.map((item) => <ProgramCard item={item} key={item.id} />)}</div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[color:var(--stroke)] p-10 text-center text-[color:var(--muted)]">Программы появятся после запуска демо-сидера.</div>
          )}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Команда клуба" title="Тренеры, которым можно доверить свой результат" description="Выберите специалиста по цели, посмотрите расписание и запишитесь на вводную или персональную тренировку." link="/trainers" />
          {trainers.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{trainers.map((item) => <TrainerCard item={item} key={item.id} />)}</div> : null}
          <div className="mt-7 flex flex-col items-start justify-between gap-5 rounded-[1.7rem] border border-[color:var(--accent)]/40 bg-[linear-gradient(120deg,rgba(34,183,143,.13),transparent)] p-6 md:flex-row md:items-center">
            <div><div className="text-xl font-black">Не знаете, кого выбрать?</div><p className="mt-1 text-[color:var(--muted)]">Запишитесь на бесплатную вводную тренировку — мы определим цель и подберём специалиста.</p></div>
            <Link href="/booking" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white">Выбрать время <CalendarDays size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Журнал НашФит" title="Экспертные материалы, которые превращаются в действие" description="Читайте бесплатно, сохраняйте полезное и сразу переходите к подходящей программе или тренировке." link="/articles" />
          {articles.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <ArticleCard item={articles[0]} featured />
              <div className="grid gap-5 sm:grid-cols-2">
                {articles.slice(1, 3).map((item) => <ArticleCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Магазин" title="Инвентарь и питание для вашей программы" description="Товары с вариантами, реальными остатками и рекомендациями тренеров НашФит." link="/shop" />
          {products.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((item) => <ProductCard item={item} key={item.id} />)}</div> : null}
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Абонементы" title="Когда готовы к большему — приходите в зал" description="Бесплатный контент остаётся доступным. Абонемент открывает полноценную инфраструктуру клуба и живую атмосферу тренировок." link="/memberships" linkLabel="Все тарифы" />
          <div className="grid gap-5 md:grid-cols-3">
            {memberships.map((item, index) => <MembershipCard item={item} key={item.id} featured={Boolean(item.is_featured || index === 1)} />)}
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-8 md:pb-14">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#1f3d33] bg-[#07101e] p-7 text-white shadow-[0_24px_70px_rgba(7,16,30,.22)] md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] !text-emerald-300">НашФит рядом</div>
              <h2 className="mt-3 text-3xl font-black !text-white md:text-4xl">Попробуйте зал без риска: 3 посещения бесплатно</h2>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm !text-white/75">
                <span className="inline-flex items-center gap-2"><MapPin size={17} className="!text-emerald-300" /> {data.gym?.address || "ул. Спортивная, 10"}</span>
                <span className="inline-flex items-center gap-2"><Clock3 size={17} className="!text-emerald-300" /> {data.gym?.working_hours || "Ежедневно, 07:00–23:00"}</span>
              </div>
            </div>
            <Link href="/memberships" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-6 py-4 font-black !text-[#07101e] transition hover:bg-emerald-200">Получить предложение <ArrowRight size={19} /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl"><HomeReviews /></div>
      </section>
    </main>
  );
}
