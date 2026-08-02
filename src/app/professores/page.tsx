'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { CalendarRange, GraduationCap, Save, Send } from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const statusLabel: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  AJUSTE: 'Ajuste solicitado',
};

const statusCls: Record<string, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-700',
  ENVIADO: 'bg-amber-50 text-amber-800 border-amber-200',
  APROVADO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  AJUSTE: 'bg-red-50 text-red-700 border-red-200',
};

function defaultDates(mes: number, ano: number, quinzena: number) {
  if (quinzena === 1) {
    return {
      dataInicio: `${ano}-${String(mes).padStart(2, '0')}-01`,
      dataFim: `${ano}-${String(mes).padStart(2, '0')}-15`,
    };
  }
  const last = new Date(ano, mes, 0).getDate();
  return {
    dataInicio: `${ano}-${String(mes).padStart(2, '0')}-16`,
    dataFim: `${ano}-${String(mes).padStart(2, '0')}-${String(last).padStart(2, '0')}`,
  };
}

export default function ProfessoresPage() {
  const now = new Date();
  const [lista, setLista] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [planejamentos, setPlanejamentos] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nomeCompleto: '',
    cpf: '',
    formacao: '',
    telefone: '',
    email: '',
    disciplinas: '',
    habilitacaoInfantil: false,
  });

  const [pl, setPl] = useState({
    professorId: '',
    turmaId: '',
    disciplina: '',
    mes: now.getMonth() + 1,
    ano: now.getFullYear(),
    quinzena: now.getDate() <= 15 ? 1 : 2,
    dataInicio: '',
    dataFim: '',
    tema: '',
    objetivos: '',
    conteudos: '',
    metodologia: '',
    recursos: '',
    avaliacao: '',
    bncc: '',
  });

  const datasAuto = useMemo(
    () => defaultDates(pl.mes, pl.ano, pl.quinzena),
    [pl.mes, pl.ano, pl.quinzena],
  );

  const carregar = async () => {
    try {
      const [p, t, plRes] = await Promise.all([
        api.get('/professores'),
        api.get('/turmas'),
        api.get('/planejamentos'),
      ]);
      setLista(p.data || []);
      setTurmas(t.data || []);
      setPlanejamentos(plRes.data || []);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    setPl((prev) => ({
      ...prev,
      dataInicio: prev.dataInicio || datasAuto.dataInicio,
      dataFim: prev.dataFim || datasAuto.dataFim,
    }));
  }, [datasAuto.dataInicio, datasAuto.dataFim]);

  const criarProfessor = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api.post('/professores', {
        ...form,
        disciplinas: form.disciplinas
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        email: form.email || undefined,
      });
      setForm({
        nomeCompleto: '',
        cpf: '',
        formacao: '',
        telefone: '',
        email: '',
        disciplinas: '',
        habilitacaoInfantil: false,
      });
      setMsg('Professor cadastrado.');
      carregar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Erro ao cadastrar professor');
    }
  };

  const salvarPlanejamento = async (enviar: boolean) => {
    setMsg('');
    setErr('');
    if (!pl.professorId) return setErr('Selecione o professor.');
    if (!pl.disciplina.trim()) return setErr('Informe a disciplina.');
    if (pl.objetivos.trim().length < 5) return setErr('Descreva os objetivos (mín. 5 caracteres).');
    if (pl.conteudos.trim().length < 5) return setErr('Descreva os conteúdos (mín. 5 caracteres).');

    setSaving(true);
    try {
      const datas = defaultDates(pl.mes, pl.ano, pl.quinzena);
      await api.post('/planejamentos', {
        professorId: Number(pl.professorId),
        turmaId: pl.turmaId ? Number(pl.turmaId) : null,
        disciplina: pl.disciplina.trim(),
        mes: Number(pl.mes),
        ano: Number(pl.ano),
        quinzena: Number(pl.quinzena),
        dataInicio: pl.dataInicio || datas.dataInicio,
        dataFim: pl.dataFim || datas.dataFim,
        tema: pl.tema || null,
        objetivos: pl.objetivos,
        conteudos: pl.conteudos,
        metodologia: pl.metodologia || null,
        recursos: pl.recursos || null,
        avaliacao: pl.avaliacao || null,
        bncc: pl.bncc || null,
        status: enviar ? 'ENVIADO' : 'RASCUNHO',
      });
      setMsg(enviar ? 'Planejamento enviado à Coordenação.' : 'Rascunho de planejamento salvo.');
      setPl((prev) => ({
        ...prev,
        tema: '',
        objetivos: '',
        conteudos: '',
        metodologia: '',
        recursos: '',
        avaliacao: '',
        bncc: '',
      }));
      carregar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha ao salvar planejamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Professores</h1>
          <p className="text-sm text-slate-600 font-medium">
            Cadastro docente · planejamento quinzenal
          </p>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-xl px-4 py-3">
          {msg}
        </div>
      )}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-3">
          {err}
        </div>
      )}

      <form onSubmit={criarProfessor} className="bg-white p-5 rounded-2xl border grid md:grid-cols-3 gap-3 shadow-sm">
        <h2 className="md:col-span-3 text-sm font-bold uppercase tracking-wide text-slate-800">
          Cadastrar professor
        </h2>
        <input required placeholder="Nome completo" value={form.nomeCompleto} onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
        <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Formação" value={form.formacao} onChange={(e) => setForm({ ...form, formacao: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Disciplinas (vírgula)" value={form.disciplinas} onChange={(e) => setForm({ ...form, disciplinas: e.target.value })} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.habilitacaoInfantil} onChange={(e) => setForm({ ...form, habilitacaoInfantil: e.target.checked })} />
          Habilitado Educação Infantil
        </label>
        <button className="bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold md:col-span-3">
          Cadastrar professor
        </button>
      </form>

      <div className="bg-white rounded-2xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Formação</th>
              <th className="p-3">Disciplinas</th>
              <th className="p-3">Infantil</th>
              <th className="p-3">Contato</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-semibold text-slate-900">{p.nomeCompleto}</td>
                <td className="p-3">{p.formacao || '—'}</td>
                <td className="p-3">{(p.disciplinas || []).join(', ') || '—'}</td>
                <td className="p-3">{p.habilitacaoInfantil ? 'Sim' : 'Não'}</td>
                <td className="p-3 text-xs">{p.telefone || p.email || '—'}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Nenhum professor cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Planejamento quinzenal */}
      <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-[#12325a] to-cyan-800 text-white px-5 py-4 flex items-center gap-3">
          <CalendarRange size={22} />
          <div>
            <h2 className="text-lg font-bold">Planejamento quinzenal</h2>
            <p className="text-xs text-blue-100">Professor elabora · Coordenação revisa e aprova</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-sm font-semibold text-slate-800">
              Professor *
              <select
                value={pl.professorId}
                onChange={(e) => setPl({ ...pl, professorId: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              >
                <option value="">Selecione...</option>
                {lista.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomeCompleto}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Turma
              <select
                value={pl.turmaId}
                onChange={(e) => setPl({ ...pl, turmaId: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              >
                <option value="">Opcional</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} · {t.turno}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Disciplina *
              <input
                value={pl.disciplina}
                onChange={(e) => setPl({ ...pl, disciplina: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
                placeholder="Ex.: Matemática"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Tema / eixo
              <input
                value={pl.tema}
                onChange={(e) => setPl({ ...pl, tema: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
                placeholder="Opcional"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Mês
              <select
                value={pl.mes}
                onChange={(e) => {
                  const mes = Number(e.target.value);
                  const d = defaultDates(mes, pl.ano, pl.quinzena);
                  setPl({ ...pl, mes, dataInicio: d.dataInicio, dataFim: d.dataFim });
                }}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              >
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Ano
              <input
                type="number"
                value={pl.ano}
                onChange={(e) => {
                  const ano = Number(e.target.value);
                  const d = defaultDates(pl.mes, ano, pl.quinzena);
                  setPl({ ...pl, ano, dataInicio: d.dataInicio, dataFim: d.dataFim });
                }}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Quinzena
              <select
                value={pl.quinzena}
                onChange={(e) => {
                  const quinzena = Number(e.target.value);
                  const d = defaultDates(pl.mes, pl.ano, quinzena);
                  setPl({ ...pl, quinzena, dataInicio: d.dataInicio, dataFim: d.dataFim });
                }}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              >
                <option value={1}>1ª (dias 1–15)</option>
                <option value={2}>2ª (dias 16–fim)</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              BNCC
              <input
                value={pl.bncc}
                onChange={(e) => setPl({ ...pl, bncc: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
                placeholder="Códigos BNCC"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Data início
              <input
                type="date"
                value={pl.dataInicio || datasAuto.dataInicio}
                onChange={(e) => setPl({ ...pl, dataInicio: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Data fim
              <input
                type="date"
                value={pl.dataFim || datasAuto.dataFim}
                onChange={(e) => setPl({ ...pl, dataFim: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-800">
            Objetivos de aprendizagem *
            <textarea
              value={pl.objetivos}
              onChange={(e) => setPl({ ...pl, objetivos: e.target.value })}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[80px]"
              placeholder="O que o aluno deve desenvolver nesta quinzena..."
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Conteúdos / sequência didática *
            <textarea
              value={pl.conteudos}
              onChange={(e) => setPl({ ...pl, conteudos: e.target.value })}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[100px]"
              placeholder="Conteúdos, habilidades e atividades previstas..."
            />
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block text-sm font-semibold text-slate-800">
              Metodologia
              <textarea
                value={pl.metodologia}
                onChange={(e) => setPl({ ...pl, metodologia: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[70px]"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Recursos
              <textarea
                value={pl.recursos}
                onChange={(e) => setPl({ ...pl, recursos: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[70px]"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Avaliação
              <textarea
                value={pl.avaliacao}
                onChange={(e) => setPl({ ...pl, avaliacao: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[70px]"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => salvarPlanejamento(false)}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-slate-800 disabled:opacity-60"
            >
              <Save size={16} /> Salvar rascunho
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => salvarPlanejamento(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              <Send size={16} /> Enviar à Coordenação
            </button>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
            Planejamentos registrados
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white text-left text-slate-600">
            <tr>
              <th className="p-3">Professor</th>
              <th className="p-3">Período</th>
              <th className="p-3">Disciplina / Turma</th>
              <th className="p-3">Tema</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {planejamentos.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3 font-medium">{item.professor?.nomeCompleto || '—'}</td>
                <td className="p-3">
                  {item.quinzena}ª · {MESES[(item.mes || 1) - 1]}/{item.ano}
                </td>
                <td className="p-3">
                  {item.disciplina}
                  {item.turma?.nome ? ` · ${item.turma.nome}` : ''}
                </td>
                <td className="p-3">{item.tema || '—'}</td>
                <td className="p-3">
                  <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded-lg border ${statusCls[item.status] || statusCls.RASCUNHO}`}>
                    {statusLabel[item.status] || item.status}
                  </span>
                </td>
              </tr>
            ))}
            {planejamentos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Nenhum planejamento cadastrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
