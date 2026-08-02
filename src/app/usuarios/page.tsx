'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { isAdminUser, getStoredUser } from '@/lib/permissoes';
import { Shield, Save, KeyRound } from 'lucide-react';

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

const TIPOS_DOCENTE = [
  { value: '', label: 'Não se aplica' },
  { value: 'REGENTE', label: 'Regente' },
  { value: 'APOIO', label: 'Apoio / AEE sala' },
  { value: 'AEE', label: 'Professor AEE' },
  { value: 'ESPECIALISTA', label: 'Especialista (disciplina)' },
];

export default function UsuariosPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [perfisInfo, setPerfisInfo] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'PROFESSOR',
  });
  const [docente, setDocente] = useState({
    tipoDocente: '',
    disciplinas: '',
    posGraduacao: false,
    nomePos: '',
    formacao: '',
    habilitacaoInfantil: false,
    alunoApoioId: '',
    turmaApoio: '',
  });
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [minhaSenha, setMinhaSenha] = useState({ atual: '', nova: '' });
  const admin = isAdminUser();
  const me = getStoredUser();

  const grupos = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const m of catalogo) {
      if (!map[m.grupo]) map[m.grupo] = [];
      map[m.grupo].push(m);
    }
    return map;
  }, [catalogo]);

  const showDocente = ['PROFESSOR', 'AEE'].includes(form.perfil);

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
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const info = perfisInfo.find((p) => p.codigo === form.perfil);
    if (!info) return;
    const next: Record<string, boolean> = {};
    for (const m of catalogo) next[m.key] = false;
    for (const k of info.modulos || []) next[k] = true;
    if (form.perfil === 'ADMIN') for (const m of catalogo) next[m.key] = true;
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
    const dadosExtras = showDocente
      ? {
          tipoDocente: docente.tipoDocente || null,
          disciplinas: docente.disciplinas
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean),
          posGraduacao: docente.posGraduacao,
          nomePos: docente.nomePos || null,
          formacao: docente.formacao || null,
          habilitacaoInfantil: docente.habilitacaoInfantil,
          alunoApoioId: docente.alunoApoioId ? Number(docente.alunoApoioId) : null,
          turmaApoio: docente.turmaApoio || null,
        }
      : null;

    try {
      if (editId) {
        await api.patch(`/usuarios/${editId}`, {
          nome: form.nome,
          perfil: form.perfil,
          permissoes: form.perfil === 'ADMIN' ? null : perms,
          dadosExtras,
          ...(form.senha ? { senha: form.senha } : {}),
        });
        setMsg('Usuário atualizado.');
      } else {
        await api.post('/usuarios', {
          ...form,
          permissoes: form.perfil === 'ADMIN' ? null : perms,
          dadosExtras,
        });
        setMsg('Usuário criado. Se for professor, também espelha no quadro docente.');
      }
      setForm({ nome: '', email: '', senha: '', perfil: 'PROFESSOR' });
      setDocente({
        tipoDocente: '',
        disciplinas: '',
        posGraduacao: false,
        nomePos: '',
        formacao: '',
        habilitacaoInfantil: false,
        alunoApoioId: '',
        turmaApoio: '',
      });
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
    const d = u.dadosExtras || {};
    setDocente({
      tipoDocente: d.tipoDocente || '',
      disciplinas: Array.isArray(d.disciplinas) ? d.disciplinas.join(', ') : d.disciplinas || '',
      posGraduacao: Boolean(d.posGraduacao),
      nomePos: d.nomePos || '',
      formacao: d.formacao || '',
      habilitacaoInfantil: Boolean(d.habilitacaoInfantil),
      alunoApoioId: d.alunoApoioId ? String(d.alunoApoioId) : '',
      turmaApoio: d.turmaApoio || '',
    });
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

  const autorizarSenha = async (u: any) => {
    try {
      await api.patch(`/usuarios/${u.id}`, { trocaSenhaAutorizada: true, solicitacaoTrocaSenha: true });
      setMsg(`Troca de senha autorizada para ${u.nome}.`);
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Falha ao autorizar');
    }
  };

  const solicitarSenha = async () => {
    if (!me?.id) return;
    try {
      await api.post(`/usuarios/${me.id}/solicitar-troca-senha`);
      setMsg('Solicitação de troca de senha enviada ao Administrador.');
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Falha ao solicitar');
    }
  };

  const trocarMinhaSenha = async (e: FormEvent) => {
    e.preventDefault();
    if (!me?.id) return;
    try {
      await api.post(`/usuarios/${me.id}/trocar-senha`, {
        senha: minhaSenha.nova,
        senhaAtual: minhaSenha.atual || undefined,
      });
      setMsg('Senha alterada com sucesso.');
      setMinhaSenha({ atual: '', nova: '' });
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Não autorizado ou senha inválida');
    }
  };

  const meFull = lista.find((u) => u.id === me?.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Shield className="text-cyan-600" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Usuários do sistema</h1>
          <p className="text-sm text-slate-600">Cadastro completo · perfis · docentes · senhas</p>
        </div>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">{msg}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}

      {/* Troca de senha do usuário logado */}
      <form onSubmit={trocarMinhaSenha} className="bg-white p-5 rounded-2xl border space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <KeyRound size={16} /> Minha senha
        </h2>
        <p className="text-xs text-slate-600">
          {meFull?.trocaSenhaAutorizada
            ? 'Admin autorizou a troca. Informe a nova senha.'
            : meFull?.solicitacaoTrocaSenha
            ? 'Aguardando autorização do Administrador.'
            : 'Solicite ao Admin para liberar a troca, ou (se Admin) altere direto.'}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="password" placeholder="Senha atual (opcional se autorizado)" value={minhaSenha.atual} onChange={(e) => setMinhaSenha({ ...minhaSenha, atual: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
          <input required type="password" placeholder="Nova senha (mín. 6)" value={minhaSenha.nova} onChange={(e) => setMinhaSenha({ ...minhaSenha, nova: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={solicitarSenha} className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-800">
            Solicitar autorização ao Admin
          </button>
          <button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold">
            Alterar senha
          </button>
        </div>
      </form>

      {admin && (
        <form onSubmit={criarOuSalvar} className="bg-white p-6 rounded-2xl border space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
            {editId ? 'Editar usuário' : 'Novo usuário'}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
            <input required={!editId} disabled={!!editId} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900 disabled:bg-slate-50" />
            <input required={!editId} type="password" placeholder={editId ? 'Nova senha (opcional)' : 'Senha (mín. 6)'} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
            <select value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900">
              {PERFIS.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.label}</option>
              ))}
            </select>
          </div>

          {showDocente && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold text-slate-800">Dados docentes (Regente / Apoio / matérias / pós)</p>
              <div className="grid md:grid-cols-2 gap-3">
                <select value={docente.tipoDocente} onChange={(e) => setDocente({ ...docente, tipoDocente: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900">
                  {TIPOS_DOCENTE.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <input placeholder="Disciplinas (vírgula)" value={docente.disciplinas} onChange={(e) => setDocente({ ...docente, disciplinas: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
                <input placeholder="Formação / graduação" value={docente.formacao} onChange={(e) => setDocente({ ...docente, formacao: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <input type="checkbox" checked={docente.posGraduacao} onChange={(e) => setDocente({ ...docente, posGraduacao: e.target.checked })} />
                  Possui pós-graduação
                </label>
                {docente.posGraduacao && (
                  <input placeholder="Nome da pós-graduação" value={docente.nomePos} onChange={(e) => setDocente({ ...docente, nomePos: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900 md:col-span-2" />
                )}
                <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <input type="checkbox" checked={docente.habilitacaoInfantil} onChange={(e) => setDocente({ ...docente, habilitacaoInfantil: e.target.checked })} />
                  Habilitado Educação Infantil
                </label>
                {(docente.tipoDocente === 'APOIO' || docente.tipoDocente === 'AEE' || form.perfil === 'AEE') && (
                  <>
                    <select value={docente.alunoApoioId} onChange={(e) => setDocente({ ...docente, alunoApoioId: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900">
                      <option value="">Aluno especial (opcional)</option>
                      {alunos.filter((a) => a.deficiencia).map((a) => (
                        <option key={a.id} value={a.id}>{a.nomeCompleto}</option>
                      ))}
                      {alunos.filter((a) => !a.deficiencia).length > 0 && (
                        <option disabled>— demais alunos —</option>
                      )}
                      {alunos.filter((a) => !a.deficiencia).map((a) => (
                        <option key={a.id} value={a.id}>{a.nomeCompleto}</option>
                      ))}
                    </select>
                    <input placeholder="Turma / turno de atuação" value={docente.turmaApoio} onChange={(e) => setDocente({ ...docente, turmaApoio: e.target.value })} className="border p-2.5 rounded-lg text-sm text-slate-900" />
                  </>
                )}
              </div>
            </div>
          )}

          {form.perfil !== 'ADMIN' && catalogo.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-bold text-slate-800">Módulos liberados</p>
              {Object.entries(grupos).map(([grupo, mods]) => (
                <div key={grupo}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{grupo}</p>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {mods.map((m) => (
                      <label key={m.key} className="flex items-center gap-2 text-sm text-slate-800">
                        <input type="checkbox" checked={!!perms[m.key]} onChange={(e) => setPerms((prev) => ({ ...prev, [m.key]: e.target.checked }))} />
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
              <th className="p-3">Perfil / docente</th>
              <th className="p-3">Senha</th>
              <th className="p-3">Status</th>
              {admin && <th className="p-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => {
              const d = u.dadosExtras || {};
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium text-slate-900">{u.nome}</td>
                  <td className="p-3 text-slate-800">{u.email}</td>
                  <td className="p-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-semibold">{u.perfil}</span>
                    {d.tipoDocente && <span className="ml-1 text-[11px] text-cyan-800 font-semibold">{d.tipoDocente}</span>}
                  </td>
                  <td className="p-3 text-xs">
                    {u.solicitacaoTrocaSenha && !u.trocaSenhaAutorizada && <span className="text-amber-700 font-semibold">Solicitou</span>}
                    {u.trocaSenhaAutorizada && <span className="text-emerald-700 font-semibold">Autorizado</span>}
                    {!u.solicitacaoTrocaSenha && !u.trocaSenhaAutorizada && '—'}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold ${u.ativo === false ? 'text-red-600' : 'text-emerald-700'}`}>
                      {u.ativo === false ? 'Inativo' : 'Ativo'}
                    </span>
                  </td>
                  {admin && (
                    <td className="p-3 space-x-2 whitespace-nowrap">
                      <button type="button" onClick={() => editar(u)} className="text-cyan-700 font-semibold text-xs hover:underline">Editar</button>
                      <button type="button" onClick={() => toggleAtivo(u)} className="text-slate-600 font-semibold text-xs hover:underline">
                        {u.ativo === false ? 'Ativar' : 'Desativar'}
                      </button>
                      {u.solicitacaoTrocaSenha && (
                        <button type="button" onClick={() => autorizarSenha(u)} className="text-emerald-700 font-semibold text-xs hover:underline">
                          Autorizar senha
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
