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
    label: "Корпус",
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
    label: "Всё тело",
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


function initials(name = "") {
  const parts = String(name || "NF").trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "NF";
}

function productGoal(item = {}) {
  const text = `${item.name || ""} ${item.category || ""} ${item.short_description || ""} ${item.description || ""}`.toLowerCase();
  if (text.includes("магн") || text.includes("recovery") || text.includes("восстанов")) return "Для восстановления";
  if (text.includes("креат") || text.includes("protein") || text.includes("протеин") || text.includes("сил")) return "Для силы";
  if (text.includes("эспанд") || text.includes("лента") || text.includes("резин")) return "Для разминки";
  return "Для любого уровня";
}

function productVisualType(item = {}) {
  const text = `${item.name || ""} ${item.category || ""}`.toLowerCase();
  if (text.includes("шейкер")) return "shaker";
  if (text.includes("лента") || text.includes("эспанд") || text.includes("резин")) return "band";
  if (text.includes("магн") || text.includes("recovery")) return "bottle";
  return "jar";
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
              <Building2 size={16} /> О нас
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-4xl">
              О нас
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
  const active = (key) => activeKey === key || (activeKey === "mobility" && ["chest", "shoulders", "arms", "core", "legs", "back", "glutes"].includes(key));
  const muscleFill = (key) => (active(key) ? "var(--accent)" : "rgba(47,107,79,.18)");
  const muscleOpacity = (key) => (active(key) ? 0.92 : 0.38);
  const muscleStroke = (key) => (active(key) ? "rgba(255,255,255,.78)" : "rgba(47,107,79,.42)");
  const zoneClass = "cursor-pointer transition outline-none hover:opacity-90";
  const zoneProps = (key) => ({
    role: "button",
    tabIndex: 0,
    onClick: () => onSelect(key),
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") onSelect(key);
    },
    className: zoneClass,
  });

  return (
    <svg viewBox="0 0 430 620" className="mx-auto h-[560px] w-full max-w-[420px]" role="img" aria-label="Интерактивная карта мышц">
      <defs>
        <linearGradient id="skinNashfit" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2d1b8" />
          <stop offset="0.55" stopColor="#d6a681" />
          <stop offset="1" stopColor="#b77c5c" />
        </linearGradient>
        <linearGradient id="shortsNashfit" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#111b16" />
          <stop offset="1" stopColor="#283b30" />
        </linearGradient>
        <radialGradient id="bodyHaloNashfit" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(47,107,79,.22)" />
          <stop offset="100%" stopColor="rgba(47,107,79,0)" />
        </radialGradient>
        <filter id="bodyShadowNashfit" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#1d2721" floodOpacity="0.13" />
        </filter>
      </defs>

      <rect x="18" y="18" width="394" height="584" rx="42" fill="url(#bodyHaloNashfit)" opacity="0.82" />
      <ellipse cx="215" cy="584" rx="108" ry="14" fill="rgba(29,39,33,.10)" />

      <g filter="url(#bodyShadowNashfit)">
        <circle cx="215" cy="62" r="31" fill="url(#skinNashfit)" />
        <path d="M190 59 C198 33 232 31 242 55 C235 43 205 41 190 59Z" fill="#2b211c" opacity=".86" />
        <path d="M195 91 C203 101 228 101 235 91 L239 125 C223 136 207 136 191 125Z" fill="url(#skinNashfit)" />

        <path d="M159 132 C136 149 122 183 117 236 L101 363 C97 397 124 404 137 373 L163 255 L172 166Z" fill="url(#skinNashfit)" opacity=".96" />
        <path d="M271 132 C294 149 308 183 313 236 L329 363 C333 397 306 404 293 373 L267 255 L258 166Z" fill="url(#skinNashfit)" opacity=".96" />
        <path d="M159 128 C178 110 252 110 271 128 C291 156 290 238 270 302 C258 343 240 367 215 371 C190 367 172 343 160 302 C140 238 139 156 159 128Z" fill="url(#skinNashfit)" />
        <path d="M158 361 C182 350 248 350 272 361 L264 415 C242 432 188 432 166 415Z" fill="url(#shortsNashfit)" />
        <path d="M172 413 C191 407 208 417 206 444 L190 563 C184 591 153 588 153 558Z" fill="url(#skinNashfit)" />
        <path d="M258 413 C239 407 222 417 224 444 L240 563 C246 591 277 588 277 558Z" fill="url(#skinNashfit)" />
      </g>

      {view === "front" ? (
        <>
          <g {...zoneProps("shoulders")} opacity={muscleOpacity("shoulders")}>
            <path d="M151 137 C126 140 111 160 113 184 C137 184 155 172 168 150Z" fill={muscleFill("shoulders")} stroke={muscleStroke("shoulders")} strokeWidth="2.5" />
            <path d="M279 137 C304 140 319 160 317 184 C293 184 275 172 262 150Z" fill={muscleFill("shoulders")} stroke={muscleStroke("shoulders")} strokeWidth="2.5" />
          </g>
          <g {...zoneProps("chest")} opacity={muscleOpacity("chest")}>
            <path d="M166 151 C184 132 210 137 213 167 L211 222 C184 220 165 206 156 181Z" fill={muscleFill("chest")} stroke={muscleStroke("chest")} strokeWidth="3" />
            <path d="M264 151 C246 132 220 137 217 167 L219 222 C246 220 265 206 274 181Z" fill={muscleFill("chest")} stroke={muscleStroke("chest")} strokeWidth="3" />
            <path d="M215 146 L215 222" stroke="rgba(255,255,255,.52)" strokeWidth="2" />
          </g>
          <g {...zoneProps("arms")} opacity={muscleOpacity("arms")}>
            <path d="M126 190 C109 217 104 279 112 332 C118 367 136 368 145 337 C155 298 155 235 142 199Z" fill={muscleFill("arms")} stroke={muscleStroke("arms")} strokeWidth="2.5" />
            <path d="M304 190 C321 217 326 279 318 332 C312 367 294 368 285 337 C275 298 275 235 288 199Z" fill={muscleFill("arms")} stroke={muscleStroke("arms")} strokeWidth="2.5" />
          </g>
          <g {...zoneProps("core")} opacity={muscleOpacity("core")}>
            <path d="M181 227 C199 219 231 219 249 227 L242 338 C230 354 200 354 188 338Z" fill={muscleFill("core")} stroke={muscleStroke("core")} strokeWidth="3" />
            <path d="M215 232 L215 345 M190 266 L240 266 M190 302 L240 302" stroke="rgba(255,255,255,.52)" strokeWidth="2" />
          </g>
          <g {...zoneProps("legs")} opacity={muscleOpacity("legs")}>
            <path d="M174 420 C193 412 207 422 204 452 L190 556 C185 586 154 583 157 554Z" fill={muscleFill("legs")} stroke={muscleStroke("legs")} strokeWidth="2.5" />
            <path d="M256 420 C237 412 223 422 226 452 L240 556 C245 586 276 583 273 554Z" fill={muscleFill("legs")} stroke={muscleStroke("legs")} strokeWidth="2.5" />
          </g>
        </>
      ) : (
        <>
          <path d="M215 111 C215 194 215 281 215 356" stroke="rgba(29,39,33,.25)" strokeWidth="2" />
          <g {...zoneProps("shoulders")} opacity={muscleOpacity("shoulders")}>
            <path d="M151 137 C126 140 111 160 113 184 C137 184 155 172 168 150Z" fill={muscleFill("shoulders")} stroke={muscleStroke("shoulders")} strokeWidth="2.5" />
            <path d="M279 137 C304 140 319 160 317 184 C293 184 275 172 262 150Z" fill={muscleFill("shoulders")} stroke={muscleStroke("shoulders")} strokeWidth="2.5" />
          </g>
          <g {...zoneProps("back")} opacity={muscleOpacity("back")}>
            <path d="M160 154 C181 131 207 139 212 174 L207 316 C181 302 164 267 154 209Z" fill={muscleFill("back")} stroke={muscleStroke("back")} strokeWidth="3" />
            <path d="M270 154 C249 131 223 139 218 174 L223 316 C249 302 266 267 276 209Z" fill={muscleFill("back")} stroke={muscleStroke("back")} strokeWidth="3" />
          </g>
          <g {...zoneProps("arms")} opacity={muscleOpacity("arms")}>
            <path d="M126 190 C109 217 104 279 112 332 C118 367 136 368 145 337 C155 298 155 235 142 199Z" fill={muscleFill("arms")} stroke={muscleStroke("arms")} strokeWidth="2.5" />
            <path d="M304 190 C321 217 326 279 318 332 C312 367 294 368 285 337 C275 298 275 235 288 199Z" fill={muscleFill("arms")} stroke={muscleStroke("arms")} strokeWidth="2.5" />
          </g>
          <g {...zoneProps("glutes")} opacity={muscleOpacity("glutes")}>
            <ellipse cx="190" cy="376" rx="35" ry="42" fill={muscleFill("glutes")} stroke={muscleStroke("glutes")} strokeWidth="2.5" />
            <ellipse cx="240" cy="376" rx="35" ry="42" fill={muscleFill("glutes")} stroke={muscleStroke("glutes")} strokeWidth="2.5" />
          </g>
          <g {...zoneProps("legs")} opacity={muscleOpacity("legs")}>
            <path d="M174 420 C193 412 207 422 204 452 L190 556 C185 586 154 583 157 554Z" fill={muscleFill("legs")} stroke={muscleStroke("legs")} strokeWidth="2.5" />
            <path d="M256 420 C237 412 223 422 226 452 L240 556 C245 586 276 583 273 554Z" fill={muscleFill("legs")} stroke={muscleStroke("legs")} strokeWidth="2.5" />
          </g>
        </>
      )}

      <g opacity=".45" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.4">
        <path d="M184 188 C199 195 231 195 246 188" />
        <path d="M178 248 C197 257 233 257 252 248" />
        <path d="M177 452 C189 461 197 484 190 522" />
        <path d="M253 452 C241 461 233 484 240 522" />
      </g>
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
  const [activeKey, setActiveKey] = useState("chest");
  const [view, setView] = useState("front");
  const active = useMemo(() => safeGroups.find((item) => item.key === activeKey) || safeGroups[0], [safeGroups, activeKey]);

  function selectGroup(key) {
    const item = safeGroups.find((group) => group.key === key);
    setActiveKey(key);
    if (item?.view && item.key !== "mobility") setView(item.view);
  }

  const frontKeys = ["chest", "shoulders", "arms", "core", "legs", "mobility"];
  const backKeys = ["back", "shoulders", "arms", "glutes", "legs", "mobility"];
  const visibleKeys = view === "front" ? frontKeys : backKeys;
  const visible = visibleKeys.map((key) => safeGroups.find((group) => group.key === key)).filter(Boolean);
  const focus = safeArray(active?.focus).slice(0, 3);

  return (
    <section className="px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Интерактивное тело</div>
            <h2 className="text-4xl font-black tracking-[-0.04em] text-[color:var(--text)] md:text-5xl">Выберите зону для тренировки</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
              Нажмите на мышечную группу — покажем подходящие программы, упражнения и рекомендации для прогресса без хаоса.
            </p>
          </div>
          <Link href="/programs" className="inline-flex items-center gap-2 font-black text-[color:var(--accent)] transition hover:gap-3">
            Как это работает? <ArrowRight size={18} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2.4rem] border border-[color:var(--stroke)] bg-[linear-gradient(135deg,var(--panel),var(--panel-2))] shadow-[0_28px_90px_rgba(29,39,33,.10)] dark:shadow-[0_28px_90px_rgba(0,0,0,.30)]">
          <div className="grid gap-0 xl:grid-cols-[1.05fr_.95fr]">
            <div className="relative min-h-[660px] border-b border-[color:var(--stroke)] bg-[radial-gradient(circle_at_50%_22%,rgba(47,107,79,.20),transparent_52%),linear-gradient(180deg,rgba(255,255,255,.30),transparent)] p-5 md:p-8 xl:border-b-0 xl:border-r">
              <div className="absolute left-7 top-7 z-10 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)]/88 px-3 py-2 text-xs font-bold text-[color:var(--muted)] backdrop-blur">
                Нажмите на зону тела
              </div>
              <div className="absolute right-7 top-7 z-10 flex rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)]/88 p-1 backdrop-blur">
                {[{ key: "front", label: "Спереди" }, { key: "back", label: "Сзади" }].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => {
                      setView(item.key);
                      const first = safeGroups.find((group) => group.view === item.key && group.key !== "mobility");
                      if (first) setActiveKey(first.key);
                    }}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition ${view === item.key ? "bg-[color:var(--accent)] text-white shadow-[0_10px_26px_var(--accentGlow)]" : "text-[color:var(--muted)] hover:text-[color:var(--text)]"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex h-full items-center justify-center pt-12">
                <BodyIllustration view={view} activeKey={activeKey} onSelect={selectGroup} />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
              <div className="border-b border-[color:var(--stroke)] bg-[color:var(--panel)]/50 p-5 lg:border-b-0 lg:border-r md:p-6">
                <div className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Группы мышц</div>
                <div className="grid gap-3">
                  {visible.map((item) => {
                    const isActive = item.key === activeKey;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => selectGroup(item.key)}
                        className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition ${isActive ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow-[0_16px_34px_var(--accentGlow)]" : "border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--muted)] hover:border-[color:var(--accent)]/50 hover:text-[color:var(--text)]"}`}
                      >
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isActive ? "bg-white/16" : "bg-[color:var(--accentGlow)] text-[color:var(--accent)]"}`}>
                          <Dumbbell size={18} />
                        </span>
                        <span className="font-black">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">Выбранная зона</div>
                <h3 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[color:var(--text)]">{active?.label || "Грудь"}</h3>
                <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
                  {active?.description || "Выберите зону тела, чтобы получить рекомендации под конкретную цель."}
                </p>

                <div className="mt-6 grid gap-3">
                  {(focus.length ? focus : ["техника", "контроль", "прогресс"]).map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[color:var(--accent)]" />
                      <span className="font-bold text-[color:var(--text)]">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="my-7 h-px bg-[color:var(--stroke)]" />
                <div className="text-sm font-black text-[color:var(--text)]">Что делать дальше?</div>
                <div className="mt-4 grid gap-3">
                  <Link href={`/programs?muscle=${encodeURIComponent(active?.key || "chest")}`} className="group flex items-center gap-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:border-[color:var(--accent)]/50">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Dumbbell size={20} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-black text-[color:var(--text)]">Смотреть программы</span><span className="block text-sm text-[color:var(--muted)]">Подборка тренировок под выбранную зону</span></span>
                    <ArrowRight size={18} className="text-[color:var(--accent)] transition group-hover:translate-x-1" />
                  </Link>
                  <Link href="/booking" className="group flex items-center gap-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:border-[color:var(--accent)]/50">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Users size={20} /></span>
                    <span className="min-w-0 flex-1"><span className="block font-black text-[color:var(--text)]">Подобрать тренера</span><span className="block text-sm text-[color:var(--muted)]">Тренер скорректирует технику и нагрузку</span></span>
                    <ArrowRight size={18} className="text-[color:var(--accent)] transition group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="mt-6 rounded-2xl border border-[color:var(--accent)]/25 bg-[color:var(--accentGlow)] p-4">
                  <div className="flex items-start gap-3">
                    <Star className="mt-0.5 h-5 w-5 text-[color:var(--accent)]" />
                    <div>
                      <div className="font-black text-[color:var(--text)]">Совет тренера</div>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">Лучший результат дают базовые упражнения, изоляция и стабильный прогресс в нагрузке.</p>
                    </div>
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


function StartJourney() {
  const steps = [
    { icon: Target, title: "Выберите цель", text: "Программа, статьи и товары под ваш уровень.", number: "01" },
    { icon: HeartPulse, title: "Тренируйтесь регулярно", text: "Отмечайте прогресс и сохраняйте мотивацию.", number: "02" },
    { icon: Route, title: "Приходите в зал", text: "Адреса, график и карта всегда под рукой.", number: "03" },
  ];

  return (
    <section className="px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] border border-[color:var(--stroke)] bg-[linear-gradient(135deg,var(--panel),var(--panel-2))] p-6 shadow-[0_24px_80px_rgba(29,39,33,.08)] md:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accentGlow)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">
            <Sparkles size={16} /> Ваш путь к результату
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-[color:var(--text)] md:text-5xl">Как начать с НашФит</h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">Три простых шага, чтобы тренировки стали частью жизни, а результат — реальностью.</p>
        </div>

        <div className="relative mt-10 grid gap-5 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-1/2 hidden h-px bg-[color:var(--stroke)] lg:block" />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-7 transition hover:-translate-y-1 hover:border-[color:var(--accent)]/40 hover:shadow-[0_20px_50px_rgba(29,39,33,.10)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-2xl font-black text-[color:var(--accent)]">{step.number}</div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Icon size={27} /></div>
                </div>
                <h3 className="mt-8 text-2xl font-black tracking-[-0.03em] text-[color:var(--text)]">{step.title}</h3>
                <p className="mt-3 max-w-xs text-base leading-7 text-[color:var(--muted)]">{step.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-7 grid gap-5 rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Star size={24} /></div>
            <div><div className="text-lg font-black text-[color:var(--text)]">Мы рядом на каждом этапе</div><p className="mt-1 text-sm text-[color:var(--muted)]">Поддержка, рекомендации и инструменты — всё для вашего прогресса.</p></div>
          </div>
          <Link href="/booking" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white transition hover:bg-[color:var(--accent-hover)]">
            Подобрать тренера <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ item }) {
  return (
    <Link href={`/programs/${item.id}`} className="group overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-xl hover:shadow-emerald-950/10 dark:hover:shadow-black/30">
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
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-[color:var(--bg)] p-3 font-bold text-[color:var(--text)]">
          <span className="text-sm">Открыть план</span>
          <ArrowRight size={18} className="text-[color:var(--accent)] transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}


function TrainerPortrait({ name, featured = false }) {
  const letters = initials(name);
  const gradientKey = Array.from(letters).map((letter) => letter.charCodeAt(0).toString(36)).join("-") || "nf";
  return (
    <div className={`relative overflow-hidden rounded-[1.45rem] border border-[color:var(--stroke)] bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,.34),transparent_30%),linear-gradient(145deg,#203a2d,#111b16)] ${featured ? "min-h-[420px]" : "h-full min-h-[210px]"}`}>
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_24%_16%,rgba(255,255,255,.22),transparent_18rem),linear-gradient(115deg,transparent_0_45%,rgba(255,255,255,.12)_45%_48%,transparent_48%)]" />
      <div className="absolute left-5 top-5 rounded-full bg-white/12 px-3 py-1 text-xs font-black tracking-[0.18em] text-white/70">{letters}</div>
      <svg viewBox="0 0 360 460" className="absolute inset-x-0 bottom-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`shirt-${gradientKey}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#102017" />
            <stop offset="1" stopColor="#2f6b4f" />
          </linearGradient>
          <linearGradient id={`skin-${gradientKey}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f1c9ad" />
            <stop offset="1" stopColor="#b97655" />
          </linearGradient>
        </defs>
        <path d="M55 455 C62 346 111 285 181 285 C249 285 298 348 306 455Z" fill={`url(#shirt-${gradientKey})`} />
        <path d="M90 455 C92 390 118 344 153 323 C138 362 135 412 138 455Z" fill="#17251d" opacity=".65" />
        <path d="M270 455 C268 390 242 344 207 323 C222 362 225 412 222 455Z" fill="#17251d" opacity=".65" />
        <path d="M151 250 C164 267 196 267 209 250 L214 302 C198 319 162 319 146 302Z" fill={`url(#skin-${gradientKey})`} />
        <ellipse cx="180" cy="184" rx="58" ry="70" fill={`url(#skin-${gradientKey})`} />
        <path d="M124 175 C126 119 171 94 222 118 C237 127 246 143 248 166 C225 145 183 145 138 160Z" fill="#231a16" />
        <path d="M143 207 C159 226 200 229 218 207" fill="none" stroke="#6d3f30" strokeWidth="4" strokeLinecap="round" opacity=".45" />
        <path d="M153 177 C160 172 169 172 176 177 M205 177 C212 172 221 172 228 177" stroke="#2b211c" strokeWidth="4" strokeLinecap="round" />
        <path d="M171 194 C176 199 184 199 189 194" stroke="#7a4a39" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5" />
        <text x="180" y="412" textAnchor="middle" fontFamily="Arial" fontSize="18" fontWeight="800" letterSpacing="3" fill="rgba(255,255,255,.42)">NASHFIT</text>
      </svg>
    </div>
  );
}

