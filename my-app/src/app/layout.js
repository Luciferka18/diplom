import "./globals.css";
import "./legacy-components.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers.js";

export const metadata = {
  title: {
    default: "НашФит — фитнес-клуб и платформа тренировок",
    template: "%s | НашФит",
  },
  description: "Тренировки, программы, тренеры, статьи и магазин фитнес-клуба «НашФит».",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('nashfit-theme') || localStorage.getItem('theme');
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'dark' || stored === 'light' ? stored : (systemDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
