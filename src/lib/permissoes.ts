export type PermissoesMap = Record<string, boolean>;

export type MenuItem = {
  label: string;
  href?: string;
  perm?: string;
  children?: { label: string; href: string; perm: string }[];
};

/** Estrutura de módulos principais + submódulos */
export const MENU_HIERARQUIA: MenuItem[] = [
  { label: 'Dashboard', href: '/', perm: 'dashboard' },
  {
    label: 'Secretaria',
    children: [
      { label: 'Matrículas', href: '/matricula', perm: 'secretaria.matriculas' },
      { label: 'Alunos', href: '/alunos', perm: 'secretaria.alunos' },
      { label: 'Turmas', href: '/turmas', perm: 'secretaria.turmas' },
      { label: 'Declaração / Transferência', href: '/secretaria/declaracao', perm: 'secretaria.declaracao' },
      { label: 'Histórico Escolar', href: '/secretaria/historico', perm: 'secretaria.declaracao' },
      { label: 'Censo Escolar', href: '/censo', perm: 'censo' },
    ],
  },
  {
    label: 'Coordenação',
    children: [
      { label: 'Planejamentos', href: '/coordenacao', perm: 'coordenacao.planejamentos' },
      { label: 'Busca Ativa', href: '/coordenacao/busca-ativa', perm: 'coordenacao.busca_ativa' },
      { label: 'Responsável', href: '/coordenacao/responsavel', perm: 'coordenacao.responsavel' },
      { label: 'Advertência', href: '/coordenacao/advertencia', perm: 'coordenacao.advertencia' },
      { label: 'Suspensão', href: '/coordenacao/suspensao', perm: 'coordenacao.suspensao' },
    ],
  },
  {
    label: 'Professores',
    children: [
      { label: 'Planejamentos', href: '/professores', perm: 'professores.planejamentos' },
      { label: 'Diários de Classe', href: '/diario', perm: 'professores.diarios' },
      { label: 'Frequência', href: '/frequencia', perm: 'professores.frequencia' },
      { label: 'Boletins', href: '/boletim/1', perm: 'professores.boletins' },
    ],
  },
  {
    label: 'AEE',
    children: [
      { label: 'Professores Apoio', href: '/aee/professores-apoio', perm: 'aee.professores_apoio' },
      { label: 'PEI', href: '/aee/pei', perm: 'aee.pei' },
      { label: 'Relatório AEE', href: '/aee/relatorio', perm: 'aee.relatorio' },
    ],
  },
  { label: 'Ocorrências', href: '/ocorrencias', perm: 'ocorrencias' },
  { label: 'Calendário', href: '/calendario', perm: 'calendario' },
  { label: 'Avisos WhatsApp', href: '/avisos', perm: 'avisos' },
  { label: 'Usuários', href: '/usuarios', perm: 'usuarios' },
  { label: 'IA Dúvidas', href: '/ia-duvidas', perm: 'ia_duvidas' },
  { label: 'Configuração', href: '/configuracao', perm: 'configuracao' },
];

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sisgesc_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminUser(user?: any | null): boolean {
  const u = user ?? getStoredUser();
  return u?.perfil === 'ADMIN' || u?.isAdmin === true;
}

export function hasPerm(perm: string | undefined, user?: any | null): boolean {
  if (!perm) return true;
  const u = user ?? getStoredUser();
  if (!u) return false;
  if (u.perfil === 'ADMIN' || u.isAdmin) return true;
  const map = u.permissoes || {};
  return map[perm] === true;
}

export function filterMenuByPerm(user?: any | null): MenuItem[] {
  const u = user ?? getStoredUser();
  return MENU_HIERARQUIA.map((item) => {
    if (item.children) {
      const children = item.children.filter((c) => hasPerm(c.perm, u));
      if (!children.length) return null;
      return { ...item, children };
    }
    return hasPerm(item.perm, u) ? item : null;
  }).filter(Boolean) as MenuItem[];
}
