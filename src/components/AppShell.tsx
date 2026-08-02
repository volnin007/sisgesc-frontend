'use client';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AuthGuard } from '@/components/AuthGuard';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import { PanelLeftOpen } from 'lucide-react';
import { LOGO_ESCOLA_SM, LOGO_VOLNIN_SM } from '@/lib/logos';

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const { collapsed, toggle } = useSidebar();

  if (isLogin) return <>{children}</>;

  return (
    <div className="app-shell bg-slate-100">
      <Sidebar />
      <main className="app-main">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex justify-between items-center shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={toggle}
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 shrink-0"
              title="Menu"
            >
              <PanelLeftOpen size={18} />
            </button>
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_ESCOLA_SM}
                alt="Escola Municipal Dimas Nasser"
                className="hidden sm:block h-11 w-11 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate">
                  Escola Municipal Dimas Nasser
                </h2>
                <p className="text-[11px] text-slate-600 font-medium truncate">
                  Pré-Escola ao 9º Ano · Gestão 2025/2028
                  {collapsed ? ' · menu recolhido' : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_VOLNIN_SM} alt="Volnin Tech Hacker" className="h-9 w-9 object-contain hidden sm:block" />
            <span className="hidden lg:inline text-[11px] bg-cyan-50 text-cyan-900 border border-cyan-200 px-2.5 py-1 rounded-full font-bold tracking-wide">
              VOLNIN TECH HACKER
            </span>
          </div>
        </header>

        <div className="app-main-scroll">
          <div className="p-5 md:p-8 text-slate-900">{children}</div>
          <footer className="bg-[#0a0f1a] border-t border-cyan-500/10 px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_VOLNIN_SM} alt="Volnin" className="h-9 w-9 object-contain" />
              <div>
                <p className="font-bold text-white tracking-wider">VOLNIN TECH HACKER</p>
                <p className="text-[10px] text-cyan-300/70 tracking-widest">ETHICAL | SECURITY | CODE</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="font-bold text-white">(66) 93618-2776</p>
              <p className="text-[11px] text-gray-400">SISGESC · Dimas Nasser</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <ShellInner>{children}</ShellInner>
      </SidebarProvider>
    </AuthGuard>
  );
}
