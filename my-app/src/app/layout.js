import Link from 'next/link';
import Providers from './providers';
import './globals.css';

export const metadata = {
  title: 'FitLab Frontend',
  description: 'Тестовый интерфейс для проверки функционала FitLab',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <header className="page" style={{ paddingBottom: 0 }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>FitLab • Frontend</strong>
            <Link className="button button--ghost" href="/">Главная</Link>
          </div>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
