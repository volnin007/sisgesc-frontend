import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata = {
  title: 'SISGESC - Dimas Nasser | Volnin Tech Hacker',
  description: 'Gestão Escolar Pré ao 9º - Escola Municipal Dimas Nasser - Volnin Tech Hacker (66) 93618-2776',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 min-h-screen flex flex-col">
          <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
            <h2 className="font-semibold text-gray-800">Escola Municipal Dimas Nasser - Pré-Escola ao 9º Ano</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Secretaria</span>
              <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1 rounded-full">Volnin Tech</span>
            </div>
          </div>
          <div className="p-8 flex-1">{children}</div>
          <footer className="bg-[#0a0f1a] border-t border-cyan-500/10 px-8 py-4 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-white tracking-wider">VOLNIN TECH HACKER</p>
              <p className="text-[10px] text-cyan-300/60 tracking-widest">ETHICAL | SECURITY | CODE</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">Volnin Tech Hacker - (66) 93618-2776</p>
              <p className="text-[11px] text-gray-400">Escola Municipal Dimas Nasser - Gestão 2025/2028</p>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