function ProductVisual({ item, featured = false }) {
  const type = productVisualType(item);
  const title = String(item.name || item.title || "NashFit").split(/\s+/).slice(0, 2).join(" ");
  return (
    <div className={`relative overflow-hidden rounded-[1.45rem] border border-[color:var(--stroke)] ${featured ? "min-h-[430px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_22rem),linear-gradient(135deg,#102017,#2f6b4f)]" : "min-h-[210px] bg-[linear-gradient(145deg,var(--panel-2),var(--panel))]"}`}>
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(47,107,79,.22),transparent_15rem),linear-gradient(120deg,transparent_0_55%,rgba(255,255,255,.18)_55%_58%,transparent_58%)]" />
      <svg viewBox="0 0 360 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {type === "band" ? (
          <g transform="translate(30 35)">
            <ellipse cx="155" cy="160" rx="116" ry="50" fill="none" stroke="#2f6b4f" strokeWidth="34" />
            <ellipse cx="155" cy="160" rx="74" ry="27" fill="none" stroke="#173323" strokeWidth="18" opacity=".9" />
            <text x="155" y="166" textAnchor="middle" fontFamily="Arial" fontSize="25" fontWeight="900" fill="#84d2a2">NASHFIT</text>
          </g>
        ) : type === "shaker" ? (
          <g transform="translate(117 28)">
            <rect x="33" y="18" width="96" height="25" rx="9" fill="#111b16" />
            <path d="M38 42 H124 L112 255 H50Z" fill="#dfe6de" opacity=".82" />
            <path d="M48 52 H114 L105 244 H57Z" fill="#263b30" opacity=".72" />
            <text x="82" y="171" textAnchor="middle" transform="rotate(-90 82 171)" fontFamily="Arial" fontSize="25" fontWeight="900" fill="#ecfdf5">NASHFIT</text>
          </g>
        ) : (
          <g transform="translate(95 24)">
            <rect x="42" y="18" width="118" height="32" rx="12" fill="#0e1712" />
            <rect x="32" y="42" width="138" height="216" rx="34" fill="#111b16" />
            <rect x="47" y="92" width="108" height="98" rx="14" fill="#243d2f" />
            <text x="101" y="122" textAnchor="middle" fontFamily="Arial" fontSize="18" fontWeight="900" fill="#84d2a2">NASHFIT</text>
            <text x="101" y="156" textAnchor="middle" fontFamily="Arial" fontSize="28" fontWeight="900" fill="#ffffff">{type === "bottle" ? "RECOVERY" : "PROTEIN"}</text>
            <text x="101" y="178" textAnchor="middle" fontFamily="Arial" fontSize="12" fontWeight="700" fill="rgba(255,255,255,.65)">{type === "bottle" ? "MAGNESIUM" : "PREMIUM"}</text>
          </g>
        )}
      </svg>
      <div className={`absolute ${featured ? "bottom-7 left-7 right-7 text-white" : "bottom-4 left-4 right-4 text-[color:var(--text)]"}`}>
        <div className="text-xs font-black uppercase tracking-[0.16em] opacity-70">NashFit Store</div>
        <div className="mt-1 text-lg font-black tracking-[-0.03em]">{title}</div>
      </div>
    </div>
  );
}

