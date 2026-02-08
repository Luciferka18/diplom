import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FitLab Gym",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-[#F7FAF7] text-[#2D6033]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
