'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, ClipboardCheck, FileText, BookOpen } from 'lucide-react';

const menu = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/turmas', label: 'Turmas', icon: GraduationCap },
  { href: '/diario', label: 'Diário de Classe', icon: BookOpen },
  { href: '/frequencia', label: 'Frequência', icon: ClipboardCheck },
  { href: '/boletim/1', label: 'Boletins', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#0a0f1a] text-white min-h-screen p-4 flex flex-col border-r border-cyan-500/10">
      <div className="mb-6 flex flex-col items-center">
        <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">VOLNIN</h1>
        <p className="text-[9px] font-bold tracking-[0.3em] text-cyan-300/70 -mt-1">TECH HACKER</p>
        <div className="mt-3 text-center">
          <p className="text-sm font-bold text-white">SISGESC</p>
          <p className="text-[10px] text-cyan-200/60">Dimas Nasser<br/>Pré ao 9º Ano</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {menu.map(m => {
          const active = pathname === m.href;
          return (
            <Link key={m.href} href={m.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? 'bg-gradient-to-r from-cyan-600/30 to-green-600/30 border border-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
              <m.icon size={18} /> {m.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
        <p className="text-[9px] tracking-widest text-cyan-300/50">ETHICAL | SECURITY | CODE</p>
        <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
          <p className="text-xs font-bold text-white">Volnin Tech Hacker</p>
          <p className="text-[11px] text-cyan-300 font-mono">(66) 93618-2776</p>
        </div>
      </div>
    </aside>
  );
}
