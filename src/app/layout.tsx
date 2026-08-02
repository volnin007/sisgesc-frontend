import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { AuthGuard } from '@/components/AuthGuard';

export const metadata = {
  title: 'SISGESC - Dimas Nasser | Volnin Tech Hacker',
  description:
    'Sistema de Gestão Escolar - Escola Municipal Dimas Nasser - Pré ao 9º Ano - Volnin Tech Hacker (66) 93618-2776',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <AuthGuard>
          <LayoutShell>{children}</LayoutShell>
        </AuthGuard>
      </body>
    </html>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 md:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm md:text-base">
              Escola Municipal Dimas Nasser
            </h2>
            <p className="text-[11px] text-gray-400">Pré-Escola ao 9º Ano · Gestão 2025/2028</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full font-medium">
              Volnin Tech
            </span>
          </div>
        </header>
        <div className="p-6 md:p-8 flex-1">{children}</div>
        <footer className="bg-[#0a0f1a] border-t border-cyan-500/10 px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs">
          <div>
            <p className="font-bold text-white tracking-wider">VOLNIN TECH HACKER</p>
            <p className="text-[10px] text-cyan-300/60 tracking-widest">ETHICAL | SECURITY | CODE</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold text-white">(66) 93618-2776</p>
            <p className="text-[11px] text-gray-400">SISGESC · Dimas Nasser</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
