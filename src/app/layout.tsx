import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata = {
  title: 'SISGESC - Dimas Nasser | Volnin Tech Hacker',
  description:
    'Sistema de Gestão Escolar - Escola Municipal Dimas Nasser - Pré ao 9º Ano - Volnin Tech Hacker (66) 93618-2776',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
