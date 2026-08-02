'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { CalendarDays, Plus, Trash2, Pencil } from 'lucide-react';

const TIPOS = [
  { value: 'LETIVO', label: 'Dia letivo' },
  { value: 'FERIADO', label: 'Feriado' },
  { value: 'RECESSO', label: 'Recesso' },
  { value: 'PONTO_FACULTATIVO', label: 'Ponto facultativo' },
  { value: 'DATA_FESTIVA', label: 'Data festiva' },
  { value: 'REUNIAO', label: 'Reunião' },
  { value: 'AVALIACAO', label: 'Avaliação' },
  { value: 'EVENTO', label: 'Evento escolar' },
  { value: 'OUTRO', label: 'Outro' },
];

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function CalendarioPage() {
  const now = new Date();
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [mesView, setMesView] = useState(now.getMonth()); // 0-11
  const [items, setItems] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
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

  const cells = useMemo(() => {
    const y = Number(ano);
    const first = new Date(y, mesView, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(y, mesView + 1, 0).getDate();
    const arr: { day: number | null; dateStr?: string; events: any[] }[] = [];
    for (let i = 0; i < startPad; i++) arr.push({ day: null, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(mesView + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const events = items.filter((ev) => String(ev.data).slice(0, 10) === dateStr);
      arr.push({ day: d, dateStr, events });
    }
    while (arr.length % 7 !== 0) arr.push({ day: null, events: [] });
    return arr;
  }, [ano, mesView, items]);

  function resetForm() {
    setEditId(null);
    setTitulo('');
    setData('');
    setTipo('LETIVO');
    setDescricao('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (!titulo.trim() || !data) return setErr('Informe título e data.');
    try {
      const payload = {
        titulo: titulo.trim(),
        data,
        tipo,
        descricao: descricao || undefined,
        diaLetivo: !['FERIADO', 'RECESSO', 'PONTO_FACULTATIVO', 'DATA_FESTIVA'].includes(tipo),
      };
      if (editId) await api.patch(`/calendario/${editId}`, payload);
      else await api.post('/calendario', payload);
      resetForm();
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Erro ao salvar evento.');
    }
  }

  function editar(ev: any) {
    setEditId(ev.id);
    setTitulo(ev.titulo);
    setData(String(ev.data).slice(0, 10));
    setTipo(ev.tipo);
    setDescricao(ev.descricao || '');
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
    PONTO_FACULTATIVO: 'bg-yellow-100 text-yellow-900',
    DATA_FESTIVA: 'bg-pink-100 text-pink-900',
    REUNIAO: 'bg-blue-100 text-blue-900',
    AVALIACAO: 'bg-purple-100 text-purple-900',
    EVENTO: 'bg-cyan-100 text-cyan-900',
    OUTRO: 'bg-slate-100 text-slate-800',
  };

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Calendário Escolar</h1>
            <p className="text-sm text-slate-700 font-medium">Eventos · mês vigente em grade</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select value={mesView} onChange={(e) => setMesView(Number(e.target.value))} className="border rounded-xl px-3 py-2 font-semibold text-slate-900">
            {MESES.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select value={ano} onChange={(e) => setAno(e.target.value)} className="border rounded-xl px-3 py-2 font-semibold text-slate-900">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm">
        <h2 className="text-sm font-bold uppercase text-slate-900 flex items-center gap-2">
          <Plus size={16} /> {editId ? 'Editar evento' : 'Novo evento'}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título *" className="border rounded-xl px-3 py-2.5 sm:col-span-2 text-slate-900" />
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="border rounded-xl px-3 py-2.5 text-slate-900" />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded-xl px-3 py-2.5 text-slate-900">
            {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" className="border rounded-xl px-3 py-2.5 sm:col-span-2 text-slate-900" />
        </div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-blue-700 text-white px-5 py-2.5 text-sm font-bold">
            {editId ? 'Atualizar' : 'Salvar evento'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-800">Cancelar</button>
          )}
        </div>
      </form>

      {/* Grade do mês vigente */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">{MESES[mesView]} de {ano}</p>
          <p className="text-xs text-slate-600">Mês completo · clique em um dia para pré-preencher a data</p>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-600 border-b">
          {WEEK.map((w) => (
            <div key={w} className="py-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {cells.map((c, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!c.day}
              onClick={() => c.dateStr && setData(c.dateStr)}
              className={`min-h-[72px] border-b border-r p-1 text-left align-top ${
                !c.day ? 'bg-slate-50' : c.dateStr === todayStr ? 'bg-cyan-50' : 'bg-white hover:bg-slate-50'
              }`}
            >
              {c.day && (
                <>
                  <span className={`text-xs font-bold ${c.dateStr === todayStr ? 'text-cyan-800' : 'text-slate-900'}`}>{c.day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {c.events.slice(0, 2).map((ev) => (
                      <div key={ev.id} className={`text-[9px] leading-tight rounded px-1 font-semibold truncate ${cor[ev.tipo] || cor.OUTRO}`}>
                        {ev.titulo}
                      </div>
                    ))}
                    {c.events.length > 2 && <span className="text-[9px] text-slate-500">+{c.events.length - 2}</span>}
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {items
          .filter((ev) => {
            const d = new Date(ev.data);
            return d.getFullYear() === Number(ano) && d.getMonth() === mesView;
          })
          .map((ev) => (
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
                <button type="button" onClick={() => editar(ev)} className="text-slate-600 p-1" title="Editar"><Pencil size={16} /></button>
                <button type="button" onClick={() => excluir(ev.id)} className="text-red-600 p-1" title="Excluir"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
