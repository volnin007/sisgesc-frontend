'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getStoredUser, isAdminUser } from '@/lib/permissoes';
import { Settings, Shield, Users, KeyRound } from 'lucide-react';

export default function ConfiguracaoPage() {
  const [user, setUser] = useState<any>(null);
  const [catalogo, setCatalogo] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u);
    if (!isAdminUser(u)) return;
    api.get('/usuarios/catalogo').then((r) => setCatalogo(r.data)).catch(() => {});
    api.get('/usuarios').then((r) => setUsuarios(r.data || [])).catch(() => {});
  }, []);

  if (user && !isAdminUser(user)) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <Shield className="mx-auto text-red-600 mb-2" />
        <h1 className="text-xl font-black text-slate-900">Acesso restrito</h1>
        <p className="text-sm text-slate-700 mt-1">
          Somente o <strong>Administrador</strong> do sistema pode acessar Configuração.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-900 text-cyan-300 flex items-center justify-center">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Configuração do sistema</h1>
          <p className="text-sm text-slate-600">
            Admin total · usuários · perfis · módulos liberados
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/usuarios" className="rounded-2xl border bg-white p-4 shadow-sm hover:border-cyan-300 transition">
          <Users className="text-cyan-700 mb-2" size={20} />
          <p className="font-bold text-slate-900">Gerenciar usuários</p>
          <p className="text-xs text-slate-600 mt-1">Criar, editar perfil e permissões por módulo</p>
        </Link>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <KeyRound className="text-emerald-700 mb-2" size={20} />
          <p className="font-bold text-slate-900">Seu acesso</p>
          <p className="text-xs text-slate-600 mt-1">
            {user?.nome} · <span className="font-semibold">{user?.perfil}</span>
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Shield className="text-indigo-700 mb-2" size={20} />
          <p className="font-bold text-slate-900">Usuários ativos</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {usuarios.filter((u) => u.ativo !== false).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Privilegios do Administrador
        </h2>
        <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
          <li>Acesso a todos os módulos e submódulos</li>
          <li>Criar e desativar usuários</li>
          <li>Definir perfil (Direção, Coordenação, Secretaria, Professor, AEE, etc.)</li>
          <li>Liberar ou bloquear módulos individualmente (acesso total, semi-total ou parcial)</li>
          <li>Excluir dados e mediar o sistema</li>
        </ul>
      </div>

      {catalogo?.modulos && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Catálogo de módulos controláveis
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
            {catalogo.modulos.map((m: any) => (
              <div key={m.key} className="px-4 py-2.5 border-b text-sm flex justify-between gap-2">
                <span className="font-medium text-slate-900">{m.label}</span>
                <span className="text-[11px] text-slate-500">{m.grupo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
