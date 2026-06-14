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
import MuscleMap from "@/components/muscles/MuscleMap";

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
    <div className="mb-6 flex flex-col gap-3">
      <div className="max-w-3xl">
        {eyebrow ? <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">{eyebrow}</div> : null}
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-4xl">{title}</h2>
        {description ? <p className="mt-2.5 text-[color:var(--muted)]">{description}</p> : null}
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
    <section id="clubs" className="px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-5 flex flex-wrap gap-2">
              {features.map((item) => (
                <span key={item} className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text)]">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
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


function IllustrationPlaceholder({ view, active }) {
  const title = view === "front" ? "Вид спереди" : "Вид сзади";

  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(34,183,143,.12),transparent_36%)]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accentGlow)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--accent)]">
          <Info size={14} /> {title}
        </div>
        <div className="mt-4 min-h-[380px] rounded-[1.6rem] border border-dashed border-[color:var(--stroke)] bg-[color:var(--bg)]/80 p-6 md:p-8">
          <div className="max-w-xl">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[color:var(--muted)]">Зона сейчас</div>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[color:var(--text)]">{active?.label || "Грудь"}</h3>
            <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
              Здесь будет ваша иллюстрация тела и мышц. Блок уже подготовлен: слева — место под графику, справа — выбор зон и быстрые действия.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              { title: "Что сюда вставить", text: "PNG / SVG с телом, мышцами и front/back-версиями." },
              { title: "Как лучше оформить", text: "Крупная спокойная графика без лишнего шума — акцент делаем на выбранной зоне." },
              { title: "Что уже готово", text: "Переключатель вида, список зон, тексты и ссылки на программы, статьи и товары." },
              { title: "Что менять потом", text: "Вы сможете заменить только саму иллюстрацию, не трогая остальную верстку." },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4">
                <div className="font-black text-[color:var(--text)]">{card.title}</div>
                <div className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{card.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
  const zoneIcons = {
    chest: Dumbbell,
    shoulders: ShieldCheck,
    arms: Trophy,
    core: Target,
    legs: Route,
    back: Navigation,
    glutes: Zap,
    mobility: HeartPulse,
  };

  return (
    <section className="px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Интерактивное тело"
          title="Выберите зону — иллюстрацию добавим отдельно"
          description="Без страшного человечка: мы оставили аккуратный блок под вашу будущую графику и уже собрали удобную логику выбора зон, рекомендаций и переходов."
        />
        <div className="overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] shadow-[0_20px_70px_rgba(0,0,0,.08)] dark:shadow-[0_30px_90px_rgba(0,0,0,.24)]">
          <div className="grid lg:grid-cols-[1.15fr_.62fr_.83fr]">
            <div className="border-b border-[color:var(--stroke)] p-5 lg:border-b-0 lg:border-r lg:p-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-2 text-sm font-bold text-[color:var(--muted)]">
                  Нажмите на зону тела
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
                      className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${view === item.key ? "bg-[color:var(--accent)] text-white" : "text-[color:var(--muted)] hover:text-[color:var(--text)]"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <IllustrationPlaceholder view={view} active={active} />
            </div>

            <div className="border-b border-[color:var(--stroke)] p-5 lg:border-b-0 lg:border-r lg:p-7">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">Группы мышц</div>
              <div className="mt-5 grid gap-3">
                {visible.map((item) => {
                  const Icon = zoneIcons[item.key] || Target;
                  const isActive = item.key === activeKey;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => selectGroup(item.key)}
                      className={`flex items-center gap-4 rounded-[1.4rem] border p-4 text-left transition ${isActive ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--stroke)] bg-[color:var(--bg)] hover:border-[color:var(--accent)]/45"}`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isActive ? "bg-white/14" : "bg-[color:var(--accentGlow)] text-[color:var(--accent)]"}`}>
                        <Icon size={20} />
                      </span>
                      <div>
                        <div className={`text-xl font-black ${isActive ? "text-white" : "text-[color:var(--text)]"}`}>{item.label}</div>
                        <div className={`mt-1 text-sm ${isActive ? "text-white/80" : "text-[color:var(--muted)]"}`}>{item.short_label || item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 lg:p-7">
              <div className="text-sm font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">Выбранная зона</div>
              <h3 className="mt-4 text-5xl font-black tracking-[-0.04em] text-[color:var(--text)]">{active?.label}</h3>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">{active?.description}</p>

              <div className="mt-5 grid gap-3">
                {(active?.focus || []).map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] px-4 py-4 text-lg font-black text-[color:var(--text)]">
                    <CheckCircle2 size={18} className="text-[color:var(--accent)]" /> {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[color:var(--stroke)] pt-8">
                <div className="text-2xl font-black text-[color:var(--text)]">Что делать дальше?</div>
                <div className="mt-5 grid gap-4">
                  <Link href={active?.program ? `/programs/${active.program.id}` : "/programs"} className="group flex items-center gap-4 rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 transition hover:border-[color:var(--accent)]/45">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Dumbbell size={22} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-2xl font-black text-[color:var(--text)]">Смотреть программы</div>
                      <div className="text-base text-[color:var(--muted)]">Подборка тренировок под выбранную зону</div>
                    </div>
                    <ArrowRight size={22} className="text-[color:var(--accent)] transition group-hover:translate-x-1" />
                  </Link>

                  <Link href={active?.trainer ? `/trainers/${active.trainer.id}` : "/trainers"} className="group flex items-center gap-4 rounded-[1.5rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-5 transition hover:border-[color:var(--accent)]/45">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]"><Users size={22} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-2xl font-black text-[color:var(--text)]">Подобрать тренера</div>
                      <div className="text-base text-[color:var(--muted)]">Тренер скорректирует технику и нагрузку</div>
                    </div>
                    <ArrowRight size={22} className="text-[color:var(--accent)] transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <RecommendationMiniCard type="article" item={active?.article} />
                <RecommendationMiniCard type="product" item={active?.product} />
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


function TrainerCard({ item, featured = false }) {
  return (
    <Link
      href={`/trainers/${item.id}`}
      className={`group grid gap-4 rounded-[1.7rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-xl hover:shadow-emerald-950/10 dark:hover:shadow-black/30 ${featured ? "md:grid-cols-[260px_1fr] md:p-5" : "grid-cols-[112px_1fr]"}`}
    >
      <Media
        src={item.photo_url || item.image_url}
        alt={item.name}
        fallback="/demo/trainers/anna-volkova.svg"
        className={`${featured ? "aspect-[4/5] md:h-full" : "h-28 w-28 aspect-square"} rounded-[1.35rem] border border-[color:var(--stroke)]`}
      />
      <div className="min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accentGlow)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            <ShieldCheck size={13} /> Тренер клуба
          </span>
          {item.rating ? <span className="rounded-full bg-amber-400/12 px-2.5 py-1 text-xs font-black text-amber-600 dark:text-amber-300">★ {item.rating}</span> : null}
        </div>
        <h3 className={`${featured ? "mt-4 text-4xl" : "mt-2 text-2xl"} font-black tracking-[-0.03em] text-[color:var(--text)] group-hover:text-[color:var(--accent)] line-clamp-2`}>{item.name}</h3>
        <p className="mt-2 line-clamp-2 text-base leading-7 text-[color:var(--muted)]">{item.specialization || item.bio || "Персональные тренировки, техника и понятный план прогресса."}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[color:var(--muted)]">
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5">{item.experience_years || 1} лет опыта</span>
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5">{item.location || item.club || "НашФит"}</span>
        </div>
        <div className="mt-4 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">
          {item.bio || "Подойдёт, если нужна техника, дисциплина и индивидуальная корректировка программы под вашу цель."}
        </div>
        <div className="mt-auto pt-5 inline-flex items-center gap-2 font-black text-[color:var(--accent)]">
          Посмотреть профиль <ArrowRight size={18} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}


function ProductCard({ item, featured = false }) {
  return (
    <Link
      href={`/shop/${item.id}`}
      className={`group grid gap-4 rounded-[1.7rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-xl hover:shadow-emerald-950/10 dark:hover:shadow-black/30 ${featured ? "md:grid-cols-[280px_1fr] md:p-5" : "grid-cols-[112px_1fr]"}`}
    >
      <Media src={item.image_url} alt={item.name} fallback="/demo/products/equipment.svg" className={`${featured ? "aspect-[1/1] md:h-full" : "h-28 w-28 aspect-square"} rounded-[1.35rem] border border-[color:var(--stroke)]`} />
      <div className="min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[color:var(--accentGlow)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            {item.category || item.brand || "НашФит Store"}
          </span>
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1 text-xs font-bold text-[color:var(--muted)]">В наличии</span>
        </div>
        <h3 className={`${featured ? "mt-4 text-4xl" : "mt-2 text-2xl"} line-clamp-2 font-black tracking-[-0.03em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]`}>{item.name || item.title}</h3>
        <p className="mt-2 line-clamp-3 text-base leading-7 text-[color:var(--muted)]">{item.short_description || item.description || "Подходит для домашних тренировок, восстановления и прогресса по программам НашФит."}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-[color:var(--muted)]">
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5">Проверено тренерами</span>
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-3 py-1.5">Для цели</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="text-3xl font-black text-[color:var(--text)]">{displayPrice(item.price)}</div>
            {item.old_price ? <div className="text-sm text-[color:var(--muted)] line-through">{displayPrice(item.old_price)}</div> : null}
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-3 text-sm font-black text-white">
            <ShoppingBag size={17} /> {featured ? "Открыть товар" : ""}
          </div>
        </div>
      </div>
    </Link>
  );
}


function ArticleCard({ item, featured = false }) {
  return (
    <Link
      href={`/articles/${item.id}`}
      className={`group grid gap-4 overflow-hidden rounded-[1.7rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-4 transition hover:-translate-y-1 hover:border-[color:var(--accent)]/45 hover:shadow-xl hover:shadow-emerald-950/10 dark:hover:shadow-black/30 ${featured ? "md:grid-cols-[280px_1fr] md:p-5" : "grid-cols-[160px_1fr]"}`}
    >
      <Media src={item.cover_image_url || item.image_url} alt={item.title} fallback="/demo/covers/nutrition.svg" className={`${featured ? "aspect-[4/5] md:h-full" : "h-36 aspect-[4/3]"} rounded-[1.35rem] border border-[color:var(--stroke)]`} />
      <div className="min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accentGlow)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--accent)]">
            <BookOpen size={14} /> Журнал
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2.5 py-1 text-xs font-bold text-[color:var(--muted)]">
            <Clock3 size={13} /> {item.reading_time_minutes || 5} мин
          </span>
        </div>
        <h3 className={`${featured ? "mt-4 text-4xl" : "mt-2 text-2xl"} line-clamp-3 font-black tracking-[-0.03em] text-[color:var(--text)] group-hover:text-[color:var(--accent)]`}>{item.title}</h3>
        <p className="mt-3 line-clamp-3 text-base leading-7 text-[color:var(--muted)]">{item.excerpt || item.description}</p>
        <div className="mt-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm leading-6 text-[color:var(--muted)]">
          Только практическая выжимка: что делать дальше, на что обратить внимание и как применить материал в тренировках.
        </div>
        <div className="mt-auto pt-5 inline-flex items-center gap-2 font-black text-[color:var(--accent)]">Читать статью <ArrowRight size={17} className="transition group-hover:translate-x-1" /></div>
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
      <section className="relative overflow-hidden px-4 py-12 md:px-8 md:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,183,143,.18),transparent_34%),radial-gradient(circle_at_85%_8%,rgba(6,182,212,.14),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">
              <Sparkles size={16} /> Фитнес-клуб и платформа
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[color:var(--text)] md:text-7xl">
              Начните онлайн, продолжайте в зале с тренером
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Бесплатные программы, журнал, магазин, записи к тренерам и реальные офлайн-залы — всё собрано в одном понятном маршруте.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href="/memberships" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-6 py-4 font-black text-white shadow-[0_16px_40px_var(--accentGlow)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-hover)]">
                {trial?.name || "3 бесплатных посещения"} <ArrowRight size={19} />
              </Link>
              <Link href="#clubs" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-6 py-4 font-black text-[color:var(--text)] transition hover:border-[color:var(--accent)]">
                Где находятся залы <MapPin size={18} />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--muted)]">
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

      <section className="border-y border-[color:var(--stroke)] bg-[color:var(--panel)] px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3">
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[color:var(--accent)]">Как это работает</div>
              <h2 className="text-2xl font-black tracking-[-0.03em] text-[color:var(--text)] md:text-3xl">Простой маршрут к тренировкам</h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              { icon: Target, title: "Выберите цель", text: "Подберите программу, мышечную зону, статьи и товары под свой уровень.", meta: "персональный старт" },
              { icon: HeartPulse, title: "Тренируйтесь регулярно", text: "Следите за прогрессом, возвращайтесь к упражнениям и сохраняйте мотивацию.", meta: "контроль прогресса" },
              { icon: Route, title: "Приходите в зал", text: "Посмотрите адрес, график, карту и запишитесь к тренеру в удобное время.", meta: "офлайн-поддержка" },
            ].map((item, index) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[1.6rem] border border-[color:var(--stroke)] bg-[color:var(--bg)] p-[1.375rem] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/45 hover:shadow-[0_18px_50px_rgba(0,0,0,.08)]"
              >
                <div className="absolute right-5 top-4 text-5xl font-black tracking-[-0.08em] text-[color:var(--accent)]/10">0{index + 1}</div>
                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accentGlow)] text-[color:var(--accent)]">
                    <item.icon size={25} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--muted)]">
                      {item.meta}
                    </div>
                    <h3 className="text-xl font-black tracking-[-0.02em] text-[color:var(--text)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MuscleMap initialSlug="chest" />

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Бесплатные программы" title="Начните сегодня — без оплаты и сложного старта" description="Выберите цель, выполняйте готовый план и отмечайте прогресс в личном кабинете." link="/programs" />
          {programs.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{programs.map((item) => <ProgramCard item={item} key={item.id} />)}</div> : <div className="rounded-3xl border border-dashed border-[color:var(--stroke)] p-10 text-center text-[color:var(--muted)]">Программы появятся после запуска демо-сидера.</div>}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Команда клуба" title="Тренеры под вашу цель" description="Не просто список специалистов: выберите тренера по опыту, направлению и ближайшему залу — дальше можно сразу перейти к записи." link="/trainers" />
          {trainers.length ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)]">
              <TrainerCard item={trainers[0]} featured />
              <div className="grid gap-4">
                {trainers.slice(1, 4).map((item) => <TrainerCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
          <div className="mt-5 grid gap-4 rounded-[1.7rem] border border-[color:var(--accent)]/40 bg-[linear-gradient(120deg,rgba(34,183,143,.13),transparent)] p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xl font-black text-[color:var(--text)]">Не знаете, кого выбрать?</div>
              <p className="mt-1 text-[color:var(--muted)]">Запишитесь на вводную тренировку — администратор поможет подобрать специалиста под вашу цель и удобный зал.</p>
            </div>
            <Link href="/booking" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 font-black text-white">Выбрать время <CalendarDays size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Журнал НашФит" title="Полезные статьи без воды" description="Материалы связаны с программами, питанием, техникой и восстановлением — чтобы после чтения было понятно, что делать дальше." link="/articles" />
          {articles.length ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,.92fr)]">
              <ArticleCard item={articles[0]} featured />
              <div className="grid gap-4">
                {articles.slice(1, 4).map((item) => <ArticleCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[color:var(--panel)] px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Магазин" title="Товары, которые дополняют тренировки" description="Не просто витрина: инвентарь, питание и восстановление подобраны под программы, цели и работу с тренером." link="/shop" />
          {products.length ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)]">
              <ProductCard item={products[0]} featured />
              <div className="grid gap-4">
                {products.slice(1, 5).map((item) => <ProductCard item={item} key={item.id} />)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Абонементы" title="Когда готовы к большему — приходите в зал" description="Бесплатный контент остаётся доступным. Абонемент открывает полноценную инфраструктуру клуба и живую атмосферу тренировок." link="/memberships" linkLabel="Все тарифы" />
          <div className="grid gap-5 md:grid-cols-3">{memberships.map((item, index) => <MembershipCard item={item} key={item.id} featured={Boolean(item.is_featured || index === 1)} />)}</div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
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

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl"><HomeReviews /></div>
      </section>
    </main>
  );
}
