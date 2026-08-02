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
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { LOGO_ESCOLA_SM, LOGO_VOLNIN_SM } from '@/lib/logos';

const menu = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/matricula', label: 'Nova Matrícula', icon: ClipboardList },
  { href: '/alunos', label: 'Alunos / Fichas', icon: Users },
  { href: '/turmas', label: 'Turmas', icon: GraduationCap },
  { href: '/professores', label: 'Professores', icon: UserCog },
  { href: '/diario', label: 'Diário de Classe', icon: BookOpen },
  { href: '/frequencia', label: 'Frequência', icon: ClipboardCheck },
  { href: '/ocorrencias', label: 'Ocorrências', icon: AlertTriangle },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/censo', label: 'Censo Escolar', icon: BarChart3 },
  { href: '/boletim/1', label: 'Boletins', icon: FileText },
  { href: '/usuarios', label: 'Usuários', icon: Shield },
  { href: '/ia-duvidas', label: 'IA Dúvidas', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggle } = useSidebar();

  if (pathname === '/login') return null;

  const sair = () => {
    localStorage.removeItem('sisgesc_token');
    localStorage.removeItem('sisgesc_user');
    router.push('/login');
  };

  return (
    <aside
      className={`app-sidebar ${
        collapsed ? 'w-[76px]' : 'w-64'
      } bg-[#0a0f1a] text-white p-3 flex flex-col border-r border-cyan-500/10 hidden md:flex transition-all duration-200`}
    >
      <div className={`mb-4 flex ${collapsed ? 'flex-col items-center gap-2' : 'items-start justify-between'} gap-2`}>
        <div className="flex flex-col items-center w-full gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_VOLNIN_SM}
            alt="Volnin Tech Hacker"
            className={`${collapsed ? 'h-10 w-10' : 'h-12 w-12'} object-contain`}
          />
          {!collapsed && (
            <div className="text-center">
              <p className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400 leading-tight">
                VOLNIN
              </p>
              <p className="text-[8px] font-bold tracking-[0.25em] text-cyan-300/70">TECH HACKER</p>
            </div>
          )}
          {!collapsed && (
            <div className="w-full rounded-xl border border-cyan-500/20 bg-white/5 p-2.5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_ESCOLA_SM}
                alt="Dimas Nasser"
                className="mx-auto mb-1 h-14 w-14 object-contain"
              />
              <p className="text-xs font-bold text-white leading-tight">SISGESC</p>
              <p className="text-[10px] text-cyan-100/70 leading-snug">Escola Municipal Dimas Nasser</p>
              <p className="text-[9px] text-cyan-200/50">Pré ao 9º Ano</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-300/80 self-end"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5">
        {menu.map((m) => {
          const base = m.href === '/' ? '/' : '/' + m.href.split('/').filter(Boolean)[0];
          const isActive =
            m.href === '/' ? pathname === '/' : pathname === m.href || pathname.startsWith(base + '/') || pathname === base;
          return (
            <Link
              key={m.href}
              href={m.href}
              title={m.label}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 to-green-600/30 border border-cyan-500/20 text-cyan-200'
                  : 'hover:bg-white/5 text-gray-300 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <m.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{m.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-3 border-t border-white/10 space-y-2 shrink-0">
        <button
          onClick={sair}
          className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-400 py-2 rounded-lg hover:bg-white/5 transition"
          title="Sair"
        >
          <LogOut size={14} />
          {!collapsed && 'Sair'}
        </button>
        {!collapsed && (
          <div className="text-center space-y-0.5">
            <p className="text-[9px] tracking-widest text-cyan-300/50">ETHICAL | SECURITY | CODE</p>
            <p className="text-[11px] text-cyan-300 font-mono">(66) 93618-2776</p>
          </div>
        )}
      </div>
    </aside>
  );
}
