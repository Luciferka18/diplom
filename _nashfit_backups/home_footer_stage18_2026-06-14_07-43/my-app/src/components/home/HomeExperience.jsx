"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  HeartPulse,
  Info,
  LocateFixed,
  MapPin,
  Navigation,
  Package,
  Phone,
  Play,
  Route,
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

const money = (value = 0) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(Number(value || 0));

const number = (value = 0) => new Intl.NumberFormat("ru-RU").format(Number(value || 0));

const fallbackLocations = [
  {
    id: "center",
    name: "НашФит Центр",
    address: "ул. Спортивная, 10",
    phone: "+7 (999) 000-00-00",
    working_hours: "Пн–Пт: 07:00–23:00, Сб–Вс: 08:00–22:00",
    description: "Флагманский зал с силовой зоной, кардио, групповыми классами и вводными тренировками для новичков.",
    features: ["Силовая зона", "Кардио", "Групповые классы", "Персональные тренировки"],
  },
  {
    id: "north",
    name: "НашФит Север",
    address: "пр. Ленина, 45",
    phone: "+7 (999) 100-20-30",
    working_hours: "Ежедневно: 08:00–22:00",
    description: "Уютный клуб рядом с домом: тренажёры, свободные веса, зона растяжки и спокойная атмосфера.",
    features: ["Свободные веса", "Растяжка", "Тренеры", "Душевые"],
  },
];

const fallbackGroups = [
  {
    key: "chest",
    label: "Грудь",
    short_label: "Грудные мышцы",
    description: "Жимы, отжимания и контроль лопаток: база для сильного верха тела и уверенной осанки.",
    view: "front",
    focus: ["жим", "отжимания", "плечевой контроль"],
  },
  {
    key: "shoulders",
    label: "Плечи",
    short_label: "Плечевой пояс",
    description: "Мобильность, стабильность и сила плеч: безопасные жимы, махи и работа с резинками.",
    view: "front",
    focus: ["мобильность", "стабилизация", "жимы"],
  },
  {
    key: "arms",
    label: "Руки",
    short_label: "Бицепс и трицепс",
    description: "Сила хвата, бицепс, трицепс и техника тяговых движений без перегрузки локтей.",
    view: "front",
    focus: ["хват", "тяги", "трицепс"],
  },
  {
    key: "core",
    label: "Кор",
    short_label: "Пресс и стабилизаторы",
    description: "Центр тела: планки, дыхание, антискручивания и контроль корпуса в базовых упражнениях.",
    view: "front",
    focus: ["планка", "стабилизация", "дыхание"],
  },
  {
    key: "legs",
    label: "Ноги",
    short_label: "Бёдра и голени",
    description: "Приседания, выпады, тяги и работа стопы: сила ног, устойчивость и выносливость.",
    view: "front",
    focus: ["присед", "выпады", "икры"],
  },
  {
    key: "back",
    label: "Спина",
    short_label: "Широчайшие и поясница",
    description: "Тяги, осанка, разгибатели и безопасная техника для здоровой спины.",
    view: "back",
    focus: ["тяги", "осанка", "поясница"],
  },
  {
    key: "glutes",
    label: "Ягодицы",
    short_label: "Ягодичные мышцы",
    description: "Ягодичный мост, тяги, отведения и стабильность таза для сильного движения.",
    view: "back",
    focus: ["мост", "отведения", "тяга"],
  },
  {
    key: "mobility",
    label: "Мобильность",
    short_label: "Восстановление и всё тело",
    description: "Растяжка, мягкая силовая работа, дыхание и восстановление между интенсивными тренировками.",
    view: "back",
    focus: ["растяжка", "дыхание", "восстановление"],
  },
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function displayPrice(value) {
  const numberValue = Number(value || 0);
  if (!numberValue) return "Бесплатно";
  return money(numberValue > 10000 ? numberValue / 100 : numberValue);
}

function mapSrc(location) {
  if (location?.map_url) return location.map_url;
  const text = encodeURIComponent(location?.address || "НашФит фитнес-клуб");
  return `https://yandex.ru/map-widget/v1/?text=${text}&z=14`;
}

function mapLink(location) {
  const text = encodeURIComponent(location?.address || "НашФит фитнес-клуб");
  return `https://yandex.ru/maps/?text=${text}`;
}

function SectionHeader({ eyebrow, title, description, link, linkLabel = "Смотреть все" }) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">{eyebrow}</div> : null}
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-4xl">{title}</h2>
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
      <img src={src || fallback} alt={alt || ""} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
    </div>
  );
}

