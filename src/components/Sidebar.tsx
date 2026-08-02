'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  FileText,
  BookOpen,
  Bot,
  LogOut,
  UserCog,
  Shield,
  ClipboardList,
} from 'lucide-react';

const menu = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/matricula', label: 'Nova Matrícula', icon: ClipboardList },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/turmas', label: 'Turmas', icon: GraduationCap },
  { href: '/professores', label: 'Professores', icon: UserCog },
  { href: '/diario', label: 'Diário de Classe', icon: BookOpen },
  { href: '/frequencia', label: 'Frequência', icon: ClipboardCheck },
  { href: '/boletim/1', label: 'Boletins', icon: FileText },
  { href: '/usuarios', label: 'Usuários', icon: Shield },
  { href: '/ia-duvidas', label: 'IA Dúvidas', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const sair = () => {
    localStorage.removeItem('sisgesc_token');
    localStorage.removeItem('sisgesc_user');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#0a0f1a] text-white min-h-screen p-4 flex flex-col border-r border-cyan-500/10 shrink-0 hidden md:flex">
      <div className="mb-6 flex flex-col items-center">
        <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">VOLNIN</h1>
        <p className="text-[9px] font-bold tracking-[0.3em] text-cyan-300/70 -mt-1">TECH HACKER</p>
        <div className="mt-3 text-center">
          <p className="text-sm font-bold text-white">SISGESC</p>
          <p className="text-[10px] text-cyan-200/60">Dimas Nasser<br />Pré ao 9º Ano</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menu.map((m) => {
          const base = m.href === '/' ? '/' : '/' + m.href.split('/').filter(Boolean)[0];
          const isActive =
            m.href === '/' ? pathname === '/' : pathname === m.href || pathname.startsWith(base + '/') || pathname === base;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 to-green-600/30 border border-cyan-500/20 text-cyan-300'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <m.icon size={18} /> {m.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
        <button
          onClick={sair}
          className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-400 py-2 rounded-lg hover:bg-white/5 transition"
        >
          <LogOut size={14} /> Sair
        </button>
        <div className="text-center space-y-1">
          <p className="text-[9px] tracking-widest text-cyan-300/50">ETHICAL | SECURITY | CODE</p>
          <p className="text-[11px] text-cyan-300 font-mono">(66) 93618-2776</p>
        </div>
      </div>
    </aside>
  );
}
