import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'SISGESC - Dimas Nasser | Volnin Tech Hacker',
  description: 'Gestão Escolar Pré ao 9º - Volnin Tech Hacker (66) 93618-2776',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