function ArticleVisual({ item, featured = false }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.45rem] border border-[color:var(--stroke)] ${featured ? "min-h-[470px] bg-[linear-gradient(135deg,#08130f,#214634)]" : "min-h-[230px] bg-[linear-gradient(135deg,var(--panel-2),var(--panel))]"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_28%,rgba(132,185,147,.22),transparent_18rem),linear-gradient(90deg,rgba(0,0,0,.40),transparent_62%)]" />
      <svg viewBox="0 0 520 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g opacity={featured ? ".95" : ".78"}>
          <circle cx="340" cy="86" r="37" fill="#d9a982" />
          <path d="M306 85 C310 42 352 34 384 59 C368 55 333 56 306 85Z" fill="#211815" />
          <path d="M303 140 C327 116 374 116 398 140 L432 268 C399 292 300 292 267 268Z" fill="#101a15" />
          <path d="M296 157 C250 185 222 224 207 272" stroke="#d9a982" strokeWidth="24" strokeLinecap="round" />
          <path d="M398 156 C445 184 467 224 472 274" stroke="#d9a982" strokeWidth="24" strokeLinecap="round" />
          <path d="M225 276 C225 239 252 212 289 212 C326 212 353 239 353 276" fill="none" stroke="#243d2f" strokeWidth="18" strokeLinecap="round" />
          <circle cx="225" cy="276" r="23" fill="#243d2f" />
          <circle cx="353" cy="276" r="23" fill="#243d2f" />
          <rect x="348" y="286" width="80" height="28" rx="14" fill="#17251d" />
        </g>
        <path d="M0 318 C112 292 194 301 286 319 C369 336 444 330 520 302 V360 H0Z" fill="rgba(0,0,0,.22)" />
      </svg>
      <div className={`absolute ${featured ? "bottom-6 left-6 right-6 text-white" : "bottom-4 left-4 right-4 text-[color:var(--text)]"}`}>
        <div className="text-xs font-black uppercase tracking-[0.16em] opacity-75">Журнал НашФит</div>
        <div className="mt-1 line-clamp-2 text-xl font-black tracking-[-0.03em]">{item.title}</div>
      </div>
    </div>
  );
}


