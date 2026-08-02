'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';

const TIPOS = ['LETIVO', 'FERIADO', 'RECESSO', 'REUNIAO', 'AVALIACAO', 'EVENTO', 'OUTRO'];

export default function CalendarioPage() {
  const year = new Date().getFullYear();
  const [ano, setAno] = useState(String(year));
  const [items, setItems] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [tipo, setTipo] = useState('LETIVO');
  const [descricao, setDescricao] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    api.get('/calendario', { params: { ano } }).then((r) => setItems(r.data || [])).catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, [ano]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (!titulo.trim() || !data) return setErr('Informe título e data.');
    try {
      await api.post('/calendario', {
        titulo: titulo.trim(),
        data,
        tipo,
        descricao: descricao || undefined,
        diaLetivo: tipo === 'LETIVO' || tipo === 'AVALIACAO',
      });
      setTitulo('');
      setDescricao('');
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Erro ao salvar evento.');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir evento?')) return;
    await api.delete(`/calendario/${id}`);
    load();
  }

  const cor: Record<string, string> = {
    LETIVO: 'bg-emerald-100 text-emerald-900',
    FERIADO: 'bg-red-100 text-red-900',
    RECESSO: 'bg-orange-100 text-orange-900',
    REUNIAO: 'bg-blue-100 text-blue-900',
    AVALIACAO: 'bg-purple-100 text-purple-900',
    EVENTO: 'bg-cyan-100 text-cyan-900',
    OUTRO: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Calendário Escolar</h1>
            <p className="text-sm text-slate-700 font-medium">Dias letivos, feriados, reuniões e avaliações</p>
          </div>
        </div>
        <select value={ano} onChange={(e) => setAno(e.target.value)} className="border rounded-xl px-3 py-2 font-semibold">
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase text-slate-800 flex items-center gap-2"><Plus size={16} /> Novo evento</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título *" className="border rounded-xl px-3 py-2.5 sm:col-span-2" />
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="border rounded-xl px-3 py-2.5" />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded-xl px-3 py-2.5">
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" className="border rounded-xl px-3 py-2.5 sm:col-span-2" />
        </div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button type="submit" className="rounded-xl bg-blue-700 text-white px-5 py-2.5 text-sm font-bold">Salvar evento</button>
      </form>

      <div className="space-y-2">
        {items.map((ev) => (
          <div key={ev.id} className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="font-bold text-slate-900">{ev.titulo}</p>
              <p className="text-xs text-slate-600">
                {new Date(ev.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                {ev.descricao ? ` · ${ev.descricao}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cor[ev.tipo] || cor.OUTRO}`}>{ev.tipo}</span>
              <button type="button" onClick={() => excluir(ev.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-600 text-center py-8">Nenhum evento em {ano}.</p>}
      </div>
    </div>
  );
}
