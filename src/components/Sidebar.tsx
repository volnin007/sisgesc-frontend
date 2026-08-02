'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  MessageCircle,
  ClipboardPen,
  Settings,
  ChevronDown,
  Building2,
  Accessibility,
  FileSignature,
  ScrollText,
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';
import { LOGO_ESCOLA_SM, LOGO_VOLNIN_SM } from '@/lib/logos';
import { filterMenuByPerm, getStoredUser, type MenuItem } from '@/lib/permissoes';

const IDLE_MS = 30_000;

const iconByLabel: Record<string, any> = {
  Dashboard: LayoutDashboard,
  Secretaria: Building2,
  Coordenação: ClipboardPen,
  Professores: UserCog,
  AEE: Accessibility,
  Ocorrências: AlertTriangle,
  Calendário: CalendarDays,
  'Avisos WhatsApp': MessageCircle,
  Usuários: Shield,
  'IA Dúvidas': Bot,
  Configuração: Settings,
  Matrículas: ClipboardList,
  Alunos: Users,
  Turmas: GraduationCap,
  'Declaração / Transferência': FileSignature,
  'Histórico Escolar': ScrollText,
  'Censo Escolar': BarChart3,
  'Diários de Classe': BookOpen,
  Frequência: ClipboardCheck,
  Boletins: FileText,
  Planejamentos: ClipboardPen,
};

function pathActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggle } = useSidebar();
  const [user, setUser] = useState<any>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const menu = useMemo(() => filterMenuByPerm(user), [user]);

  // Abre apenas o grupo do módulo atual; fecha os demais
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of menu) {
      if (item.children) {
        next[item.label] = item.children.some((c) => pathActive(pathname, c.href));
      }
    }
    setOpenGroups(next);
  }, [pathname, menu]);

  // Fecha grupos após 30s de inatividade
  useEffect(() => {
    const resetIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setOpenGroups((prev) => {
          const closed: Record<string, boolean> = {};
          for (const k of Object.keys(prev)) closed[k] = false;
          // mantém aberto só o grupo da rota atual
          for (const item of menu) {
            if (item.children?.some((c) => pathActive(pathname, c.href))) {
              closed[item.label] = true;
            }
          }
          return closed;
        });
      }, IDLE_MS);
    };
    const events = ['click', 'keydown', 'mousemove', 'touchstart'] as const;
    events.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
    resetIdle();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((ev) => window.removeEventListener(ev, resetIdle));
    };
  }, [menu, pathname]);

  if (pathname === '/login') return null;

  const sair = () => {
    localStorage.removeItem('sisgesc_token');
    localStorage.removeItem('sisgesc_user');
    router.push('/login');
  };

  // Ao abrir um grupo, fecha os outros automaticamente
  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => {
      const willOpen = !prev[label];
      const next: Record<string, boolean> = {};
      for (const k of Object.keys(prev)) next[k] = false;
      next[label] = willOpen;
      return next;
    });

  const renderLeaf = (label: string, href: string, depth = 0) => {
    const Icon = iconByLabel[label] || FileText;
    const active = pathActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        title={label}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition ${
          active
            ? 'bg-gradient-to-r from-cyan-600/30 to-green-600/30 border border-cyan-500/20 text-cyan-200'
            : 'hover:bg-white/5 text-gray-300 hover:text-white'
        } ${collapsed ? 'justify-center' : ''} ${depth ? 'ml-2' : ''}`}
      >
        <Icon size={depth ? 15 : 17} className="shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const renderItem = (item: MenuItem) => {
    if (!item.children?.length) {
      return renderLeaf(item.label, item.href || '/');
    }
    const Icon = iconByLabel[item.label] || Building2;
    const open = !!openGroups[item.label];
    const groupActive = item.children.some((c) => pathActive(pathname, c.href));

    if (collapsed) {
      return (
        <div key={item.label} className="space-y-0.5">
          <button
            type="button"
            title={item.label}
            onClick={() => toggleGroup(item.label)}
            className={`w-full flex justify-center p-2 rounded-lg ${
              groupActive ? 'bg-cyan-600/20 text-cyan-200' : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
          </button>
          {open && item.children.map((c) => renderLeaf(c.label, c.href, 1))}
        </div>
      );
    }

    return (
      <div key={item.label} className="space-y-0.5">
        <button
          type="button"
          onClick={() => toggleGroup(item.label)}
          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition ${
            groupActive
              ? 'bg-white/5 text-cyan-200'
              : 'text-gray-200 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Icon size={17} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="pl-2 border-l border-cyan-500/15 ml-4 space-y-0.5">
            {item.children.map((c) => renderLeaf(c.label, c.href, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`app-sidebar ${
        collapsed ? 'w-[76px]' : 'w-64'
      } bg-[#0a0f1a] text-white p-3 flex flex-col border-r border-cyan-500/10 hidden md:flex transition-all duration-200`}
    >
      <div className={`mb-4 flex ${collapsed ? 'flex-col items-center gap-2' : 'items-start'} gap-2`}>
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
              <img src={LOGO_ESCOLA_SM} alt="Dimas Nasser" className="mx-auto mb-1 h-14 w-14 object-contain" />
              <p className="text-xs font-bold text-white leading-tight">SISGESC</p>
              <p className="text-[10px] text-cyan-100 leading-snug">Escola Municipal Dimas Nasser</p>
              {user?.perfil && (
                <p className="text-[9px] text-emerald-300 mt-1 font-semibold">{user.perfil}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto pr-0.5">{menu.map(renderItem)}</nav>

      {/* Controles na parte inferior — não atrapalha no mobile */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-2 shrink-0">
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 text-xs text-cyan-300 hover:text-white py-2 rounded-lg hover:bg-white/5 transition"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && (collapsed ? 'Expandir' : 'Recolher menu')}
        </button>
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
