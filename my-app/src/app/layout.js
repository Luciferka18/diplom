import "./globals.css";
import "./legacy-components.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

export const metadata = {
  title: "FitLab",
  description: "Fitness platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Navbar />
          <div className="hidden bg-red-500" aria-hidden="true" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
