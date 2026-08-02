'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Plus, Trash2, AlertCircle } from 'lucide-react';

const STATUS = ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'ENCERRADO'];

export default function BuscaAtivaPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [motivo, setMotivo] = useState('Faltas consecutivas / evasão');
  const [descricao, setDescricao] = useState('');
  const [acao, setAcao] = useState('');
  const [telefone, setTelefone] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [faltas, setFaltas] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/busca-ativa').then((r) => setItems(r.data || [])).catch(() => {});
    api.get('/busca-ativa/sugestoes').then((r) => setSugestoes(r.data || [])).catch(() => setSugestoes([]));
  };

  useEffect(() => {
    load();
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!alunoId) return setErr('Selecione o aluno.');
    try {
      const user = localStorage.getItem('sisgesc_user');
      let registradaPor = 'Coordenação';
      try {
        if (user) registradaPor = JSON.parse(user)?.nome || registradaPor;
      } catch {}
      await api.post('/busca-ativa', {
        alunoId: Number(alunoId),
        motivo: motivo.trim(),
        descricao: descricao || null,
        acaoRealizada: acao || null,
        telefoneContato: telefone || null,
        responsavelNome: responsavel || null,
        faltasAcumuladas: faltas ? Number(faltas) : null,
        status: 'ABERTO',
        registradaPor,
      });
      setMsg('Caso de busca ativa aberto.');
      setDescricao('');
      setAcao('');
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha ao abrir caso.');
    }
  }

  async function mudarStatus(id: number, status: string) {
    await api.patch(`/busca-ativa/${id}`, { status });
    load();
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este caso?')) return;
    await api.delete(`/busca-ativa/${id}`);
    load();
  }

  function usarSugestao(s: any) {
    setAlunoId(String(s.alunoId));
    setFaltas(String(s.faltas30dias || ''));
    setTelefone(s.telefone || '');
    setMotivo(`Faltas elevadas (${s.faltas30dias} em 30 dias)`);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
          <Search size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Busca Ativa</h1>
          <p className="text-sm text-slate-600">Ausências prolongadas e reintegração escolar</p>
        </div>
      </div>

      {sugestoes.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <AlertCircle size={16} /> Sugestões (≥ 5 faltas nos últimos 30 dias)
          </p>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map((s) => (
              <button
                key={s.alunoId}
                type="button"
                onClick={() => usarSugestao(s)}
                className="text-xs font-semibold rounded-lg bg-white border border-amber-200 px-3 py-1.5 text-slate-800 hover:border-amber-400"
              >
                {s.aluno} · {s.faltas30dias} faltas{s.turma ? ` · ${s.turma}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <Plus size={16} /> Abrir caso
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Aluno *
            <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              <option value="">Selecione...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>{a.nomeCompleto}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Motivo *
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Faltas acumuladas
            <input type="number" value={faltas} onChange={(e) => setFaltas(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Responsável
            <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Telefone / WhatsApp
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-800">
          Descrição
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[70px]" />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Ação realizada (ligação, visita, WhatsApp…)
          <textarea value={acao} onChange={(e) => setAcao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[60px]" />
        </label>
        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="rounded-xl bg-indigo-700 text-white px-5 py-2.5 text-sm font-bold">Abrir caso</button>
      </form>

      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border p-4 shadow-sm space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">{c.aluno?.nomeCompleto}</p>
                <p className="text-xs text-slate-600">{c.motivo}{c.faltasAcumuladas ? ` · ${c.faltasAcumuladas} faltas` : ''}</p>
                {c.telefoneContato && <p className="text-xs text-slate-500">Tel: {c.telefoneContato}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={c.status}
                  onChange={(e) => mudarStatus(c.id, e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1 font-semibold"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button type="button" onClick={() => excluir(c.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
            {c.acaoRealizada && <p className="text-sm text-slate-700"><span className="font-semibold">Ação:</span> {c.acaoRealizada}</p>}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">Nenhum caso de busca ativa aberto.</p>
        )}
      </div>
    </div>
  );
}
