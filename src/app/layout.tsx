import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JonsaengWeb',
  description: 'JonsaengWeb — AI 기반 서비스',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <div className="app-container">{children}</div>
      </body>
    </html>
  );
}
