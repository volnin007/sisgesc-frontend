'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { isAdminUser, getStoredUser } from '@/lib/permissoes';
import { Shield, Save } from 'lucide-react';

const PERFIS = [
  { codigo: 'ADMIN', label: 'Administrador' },
  { codigo: 'DIRECAO', label: 'Direção' },
  { codigo: 'COORDENACAO', label: 'Coordenação' },
  { codigo: 'SECRETARIA', label: 'Secretário(a)' },
  { codigo: 'TECNICO_ADMINISTRATIVO', label: 'Técnico Administrativo' },
  { codigo: 'PROFESSOR', label: 'Professor' },
  { codigo: 'AEE', label: 'AEE' },
  { codigo: 'ALUNO', label: 'Aluno' },
  { codigo: 'RESPONSAVEL', label: 'Responsável' },
];

export default function UsuariosPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [perfisInfo, setPerfisInfo] = useState<any[]>([]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'PROFESSOR',
  });
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const admin = isAdminUser();

  const grupos = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const m of catalogo) {
      if (!map[m.grupo]) map[m.grupo] = [];
      map[m.grupo].push(m);
    }
    return map;
  }, [catalogo]);

  const carregar = () =>
    api
      .get('/usuarios')
      .then((r) => setLista(r.data))
      .catch(() => setErro('Sem permissão ou API indisponível'));

  useEffect(() => {
    carregar();
    api.get('/usuarios/perfis').then((r) => {
      setPerfisInfo(r.data.perfis || []);
      setCatalogo(r.data.catalogo || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const info = perfisInfo.find((p) => p.codigo === form.perfil);
    if (!info) return;
    const next: Record<string, boolean> = {};
    for (const m of catalogo) next[m.key] = false;
    for (const k of info.modulos || []) next[k] = true;
    if (form.perfil === 'ADMIN') {
      for (const m of catalogo) next[m.key] = true;
    }
    setPerms(next);
  }, [form.perfil, perfisInfo, catalogo]);

  const criarOuSalvar = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErro('');
    if (!admin) {
      setErro('Somente o Administrador pode gerenciar usuários.');
      return;
    }
    try {
      if (editId) {
        await api.patch(`/usuarios/${editId}`, {
          nome: form.nome,
          perfil: form.perfil,
          permissoes: form.perfil === 'ADMIN' ? null : perms,
          ...(form.senha ? { senha: form.senha } : {}),
        });
        setMsg('Usuário atualizado.');
      } else {
        await api.post('/usuarios', {
          ...form,
          permissoes: form.perfil === 'ADMIN' ? null : perms,
        });
        setMsg('Usuário criado com sucesso.');
      }
      setForm({ nome: '', email: '', senha: '', perfil: 'PROFESSOR' });
      setEditId(null);
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const editar = (u: any) => {
    setEditId(u.id);
    setForm({
      nome: u.nome,
      email: u.email,
      senha: '',
      perfil: u.perfil === 'DIRETORA' ? 'DIRECAO' : u.perfil,
    });
    if (u.permissoesEfetivas) setPerms(u.permissoesEfetivas);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAtivo = async (u: any) => {
    try {
      await api.patch(`/usuarios/${u.id}`, { ativo: !u.ativo });
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Falha ao alterar status');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Shield className="text-cyan-600" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Usuários do sistema</h1>
          <p className="text-sm text-slate-600">Perfis · regras de acesso por módulo</p>
        </div>
      </div>

      {!admin && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Visualização limitada. Edição de usuários e permissões é exclusiva do Administrador
          ({getStoredUser()?.perfil || 'seu perfil'}).
        </div>
      )}

      {msg && <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">{msg}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}

      {admin && (
        <form onSubmit={criarOuSalvar} className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
            {editId ? 'Editar usuário' : 'Novo usuário'}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
            <input required={!editId} disabled={!!editId} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2.5 rounded-lg text-sm disabled:bg-slate-50" />
            <input required={!editId} type="password" placeholder={editId ? 'Nova senha (opcional)' : 'Senha (mín. 6)'} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
            <select value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })} className="border p-2.5 rounded-lg text-sm">
              {PERFIS.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.label}</option>
              ))}
            </select>
          </div>

          {form.perfil !== 'ADMIN' && catalogo.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold text-slate-800">Módulos liberados (personalizável)</p>
              {Object.entries(grupos).map(([grupo, mods]) => (
                <div key={grupo}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{grupo}</p>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {mods.map((m) => (
                      <label key={m.key} className="flex items-center gap-2 text-sm text-slate-800">
                        <input
                          type="checkbox"
                          checked={!!perms[m.key]}
                          onChange={(e) => setPerms((prev) => ({ ...prev, [m.key]: e.target.checked }))}
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="inline-flex items-center gap-2 bg-green-700 text-white py-2.5 px-5 rounded-xl text-sm font-bold">
              <Save size={16} /> {editId ? 'Salvar alterações' : 'Criar usuário'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ nome: '', email: '', senha: '', perfil: 'PROFESSOR' }); }} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Email</th>
              <th className="p-3">Perfil</th>
              <th className="p-3">Status</th>
              {admin && <th className="p-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.nome}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-semibold">{u.perfil}</span>
                </td>
                <td className="p-3">
                  <span className={`text-xs font-semibold ${u.ativo === false ? 'text-red-600' : 'text-emerald-700'}`}>
                    {u.ativo === false ? 'Inativo' : 'Ativo'}
                  </span>
                </td>
                {admin && (
                  <td className="p-3 space-x-2">
                    <button type="button" onClick={() => editar(u)} className="text-cyan-700 font-semibold text-xs hover:underline">Editar</button>
                    <button type="button" onClick={() => toggleAtivo(u)} className="text-slate-600 font-semibold text-xs hover:underline">
                      {u.ativo === false ? 'Ativar' : 'Desativar'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