function HeroStat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
      <Icon className="h-5 w-5 text-[color:var(--accent)]" />
      <div className="mt-3 text-2xl font-black text-[color:var(--text)]">{value}</div>
      <div className="text-xs text-[color:var(--muted)]">{label}</div>
    </div>
  );
}

function AboutGyms({ gym, locations = [] }) {
  const list = locations.length ? locations : fallbackLocations;
  const [activeId, setActiveId] = useState(list[0]?.id || 0);
  const active = list.find((item) => String(item.id) === String(activeId)) || list[0];
  const features = safeArray(active?.features).length ? active.features : ["Тренажёрный зал", "Кардио", "Тренеры", "Раздевалки"];

  return (
    <section id="clubs" className="px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
              <Building2 size={16} /> О нас и офлайн-залы
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-4xl">
              Онлайн-платформа и реальные клубы рядом с вами
            </h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
              {gym?.description || "НашФит объединяет бесплатные программы, магазин, тренеров и офлайн-залы. Новичок может начать с контента на сайте, а затем прийти в клуб на пробные посещения или персональную тренировку."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <Clock3 className="h-5 w-5 text-[color:var(--accent)]" />
                <div className="mt-3 text-sm font-black uppercase tracking-[0.1em] text-[color:var(--muted)]">График</div>
                <div className="mt-1 font-bold text-[color:var(--text)]">{active?.working_hours || gym?.working_hours || "Ежедневно, 07:00–23:00"}</div>
              </div>
              <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                <Phone className="h-5 w-5 text-[color:var(--accent)]" />
                <div className="mt-3 text-sm font-black uppercase tracking-[0.1em] text-[color:var(--muted)]">Связь</div>
                <a href={`tel:${active?.phone || gym?.phone || "+79990000000"}`} className="mt-1 block font-bold text-[color:var(--text)] hover:text-[color:var(--accent)]">
                  {active?.phone || gym?.phone || "+7 (999) 000-00-00"}
                </a>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {features.map((item) => (
                <span key={item} className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text)]">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/memberships" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white transition hover:bg-[color:var(--accent-hover)]">
                Получить 3 посещения <ArrowRight size={18} />
              </Link>
              <Link href="/booking" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-5 py-3 font-black text-[color:var(--text)] transition hover:border-[color:var(--accent)]">
                Записаться к тренеру <CalendarDays size={18} />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)]">
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              <div className="border-b border-[color:var(--stroke)] p-4 lg:border-b-0 lg:border-r">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  <MapPin size={15} /> Выберите зал
                </div>
                <div className="grid gap-2">
                  {list.map((location) => {
                    const isActive = String(location.id) === String(active?.id);
                    return (
                      <button
                        key={location.id || location.name}
                        type="button"
                        onClick={() => setActiveId(location.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? "border-[color:var(--accent)] bg-[color:var(--accentGlow)]"
                            : "border-[color:var(--stroke)] bg-[color:var(--bg)] hover:border-[color:var(--accent)]/50"
                        }`}
                      >
                        <div className="font-black text-[color:var(--text)]">{location.name}</div>
                        <div className="mt-1 text-sm leading-5 text-[color:var(--muted)]">{location.address}</div>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[color:var(--accent)]">
                          <Clock3 size={14} /> {location.working_hours || "График уточняется"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-[420px]">
                <div className="h-[330px] overflow-hidden border-b border-[color:var(--stroke)] bg-[color:var(--bg)]">
                  <iframe
                    title={`Яндекс.Карта — ${active?.name || "НашФит"}`}
                    src={mapSrc(active)}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-[color:var(--text)]">{active?.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{active?.description || "Современный зал НашФит с тренерами, зонами тренировок и понятным стартом для новичков."}</p>
                    </div>
                    <a
                      href={mapLink(active)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-3 text-sm font-black text-[color:var(--text)] transition hover:border-[color:var(--accent)]"
                    >
                      Маршрут <Navigation size={17} />
                    </a>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--muted)]">
                    <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[color:var(--accent)]" /> {active?.address}</span>
                    <span className="inline-flex items-center gap-2"><Phone size={16} className="text-[color:var(--accent)]" /> {active?.phone || "Телефон уточняется"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BodyIllustration({ view, activeKey, onSelect }) {
  const active = (key) => activeKey === key;
  const fill = (key) => (active(key) ? "var(--accent)" : "rgba(34,183,143,.24)");
  const stroke = (key) => (active(key) ? "#ecfdf5" : "rgba(34,183,143,.72)");
  const zoneClass = "cursor-pointer transition outline-none";

  return (
    <svg viewBox="0 0 360 560" className="mx-auto h-[500px] w-full max-w-[360px]" role="img" aria-label="Наглядная карта мышц">
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(34,183,143,.22)" />
          <stop offset="100%" stopColor="rgba(34,183,143,0)" />
        </radialGradient>
      </defs>
      <rect x="16" y="16" width="328" height="528" rx="40" fill="url(#bodyGlow)" />
      <g opacity="0.98">
        <circle cx="180" cy="68" r="36" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="3" />
        <rect x="160" y="103" width="40" height="34" rx="16" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="3" />
        <path d="M132 132 C111 141 98 165 96 199 L102 315 C105 350 125 374 146 384 L137 512 C136 532 156 535 164 516 L180 391 L196 516 C204 535 224 532 223 512 L214 384 C235 374 255 350 258 315 L264 199 C262 165 249 141 228 132 C209 123 151 123 132 132Z" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="3" />
        <path d="M101 154 C77 169 66 201 61 244 L48 359 C46 379 62 386 72 367 L94 278 L104 190Z" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="3" />
        <path d="M259 154 C283 169 294 201 299 244 L312 359 C314 379 298 386 288 367 L266 278 L256 190Z" fill="var(--panel)" stroke="var(--stroke)" strokeWidth="3" />
      </g>

      {view === "front" ? (
        <>
          <g role="button" tabIndex="0" onClick={() => onSelect("shoulders")} className={zoneClass}>
            <ellipse cx="117" cy="171" rx="31" ry="24" fill={fill("shoulders")} stroke={stroke("shoulders")} strokeWidth="3" />
            <ellipse cx="243" cy="171" rx="31" ry="24" fill={fill("shoulders")} stroke={stroke("shoulders")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("chest")} className={zoneClass}>
            <path d="M126 187 C146 167 173 172 177 202 L177 260 C145 257 128 238 122 210Z" fill={fill("chest")} stroke={stroke("chest")} strokeWidth="3" />
            <path d="M234 187 C214 167 187 172 183 202 L183 260 C215 257 232 238 238 210Z" fill={fill("chest")} stroke={stroke("chest")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("arms")} className={zoneClass}>
            <ellipse cx="87" cy="262" rx="21" ry="78" transform="rotate(7 87 262)" fill={fill("arms")} stroke={stroke("arms")} strokeWidth="3" />
            <ellipse cx="273" cy="262" rx="21" ry="78" transform="rotate(-7 273 262)" fill={fill("arms")} stroke={stroke("arms")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("core")} className={zoneClass}>
            <path d="M142 266 C158 257 202 257 218 266 L211 372 C200 390 160 390 149 372Z" fill={fill("core")} stroke={stroke("core")} strokeWidth="3" />
            <path d="M180 275 L180 373 M154 311 L206 311 M152 346 L208 346" fill="none" stroke={stroke("core")} strokeWidth="2" opacity="0.8" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("legs")} className={zoneClass}>
            <path d="M146 389 C160 383 177 390 177 416 L164 515 C160 533 140 530 139 510Z" fill={fill("legs")} stroke={stroke("legs")} strokeWidth="3" />
            <path d="M214 389 C200 383 183 390 183 416 L196 515 C200 533 220 530 221 510Z" fill={fill("legs")} stroke={stroke("legs")} strokeWidth="3" />
          </g>
        </>
      ) : (
        <>
          <g role="button" tabIndex="0" onClick={() => onSelect("shoulders")} className={zoneClass}>
            <ellipse cx="117" cy="171" rx="31" ry="24" fill={fill("shoulders")} stroke={stroke("shoulders")} strokeWidth="3" />
            <ellipse cx="243" cy="171" rx="31" ry="24" fill={fill("shoulders")} stroke={stroke("shoulders")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("back")} className={zoneClass}>
            <path d="M124 188 C145 166 170 176 178 203 L174 342 C145 332 128 302 122 255Z" fill={fill("back")} stroke={stroke("back")} strokeWidth="3" />
            <path d="M236 188 C215 166 190 176 182 203 L186 342 C215 332 232 302 238 255Z" fill={fill("back")} stroke={stroke("back")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("arms")} className={zoneClass}>
            <ellipse cx="87" cy="262" rx="21" ry="78" transform="rotate(7 87 262)" fill={fill("arms")} stroke={stroke("arms")} strokeWidth="3" />
            <ellipse cx="273" cy="262" rx="21" ry="78" transform="rotate(-7 273 262)" fill={fill("arms")} stroke={stroke("arms")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("glutes")} className={zoneClass}>
            <ellipse cx="158" cy="382" rx="34" ry="38" fill={fill("glutes")} stroke={stroke("glutes")} strokeWidth="3" />
            <ellipse cx="202" cy="382" rx="34" ry="38" fill={fill("glutes")} stroke={stroke("glutes")} strokeWidth="3" />
          </g>
          <g role="button" tabIndex="0" onClick={() => onSelect("legs")} className={zoneClass}>
            <path d="M146 408 C160 402 177 409 177 432 L164 515 C160 533 140 530 139 510Z" fill={fill("legs")} stroke={stroke("legs")} strokeWidth="3" />
            <path d="M214 408 C200 402 183 409 183 432 L196 515 C200 533 220 530 221 510Z" fill={fill("legs")} stroke={stroke("legs")} strokeWidth="3" />
          </g>
        </>
      )}
    </svg>
  );
}

function RecommendationMiniCard({ type, item }) {
  if (!item) return null;
  const config = {
    program: { label: "Программа", href: `/programs/${item.id}`, title: item.title, text: `${item.duration_weeks || 1} нед. · ${item.level || "уровень"}`, icon: Dumbbell, fallback: "/demo/covers/functional.svg" },
    trainer: { label: "Тренер", href: `/trainers/${item.id}`, title: item.name, text: item.specialization || "Персональный тренер", icon: Users, fallback: "/demo/trainers/anna-volkova.svg" },
    article: { label: "Статья", href: `/articles/${item.id}`, title: item.title, text: item.excerpt || "Материал по теме", icon: BookOpen, fallback: "/demo/covers/nutrition.svg" },
    product: { label: "Товар", href: `/shop/${item.id}`, title: item.name || item.title, text: displayPrice(item.price), icon: ShoppingBag, fallback: "/demo/products/equipment.svg" },
  }[type];
  const Icon = config.icon;
  return (
    <Link href={config.href} className="group flex gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/50">
      <Media src={item.image_url || item.photo_url || item.cover_image_url} alt={config.title} fallback={config.fallback} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-[color:var(--accent)]"><Icon size={14} /> {config.label}</div>
        <div className="mt-1 line-clamp-1 font-extrabold text-[color:var(--text)]">{config.title}</div>
        <div className="mt-0.5 line-clamp-1 text-xs text-[color:var(--muted)]">{config.text}</div>
      </div>
      <ArrowRight size={17} className="shrink-0 text-[color:var(--muted)] transition group-hover:translate-x-1 group-hover:text-[color:var(--accent)]" />
    </Link>
  );
}

function MuscleExplorer({ groups }) {
  const safeGroups = groups?.length ? groups.map((group) => ({ ...fallbackGroups.find((item) => item.key === group.key), ...group })) : fallbackGroups;
  const [activeKey, setActiveKey] = useState(safeGroups[0]?.key || "chest");
  const [view, setView] = useState(safeGroups.find((item) => item.key === activeKey)?.view || "front");
  const active = useMemo(() => safeGroups.find((item) => item.key === activeKey) || safeGroups[0], [safeGroups, activeKey]);

  function selectGroup(key) {
    const item = safeGroups.find((group) => group.key === key);
    setActiveKey(key);
    if (item?.view) setView(item.view);
  }

  const visible = safeGroups.filter((item) => item.view === view || item.key === "mobility");

  return (
    <section className="px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Карта мышц v2"
          title="Наглядно выберите зону тела — получите программу, тренера и товары"
          description="Карта стала крупнее и понятнее: переключайте вид спереди/сзади, нажимайте на мышцы и сразу переходите к полезному контенту."
        />
        <div className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[0_24px_80px_rgba(0,0,0,.10)] dark:shadow-[0_30px_90px_rgba(0,0,0,.28)]">
          <div className="grid lg:grid-cols-[480px_1fr]">
            <div className="relative border-b border-[color:var(--stroke)] bg-[radial-gradient(circle_at_50%_28%,rgba(34,183,143,.20),transparent_58%)] p-5 lg:border-b-0 lg:border-r lg:p-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">Интерактивное тело</div>
                  <div className="mt-1 text-xl font-black text-[color:var(--text)]">{view === "front" ? "Вид спереди" : "Вид сзади"}</div>
                </div>
                <div className="flex rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-1">
                  {[{ key: "front", label: "Спереди" }, { key: "back", label: "Сзади" }].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => {
                        setView(item.key);
                        const first = safeGroups.find((group) => group.view === item.key);
                        if (first) setActiveKey(first.key);
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-black transition ${view === item.key ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)] hover:text-[color:var(--text)]"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <BodyIllustration view={view} activeKey={activeKey} onSelect={selectGroup} />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {visible.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => selectGroup(item.key)}
                    className={`rounded-2xl border px-3 py-3 text-left text-sm font-bold transition ${activeKey === item.key ? "border-[color:var(--accent)] bg-[color:var(--accentGlow)] text-[color:var(--text)]" : "border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/50 hover:text-[color:var(--text)]"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 md:p-8 lg:p-10">
              <div className="rounded-[1.7rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 md:p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
                  <Target size={15} /> {active?.short_label || active?.label}
                </div>
                <h3 className="mt-4 text-3xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-4xl">Фокус: {active?.label}</h3>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted)]">{active?.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(active?.focus || []).map((item) => (
                    <span key={item} className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text)]">{item}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <RecommendationMiniCard type="program" item={active?.program} />
                <RecommendationMiniCard type="trainer" item={active?.trainer} />
                <RecommendationMiniCard type="article" item={active?.article} />
                <RecommendationMiniCard type="product" item={active?.product} />
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-[1.7rem] border border-[color:var(--stroke)] bg-[linear-gradient(135deg,rgba(34,183,143,.12),transparent)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-black text-[color:var(--text)]">Нужна безопасная техника?</div>
                  <div className="mt-1 text-sm text-[color:var(--muted)]">Тренер подберёт упражнения под выбранную зону и ваш уровень.</div>
                </div>
                <Link href="/booking" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white">
                  Записаться <ArrowRight size={18} />
                </Link>
              </div>
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
      <Media src={item.image_url || item.cover_image_url} alt={item.title} className="aspect-[16/10]" />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[color:var(--muted)]">
          <span className="rounded-full bg-[color:var(--accentGlow)] px-2.5 py-1 text-[color:var(--accent)]">Бесплатно</span>
          <span>{item.level || "Для любого уровня"}</span>
          <span>·</span>
          <span>{item.duration_weeks || 1} нед.</span>
        </div>
        <h3 className="mt-3 text-xl font-black tracking-[-0.02em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
        <div className="mt-5 flex items-center justify-between font-bold text-[color:var(--text)]">
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
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300"><BadgeCheck size={15} /> Тренер НашФит</div>
        <h3 className="mt-2 text-xl font-black">{item.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/70">{item.specialization}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/65">
          <span>{item.experience_years || 1} лет опыта</span>
          {Number(item.avg_rating) > 0 ? <span className="inline-flex items-center gap-1"><Star size={13} fill="currentColor" className="text-amber-300" /> {item.avg_rating}</span> : null}
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
        <h3 className="mt-2 line-clamp-2 min-h-[48px] font-extrabold text-[color:var(--text)] group-hover:text-[color:var(--accent)]">{item.name || item.title}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-black text-[color:var(--text)]">{displayPrice(item.price)}</div>
            {item.old_price ? <div className="text-xs text-[color:var(--muted)] line-through">{displayPrice(item.old_price)}</div> : null}
          </div>
          <div className="rounded-xl bg-[color:var(--accent)] p-2.5 text-white"><ShoppingBag size={18} /></div>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ item, featured = false }) {
  return (
    <Link href={`/articles/${item.id}`} className={`group overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] ${featured ? "grid md:grid-cols-[1.1fr_.9fr]" : ""}`}>
      <Media src={item.cover_image_url || item.image_url} alt={item.title} fallback="/demo/covers/nutrition.svg" className={featured ? "min-h-[300px]" : "aspect-[16/10]"} />
      <div className="p-5 md:p-6">
        <div className="text-xs font-black uppercase tracking-[0.13em] text-[color:var(--accent)]">Журнал НашФит</div>
        <h3 className={`${featured ? "text-2xl md:text-3xl" : "text-xl"} mt-3 font-black tracking-[-0.02em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]`}>{item.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{item.excerpt || item.description}</p>
        <div className="mt-5 inline-flex items-center gap-2 font-bold text-[color:var(--accent)]">Читать <ArrowRight size={17} /></div>
      </div>
    </Link>
  );
}

function MembershipCard({ item, featured = false }) {
  return (
    <Link href="/memberships" className={`rounded-[1.7rem] border p-6 transition hover:-translate-y-0.5 ${featured ? "border-[color:var(--accent)] bg-[color:var(--accentGlow)]" : "border-[color:var(--stroke)] bg-[color:var(--panel)]"}`}>
      <div className="text-sm font-black uppercase tracking-[0.13em] text-[color:var(--accent)]">{item.badge || "Абонемент"}</div>
      <h3 className="mt-3 text-2xl font-black text-[color:var(--text)]">{item.name}</h3>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[color:var(--muted)]">{item.description}</p>
      <div className="mt-5 text-3xl font-black text-[color:var(--text)]">{displayPrice(item.price)}</div>
      <div className="mt-5 flex items-center gap-2 font-black text-[color:var(--accent)]">Подробнее <ArrowRight size={18} /></div>
    </Link>
  );
}

export default function HomeExperience({ data = {} }) {
  const stats = data.stats || {};
  const promotion = data.promotion;
  const trial = data.trial_membership;
  const programs = safeArray(data.programs).slice(0, 4);
  const trainers = safeArray(data.trainers).slice(0, 4);
  const products = safeArray(data.products).slice(0, 4);
  const articles = safeArray(data.articles).slice(0, 3);
  const memberships = safeArray(data.memberships).slice(0, 3);
  const locations = safeArray(data.locations);

  return (
    <main className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <section className="relative overflow-hidden px-4 py-12 md:px-8 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,183,143,.18),transparent_34%),radial-gradient(circle_at_85%_8%,rgba(6,182,212,.14),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">
              <Sparkles size={16} /> Фитнес-клуб и платформа
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[color:var(--text)] md:text-7xl">
              Начните онлайн, продолжайте в зале с тренером
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Бесплатные программы, журнал, магазин, записи к тренерам и реальные офлайн-залы — всё собрано в одном понятном маршруте.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/memberships" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 py-4 font-black text-white shadow-[0_16px_40px_var(--accentGlow)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-hover)]">
                {trial?.name || "3 бесплатных посещения"} <ArrowRight size={19} />
              </Link>
              <Link href="#clubs" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-6 py-4 font-black text-[color:var(--text)] transition hover:border-[color:var(--accent)]">
                Где находятся залы <MapPin size={18} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-[color:var(--accent)]" /> Без скрытой оплаты</span>
              <span className="inline-flex items-center gap-2"><Trophy size={18} className="text-[color:var(--accent)]" /> Прогресс в кабинете</span>
              <span className="inline-flex items-center gap-2"><LocateFixed size={18} className="text-[color:var(--accent)]" /> Офлайн-залы на карте</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[color:var(--accentGlow)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[0_35px_90px_rgba(0,0,0,.12)] dark:shadow-[0_35px_90px_rgba(0,0,0,.32)] md:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-[color:var(--stroke)] pb-5">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.17em] text-[color:var(--accent)]">Ваш быстрый старт</div>
                  <div className="mt-2 text-2xl font-black text-[color:var(--text)]">{trial?.name || "3 бесплатных посещения"}</div>
                  <div className="mt-1 text-sm text-[color:var(--muted)]">Вводная тренировка, знакомство с залом и подбор цели.</div>
                </div>
                <div className="rounded-2xl bg-[color:var(--accentGlow)] p-3 text-[color:var(--accent)]"><Zap size={25} /></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <HeroStat icon={Users} value={number(stats.trainers)} label="тренеров" />
                <HeroStat icon={Dumbbell} value={number(stats.programs)} label="программ" />
                <HeroStat icon={Package} value={number(stats.products)} label="товаров" />
                <HeroStat icon={Star} value={stats.rating || "—"} label="рейтинг" />
              </div>
              {promotion ? (
                <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-500 dark:text-amber-300"><Sparkles size={15} /> {promotion.badge || "Акция"}</div>
                  <div className="mt-2 font-black text-[color:var(--text)]">{promotion.banner_title || promotion.name}</div>
                  <div className="mt-1 text-sm text-[color:var(--muted)]">{promotion.banner_text || promotion.description}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <AboutGyms gym={data.gym} locations={locations} />

      <section className="border-y border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 py-6 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            { icon: Target, title: "Выберите цель", text: "Программа, статьи и товары под ваш уровень." },
            { icon: HeartPulse, title: "Тренируйтесь регулярно", text: "Отмечайте прогресс и сохраняйте мотивацию." },
            { icon: Route, title: "Приходите в зал", text: "Адреса, график и карта всегда на главной." },
          ].map((item, index) => (
            <div key={item.title} className="flex items-center gap-4 rounded-2xl p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><item.icon size={23} /></div>
              <div><div className="text-xs font-black text-[color:var(--accent)]">0{index + 1}</div><div className="font-black text-[color:var(--text)]">{item.title}</div><div className="text-sm text-[color:var(--muted)]">{item.text}</div></div>
            </div>
          ))}
        </div>
      </section>

      <MuscleExplorer groups={data.muscle_groups} />

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Бесплатные программы" title="Начните сегодня — без оплаты и сложного старта" description="Выберите цель, выполняйте готовый план и отмечайте прогресс в личном кабинете." link="/programs" />
          {programs.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{programs.map((item) => <ProgramCard item={item} key={item.id} />)}</div> : <div className="rounded-3xl border border-dashed border-[color:var(--stroke)] p-10 text-center text-[color:var(--muted)]">Программы появятся после запуска демо-сидера.</div>}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Команда клуба" title="Тренеры, которым можно доверить свой результат" description="Выберите специалиста по цели, посмотрите расписание и запишитесь на вводную или персональную тренировку." link="/trainers" />
          {trainers.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{trainers.map((item) => <TrainerCard item={item} key={item.id} />)}</div> : null}
          <div className="mt-7 flex flex-col items-start justify-between gap-5 rounded-[1.7rem] border border-[color:var(--accent)]/40 bg-[linear-gradient(120deg,rgba(34,183,143,.13),transparent)] p-6 md:flex-row md:items-center">
            <div><div className="text-xl font-black text-[color:var(--text)]">Не знаете, кого выбрать?</div><p className="mt-1 text-[color:var(--muted)]">Запишитесь на бесплатную вводную тренировку — мы определим цель и подберём специалиста.</p></div>
            <Link href="/booking" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white">Выбрать время <CalendarDays size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Журнал НашФит" title="Экспертные материалы, которые превращаются в действие" description="Читайте бесплатно, сохраняйте полезное и сразу переходите к подходящей программе или тренировке." link="/articles" />
          {articles.length ? <div className="grid gap-5 lg:grid-cols-2"><ArticleCard item={articles[0]} featured /><div className="grid gap-5 sm:grid-cols-2">{articles.slice(1, 3).map((item) => <ArticleCard item={item} key={item.id} />)}</div></div> : null}
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
          <div className="grid gap-5 md:grid-cols-3">{memberships.map((item, index) => <MembershipCard item={item} key={item.id} featured={Boolean(item.is_featured || index === 1)} />)}</div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-8 md:pb-14">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-7 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--accent)]">НашФит рядом</div>
              <h2 className="mt-3 text-3xl font-black text-[color:var(--text)] md:text-4xl">Попробуйте зал без риска: 3 посещения бесплатно</h2>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
                <span className="inline-flex items-center gap-2"><MapPin size={17} className="text-[color:var(--accent)]" /> {locations[0]?.address || data.gym?.address || "ул. Спортивная, 10"}</span>
                <span className="inline-flex items-center gap-2"><Clock3 size={17} className="text-[color:var(--accent)]" /> {locations[0]?.working_hours || data.gym?.working_hours || "Ежедневно, 07:00–23:00"}</span>
              </div>
            </div>
            <Link href="/memberships" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 py-4 font-black text-white">Получить предложение <ArrowRight size={19} /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl"><HomeReviews /></div>
      </section>
    </main>
  );
}
