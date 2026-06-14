import Link from "next/link";
import Container from "@/components/ui/Container";

const navLinks = [
  { href: "/trainers", label: "Тренеры" },
  { href: "/programs", label: "Программы" },
  { href: "/shop", label: "Магазин" },
  { href: "/blog", label: "Блог" },
  { href: "/booking", label: "Запись" },
  { href: "/contacts", label: "Контакты" },
];

const socials = [
  {
    href: "https://vk.com/nashfit",
    label: "ВКонтакте",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
      </svg>
    ),
  },
  {
    href: "https://ok.ru/nashfit",
    label: "Одноклассники",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
        <rect x="8" y="8" width="240" height="240" rx="36" fill="currentColor" />
        <path fill="var(--bg, white)" fillRule="evenodd" d="M128 42C151.196 42 170 60.804 170 84C170 107.196 151.196 126 128 126C104.804 126 86 107.196 86 84C86 60.804 104.804 42 128 42ZM128 64C116.954 64 108 72.954 108 84C108 95.046 116.954 104 128 104C139.046 104 148 95.046 148 84C148 72.954 139.046 64 128 64Z" />
        <path d="M92 136 C104 146, 116 150, 128 150 C140 150, 152 146, 164 136" fill="none" stroke="var(--bg, white)" strokeWidth="16" strokeLinecap="round" />
        <path d="M116 156L86 186C81 191 81 199 86 204C91 209 99 209 104 204L128 180L152 204C157 209 165 209 170 204C175 199 175 191 170 186L140 156C136 152 120 152 116 156Z" fill="var(--bg, white)" />
      </svg>
    ),
  },
  {
    href: "https://rutube.ru/channel/nashfit",
    label: "Rutube",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
        <rect width="256" height="256" rx="56" fill="currentColor" />
        <path fill="var(--bg, white)" d="M76 64h72c28 0 44 14 44 36c0 18-10 28-26 32l28 44h-34l-24-40h-28v40H76V64zm32 24v32h32c12 0 20-6 20-16c0-10-8-16-20-16h-32z" />
      </svg>
    ),
  },
  {
    href: "https://dzen.ru/nashfit",
    label: "Дзен",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
        <rect width="256" height="256" rx="48" fill="currentColor" />
        <path fill="var(--bg, white)" d="M128 40C128 90, 90 128, 40 128C90 128, 128 166, 128 216C128 166, 166 128, 216 128C166 128, 128 90, 128 40Z" />
      </svg>
    ),
  },
  {
    href: "https://max.ru/nashfit",
    label: "MAX",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
        <path fill="currentColor" fillRule="evenodd" d="M 135.4 250.9 L 113.8 249.7 L 103.5 247.5 L 89.9 241.8 L 76.2 232.7 L 64.9 241.8 L 46.6 249.7 L 33.0 250.9 L 25.0 247.5 L 22.2 242.3 L 19.9 215.0 L 9.7 176.4 L 4.0 144.5 L 4.0 119.5 L 9.7 89.9 L 21.0 63.7 L 34.7 44.4 L 52.3 27.9 L 75.1 14.2 L 97.8 6.3 L 118.3 2.8 L 142.2 2.8 L 161.6 6.3 L 185.5 15.4 L 211.6 33.6 L 229.3 53.5 L 242.9 77.4 L 249.7 97.8 L 253.2 122.9 L 252.0 143.4 L 245.2 170.7 L 237.2 187.7 L 223.6 207.1 L 204.8 224.7 L 183.2 238.4 L 162.7 246.3 L 135.4 250.9 Z M 137.1 188.9 L 150.2 186.0 L 161.6 180.3 L 178.1 166.1 L 183.8 158.2 L 190.6 142.2 L 191.7 116.1 L 184.9 96.7 L 176.9 85.3 L 165.0 74.5 L 154.7 68.8 L 141.1 64.3 L 114.9 64.3 L 97.8 71.1 L 88.7 77.9 L 79.1 88.7 L 70.0 105.8 L 65.4 126.3 L 66.6 165.0 L 71.1 182.0 L 76.2 189.4 L 84.2 188.3 L 94.4 179.2 L 114.9 188.3 L 137.1 188.9 Z" />
      </svg>
    ),
  },
];

const locations = [
  { name: "НашФит Центр", address: "ул. Спортивная, 10", hours: "Пн–Вс: 7:00–23:00" },
  { name: "НашФит Север", address: "пр. Ленина, 45", hours: "Пн–Вс: 8:00–22:00" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--stroke)] bg-[color:var(--panel)]">
      <Container className="py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* О платформе */}
          <div>
            <Link href="/" className="inline-block font-extrabold tracking-tight text-[color:var(--text)] text-xl">
              Наш<span className="text-[color:var(--accent)]">Фит</span>
            </Link>
            <p className="mt-3 text-sm text-[color:var(--muted)] leading-relaxed">
              Единая фитнес-платформа для тренировок, питания и прогресса. Тренеры, программы, магазин — всё в одном месте.
            </p>

            {/* Соцсети */}
            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--stroke)] bg-[color:var(--bg)] text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Навигация */}
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

          {/* Залы */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)]">Наши залы</h3>
            <ul className="mt-4 grid gap-4">
              {locations.map((loc) => (
                <li key={loc.name} className="text-sm">
                  <div className="font-semibold text-[color:var(--text)]">{loc.name}</div>
                  <div className="text-[color:var(--muted)]">{loc.address}</div>
                  <div className="text-[color:var(--muted)] text-xs">{loc.hours}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text)]">Контакты</h3>
            <ul className="mt-4 grid gap-2.5 text-sm text-[color:var(--muted)]">
              <li>
                <a href="tel:+79990000000" className="transition hover:text-[color:var(--text)]">
                  +7 (999) 000-00-00
                </a>
              </li>
              <li>
                <a href="mailto:info@nashfit.ru" className="transition hover:text-[color:var(--text)]">
                  info@nashfit.ru
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://vk.com/nashfit_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)] hover:text-white"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.61 2.18-3.61.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                  </svg>
                  Поддержка ВКонтакте
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя строка */}
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
