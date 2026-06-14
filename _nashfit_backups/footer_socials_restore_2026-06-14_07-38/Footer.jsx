import Link from "next/link";
import Container from "@/components/ui/Container";
import { apiGet } from "@/services/api";

const navLinks = [
  { href: "/trainers", label: "Тренеры" },
  { href: "/programs", label: "Программы" },
  { href: "/shop", label: "Магазин" },
  { href: "/articles", label: "Журнал" },
  { href: "/booking", label: "Запись" },
  { href: "/#clubs", label: "Залы" },
];

const fallbackLocations = [
  { name: "НашФит Центр", address: "ул. Спортивная, 10", phone: "+7 (999) 000-00-00", working_hours: "Пн–Вс: 7:00–23:00" },
  { name: "НашФит Север", address: "пр. Ленина, 45", phone: "+7 (999) 100-20-30", working_hours: "Пн–Вс: 8:00–22:00" },
];

const socials = [
  {
    href: "https://vk.com/nashfit",
    label: "ВКонтакте",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.61 2.18-3.61.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
      </svg>
    ),
  },
  {
    href: "https://max.ru/nashfit",
    label: "MAX",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
        <path d="M128 18C67.2 18 18 67.2 18 128s49.2 110 110 110 110-49.2 110-110S188.8 18 128 18Zm0 32c43.1 0 78 34.9 78 78s-34.9 78-78 78-78-34.9-78-78 34.9-78 78-78Zm-34 58v58h22v-34l21 34h25v-58h-22v34l-21-34H94Z" />
      </svg>
    ),
  },
];

async function getLocations() {
  try {
    const response = await apiGet("/locations");
    const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
    return list.length ? list : fallbackLocations;
  } catch {
    return fallbackLocations;
  }
}

function mapLink(address) {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(address || "НашФит")}`;
}

export default async function Footer() {
  const locations = await getLocations();

  return (
    <footer className="border-t border-[color:var(--stroke)] bg-[color:var(--panel)]">
      <Container className="py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_.8fr_1.25fr_1fr]">
          <div>
            <Link href="/" className="inline-block text-xl font-extrabold tracking-tight text-[color:var(--text)]">
              Наш<span className="text-[color:var(--accent)]">Фит</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Фитнес-платформа и сеть офлайн-залов: программы, тренеры, магазин, записи и понятный путь к результату.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)]">Навигация</h3>
            <ul className="mt-4 grid gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[color:var(--muted)] transition hover:text-[color:var(--text)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)]">Офлайн-залы</h3>
              <Link href="/#clubs" className="text-xs font-bold text-[color:var(--accent)]">На карте</Link>
            </div>
            <ul className="mt-4 grid gap-4">
              {locations.slice(0, 3).map((loc) => (
                <li key={loc.id || loc.name} className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--bg)] p-4 text-sm">
                  <div className="font-black text-[color:var(--text)]">{loc.name}</div>
                  <a href={mapLink(loc.address)} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[color:var(--muted)] transition hover:text-[color:var(--accent)]">
                    {loc.address}
                  </a>
                  <div className="mt-1 text-xs text-[color:var(--muted)]">{loc.working_hours || loc.hours || "График уточняется"}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)]">Контакты</h3>
            <ul className="mt-4 grid gap-2.5 text-sm text-[color:var(--muted)]">
              <li>
                <a href={`tel:${locations[0]?.phone || "+79990000000"}`} className="transition hover:text-[color:var(--text)]">
                  {locations[0]?.phone || "+7 (999) 000-00-00"}
                </a>
              </li>
              <li>
                <a href="mailto:info@nashfit.ru" className="transition hover:text-[color:var(--text)]">info@nashfit.ru</a>
              </li>
              <li className="pt-2 text-xs leading-5">
                Администратор может менять адреса, график, телефон и карту залов в разделе <Link href="/admin/locations" className="font-bold text-[color:var(--accent)]">админки «Локации»</Link>.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[color:var(--stroke)] pt-6 text-xs text-[color:var(--muted)] md:flex-row">
          <span>&copy; {new Date().getFullYear()} НашФит. Все права защищены.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-[color:var(--text)]">Политика конфиденциальности</a>
            <a href="#" className="transition hover:text-[color:var(--text)]">Пользовательское соглашение</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