function TrainerCard({ item, featured = false }) {
  const goal = item.specialization || item.bio || "Персональные тренировки и понятный прогресс";
  return (
    <Link
      href={`/trainers/${item.id}`}
      className={`group overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-[0_24px_70px_rgba(29,39,33,.12)] ${featured ? "grid lg:grid-cols-[0.98fr_1.02fr]" : "grid gap-0 sm:grid-cols-[220px_1fr]"}`}
    >
      <TrainerPortrait name={item.name} featured={featured} />
      <div className={`flex flex-col ${featured ? "p-7 md:p-8" : "p-5 md:p-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
            <BadgeCheck size={14} /> Тренер клуба
          </span>
          {Number(item.avg_rating) > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-600 dark:text-amber-300">
              <Star size={13} fill="currentColor" /> {item.avg_rating}
            </span>
          ) : null}
        </div>
        <h3 className={`${featured ? "mt-8 text-5xl" : "mt-4 text-2xl"} line-clamp-2 font-black tracking-[-0.05em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]`}>{item.name}</h3>
        <p className={`${featured ? "text-lg leading-8" : "text-base leading-7"} mt-4 text-[color:var(--muted)]`}>{goal}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[color:var(--muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5"><Trophy size={14} /> {item.experience_years || 1} лет опыта</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5"><MapPin size={14} /> {item.location || item.club || "НашФит"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5"><Target size={14} /> Индивидуально</span>
        </div>
        <div className="mt-7 border-t border-[color:var(--stroke)] pt-5 text-sm leading-6 text-[color:var(--muted)]">
          Поможет выстроить технику, подобрать нагрузку и держать дисциплину без перегруза.
        </div>
        <div className="mt-auto pt-6">
          <div className={`inline-flex items-center justify-center gap-2 rounded-xl font-black transition group-hover:gap-3 ${featured ? "bg-[color:var(--accent)] px-6 py-4 text-white" : "text-[color:var(--accent)]"}`}>
            {featured ? "Выбрать тренера" : "Посмотреть профиль"} <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}


function ProductCard({ item, featured = false }) {
  const goal = productGoal(item);
  return (
    <Link
      href={`/shop/${item.id}`}
      className={`group overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-[0_24px_70px_rgba(29,39,33,.12)] ${featured ? "grid lg:grid-cols-[1.08fr_.92fr]" : "grid sm:grid-cols-[190px_1fr]"}`}
    >
      <ProductVisual item={item} featured={featured} />
      <div className={`flex flex-col ${featured ? "p-7 md:p-8" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
            {item.category || item.brand || "NashFit Store"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5 text-xs font-bold text-[color:var(--muted)]">
            <CheckCircle2 size={13} className="text-[color:var(--accent)]" /> В наличии
          </span>
        </div>
        <h3 className={`${featured ? "mt-6 text-4xl" : "mt-4 text-xl"} line-clamp-2 font-black tracking-[-0.04em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]`}>{item.name || item.title}</h3>
        <p className={`${featured ? "text-base leading-7" : "text-sm leading-6"} mt-3 line-clamp-3 text-[color:var(--muted)]`}>
          {item.short_description || item.description || "Подходит для тренировок, восстановления и прогресса по программам НашФит."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-[color:var(--muted)]">
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5">{goal}</span>
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5">Проверено тренерами</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <div className={`${featured ? "text-4xl" : "text-2xl"} font-black tracking-[-0.04em] text-[color:var(--text)]`}>{displayPrice(item.price)}</div>
            {item.old_price ? <div className="mt-1 text-sm text-[color:var(--muted)] line-through">{displayPrice(item.old_price)}</div> : null}
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--accent)] text-white transition group-hover:scale-105">
            <ShoppingBag size={19} />
          </div>
        </div>
      </div>
    </Link>
  );
}


function ArticleCard({ item, featured = false }) {
  return (
    <Link href={`/articles/${item.id}`} className={`group overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-[0_24px_70px_rgba(29,39,33,.12)] ${featured ? "grid lg:grid-cols-[1.25fr_.75fr]" : "grid sm:grid-cols-[1fr_230px]"}`}>
      {featured ? <ArticleVisual item={item} featured /> : null}
      <div className={`flex flex-col ${featured ? "p-7 md:p-8" : "p-5 md:p-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
            <BookOpen size={14} /> Журнал
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5 text-xs font-bold text-[color:var(--muted)]">
            <Clock3 size={13} /> {item.reading_time_minutes || 5} мин
          </span>
        </div>
        <h3 className={`${featured ? "mt-8 text-4xl md:text-5xl" : "mt-4 text-2xl"} font-black tracking-[-0.05em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]`}>{item.title}</h3>
        <p className={`${featured ? "text-base leading-7" : "text-sm leading-6"} mt-4 line-clamp-3 text-[color:var(--muted)]`}>{item.excerpt || item.description || "Практический материал от команды НашФит без лишней воды."}</p>
        <div className={`${featured ? "mt-7" : "mt-5"} rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm leading-6 text-[color:var(--muted)]`}>
          Только то, что можно применить на следующей тренировке: техника, восстановление и понятный план действий.
        </div>
        <div className="mt-auto inline-flex items-center gap-2 pt-6 font-black text-[color:var(--accent)] transition group-hover:gap-3">Читать статью <ArrowRight size={17} /></div>
      </div>
      {!featured ? <ArticleVisual item={item} /> : null}
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

      <StartJourney />

      <MuscleExplorer groups={data.muscle_groups} />

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Бесплатные программы" title="Начните сегодня — без оплаты и сложного старта" description="Выберите цель, выполняйте готовый план и отмечайте прогресс в личном кабинете." link="/programs" />
          {programs.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{programs.map((item) => <ProgramCard item={item} key={item.id} />)}</div> : <div className="rounded-3xl border border-dashed border-[color:var(--stroke)] p-10 text-center text-[color:var(--muted)]">Программы появятся после запуска демо-сидера.</div>}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Команда клуба" title="Тренеры под вашу цель" description="Выберите специалиста по опыту, направлению и ближайшему залу — дальше можно сразу перейти к записи." link="/trainers" />
          {trainers.length ? (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
              <TrainerCard item={trainers[0]} featured />
              <div className="grid gap-6">
                {trainers.slice(1, 3).map((item) => <TrainerCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
          <div className="mt-7 grid gap-4 rounded-[1.8rem] border border-[color:var(--stroke)] bg-[linear-gradient(120deg,var(--accentGlow),transparent)] p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Users size={22} /></div>
              <div>
                <div className="text-xl font-black text-[color:var(--text)]">Не нашли подходящего специалиста?</div>
                <p className="mt-1 text-[color:var(--muted)]">Подберём тренера под вашу цель, опыт и график. Бесплатно.</p>
              </div>
            </div>
            <Link href="/booking" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[color:var(--accent)] bg-[color:var(--panel)] px-5 py-3 font-black text-[color:var(--accent)] transition hover:bg-[color:var(--accent)] hover:text-white">Подобрать тренера <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Журнал НашФит" title="Полезные статьи без воды" description="Практические материалы о тренировках, питании и восстановлении от экспертов НашФит. Только проверенные рекомендации и личный опыт." link="/articles" />
          {articles.length ? (
            <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <ArticleCard item={articles[0]} featured />
              <div className="grid gap-5">
                {articles.slice(1, 4).map((item) => <ArticleCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Магазин" title="Товары, которые дополняют тренировки" description="Поддержите прогресс правильным питанием, восстановлением и экипировкой. Каждый продукт отобран тренерами НашФит." link="/shop" />
          {products.length ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
              <ProductCard item={products[0]} featured />
              <div className="grid gap-6 md:grid-cols-2">
                {products.slice(1, 5).map((item) => <ProductCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
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
