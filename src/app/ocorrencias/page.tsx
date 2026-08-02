'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

const TIPOS = ['DISCIPLINAR', 'PEDAGOGICA', 'ATENDIMENTO', 'SAUDE', 'ELOGIO', 'OUTRO'];

export default function OcorrenciasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [tipo, setTipo] = useState('DISCIPLINAR');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [providencias, setProvidencias] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/ocorrencias').then((r) => setItems(r.data || [])).catch(() => {});
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
    if (titulo.trim().length < 3) return setErr('Informe um título objetivo.');
    if (descricao.trim().length < 5) return setErr('Descreva a ocorrência com mais detalhes.');
    try {
      const user = typeof window !== 'undefined' ? localStorage.getItem('sisgesc_user') : null;
      let registradaPor = 'Secretaria';
      try {
        if (user) registradaPor = JSON.parse(user)?.nome || registradaPor;
      } catch {}
      await api.post('/ocorrencias', {
        alunoId: Number(alunoId),
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        providencias: providencias.trim() || undefined,
        data,
        registradaPor,
      });
      setMsg('Ocorrência registrada.');
      setTitulo('');
      setDescricao('');
      setProvidencias('');
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Não foi possível registrar a ocorrência.');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta ocorrência?')) return;
    await api.delete(`/ocorrencias/${id}`);
    load();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Ocorrências</h1>
          <p className="text-sm text-slate-700 font-medium">Registro disciplinar, pedagógico, saúde e elogios</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <Plus size={16} /> Nova ocorrência
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-800">
            Aluno *
            <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              <option value="">Selecione...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>{a.nomeCompleto}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Tipo *
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Título *
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="Resumo curto" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-800">
          Descrição *
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[90px]" />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Providências
          <textarea value={providencias} onChange={(e) => setProvidencias(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[60px]" />
        </label>
        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 text-sm font-bold">
          Registrar ocorrência
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-bold">Data</th>
              <th className="px-4 py-3 font-bold">Aluno</th>
              <th className="px-4 py-3 font-bold">Tipo</th>
              <th className="px-4 py-3 font-bold">Título</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{new Date(o.data).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 font-medium">{o.aluno?.nomeCompleto}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold">{o.tipo}</span>
                </td>
                <td className="px-4 py-3">{o.titulo}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => excluir(o.id)} className="text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhuma ocorrência registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
