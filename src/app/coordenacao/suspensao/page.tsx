'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Ban, Plus, Trash2 } from 'lucide-react';

export default function SuspensaoPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [dias, setDias] = useState('1');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [ciencia, setCiencia] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/medidas-disciplinares', { params: { tipo: 'SUSPENSAO' } }).then((r) => setItems(r.data || [])).catch(() => {});
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
    if (motivo.trim().length < 5) return setErr('Informe o motivo.');
    const nDias = Number(dias);
    if (!nDias || nDias < 1) return setErr('Informe os dias de suspensão.');
    try {
      const user = localStorage.getItem('sisgesc_user');
      let registradaPor = 'Coordenação';
      try {
        if (user) registradaPor = JSON.parse(user)?.nome || registradaPor;
      } catch {}
      const aluno = alunos.find((a) => String(a.id) === alunoId);
      const inicio = new Date(dataInicio + 'T12:00:00');
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + nDias - 1);

      await api.post('/medidas-disciplinares', {
        alunoId: Number(alunoId),
        tipo: 'SUSPENSAO',
        motivo: motivo.trim(),
        descricao: descricao.trim() || motivo.trim(),
        data,
        dataInicio: dataInicio,
        dataFim: fim.toISOString().slice(0, 10),
        diasSuspensao: nDias,
        cienciaResponsavel: ciencia,
        contatoWhatsapp: whatsapp,
        telefoneContato: aluno?.telefoneContato || null,
        registradaPor,
      });
      setMsg('Suspensão registrada.');
      setMotivo('');
      setDescricao('');
      setCiencia(false);
      setWhatsapp(false);
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha ao registrar suspensão.');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta suspensão?')) return;
    await api.delete(`/medidas-disciplinares/${id}`);
    load();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-red-50 text-red-800 flex items-center justify-center">
          <Ban size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Suspensão</h1>
          <p className="text-sm text-slate-600">Aplicação com período e ciência do responsável</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <Plus size={16} /> Nova suspensão
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
            Data do registro
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Início da suspensão
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Dias *
            <input type="number" min={1} max={30} value={dias} onChange={(e) => setDias(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-800">
          Motivo *
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Descrição
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[80px]" />
        </label>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <label className="flex items-center gap-2"><input type="checkbox" checked={ciencia} onChange={(e) => setCiencia(e.target.checked)} /> Ciência do responsável</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} /> Contato via WhatsApp</label>
        </div>
        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="rounded-xl bg-red-700 text-white px-5 py-2.5 text-sm font-bold">Registrar suspensão</button>
      </form>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Aluno</th>
              <th className="p-3">Período</th>
              <th className="p-3">Dias</th>
              <th className="p-3">Motivo</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3 font-medium">{i.aluno?.nomeCompleto}</td>
                <td className="p-3 text-xs">
                  {i.dataInicio ? new Date(i.dataInicio).toLocaleDateString('pt-BR') : '—'} →{' '}
                  {i.dataFim ? new Date(i.dataFim).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="p-3">{i.diasSuspensao || '—'}</td>
                <td className="p-3">{i.motivo}</td>
                <td className="p-3 text-right">
                  <button type="button" onClick={() => excluir(i.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma suspensão registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
