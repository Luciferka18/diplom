import './globals.css';

export const metadata = {
  title: 'FitLab Frontend',
  description: 'Frontend for FitLab gym platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
