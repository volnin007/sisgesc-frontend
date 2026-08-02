'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileWarning, Plus, Trash2 } from 'lucide-react';

export default function AdvertenciaPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [ciencia, setCiencia] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get('/medidas-disciplinares', { params: { tipo: 'ADVERTENCIA' } }).then((r) => setItems(r.data || [])).catch(() => {});
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
    if (motivo.trim().length < 5) return setErr('Informe o motivo com mais detalhes.');
    try {
      const user = localStorage.getItem('sisgesc_user');
      let registradaPor = 'Coordenação';
      try {
        if (user) registradaPor = JSON.parse(user)?.nome || registradaPor;
      } catch {}
      const aluno = alunos.find((a) => String(a.id) === alunoId);
      await api.post('/medidas-disciplinares', {
        alunoId: Number(alunoId),
        tipo: 'ADVERTENCIA',
        motivo: motivo.trim(),
        descricao: descricao.trim() || motivo.trim(),
        data,
        cienciaResponsavel: ciencia,
        contatoWhatsapp: whatsapp,
        telefoneContato: aluno?.telefoneContato || null,
        registradaPor,
      });
      setMsg('Advertência registrada.');
      setMotivo('');
      setDescricao('');
      setCiencia(false);
      setWhatsapp(false);
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha ao registrar advertência.');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta advertência?')) return;
    await api.delete(`/medidas-disciplinares/${id}`);
    load();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
          <FileWarning size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Advertência</h1>
          <p className="text-sm text-slate-600">Registro formal com ciência do responsável</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <Plus size={16} /> Nova advertência
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
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-800">
          Motivo *
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="Ex.: Desrespeito em sala" />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Descrição / fatos
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[90px]" />
        </label>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <label className="flex items-center gap-2"><input type="checkbox" checked={ciencia} onChange={(e) => setCiencia(e.target.checked)} /> Ciência do responsável</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} /> Contato via WhatsApp</label>
        </div>
        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="rounded-xl bg-amber-700 text-white px-5 py-2.5 text-sm font-bold">Registrar advertência</button>
      </form>

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Aluno</th>
              <th className="p-3">Motivo</th>
              <th className="p-3">Ciência</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{new Date(i.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3 font-medium">{i.aluno?.nomeCompleto}</td>
                <td className="p-3">{i.motivo}</td>
                <td className="p-3">{i.cienciaResponsavel ? 'Sim' : 'Não'}</td>
                <td className="p-3 text-right">
                  <button type="button" onClick={() => excluir(i.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma advertência registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
