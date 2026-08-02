'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { GraduationCap, Pencil, Plus, X, Save } from 'lucide-react';

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: '',
    etapa: 'INFANTIL',
    anoSerie: 'PRE_II',
    turno: 'MATUTINO',
    capacidadeMax: 25,
    anoLetivoId: 1,
    letra: '',
  });

  const carregar = async () => {
    setLoading(true);
    try {
      const r = await api.get('/turmas');
      setTurmas(r.data || []);
    } catch {
      setTurmas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setForm({
      nome: '',
      etapa: 'INFANTIL',
      anoSerie: 'PRE_II',
      turno: 'MATUTINO',
      capacidadeMax: 25,
      anoLetivoId: 1,
      letra: '',
    });
  };

  const startEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      nome: t.nome || '',
      etapa: t.etapa || 'INFANTIL',
      anoSerie: t.anoSerie || 'PRE_II',
      turno: t.turno || 'MATUTINO',
      capacidadeMax: t.capacidadeMax || 25,
      anoLetivoId: t.anoLetivoId || 1,
      letra: t.letra || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salvar = async (e: any) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/turmas/${editId}`, form);
      } else {
        await api.post('/turmas', form);
      }
      resetForm();
      carregar();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Erro ao salvar turma');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Turmas</h1>
          <p className="text-sm text-slate-500">Pré-Escola ao 9º Ano · edição sempre disponível</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">
            {editId ? `Editando turma #${editId}` : 'Nova Turma'}
          </h3>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              <X size={14} /> Cancelar edição
            </button>
          )}
        </div>
        <form onSubmit={salvar} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            required
            placeholder="Nome ex: Pré II A"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-cyan-500"
          />
          <select
            value={form.etapa}
            onChange={(e) => setForm({ ...form, etapa: e.target.value })}
            className="border border-slate-200 p-2.5 rounded-xl text-sm"
          >
            <option value="INFANTIL">INFANTIL</option>
            <option value="FUND1">FUND1</option>
            <option value="FUND2">FUND2</option>
          </select>
          <select
            value={form.anoSerie}
            onChange={(e) => setForm({ ...form, anoSerie: e.target.value })}
            className="border border-slate-200 p-2.5 rounded-xl text-sm"
          >
            <option>PRE_I</option>
            <option>PRE_II</option>
            <option>1_ANO</option>
            <option>2_ANO</option>
            <option>3_ANO</option>
            <option>4_ANO</option>
            <option>5_ANO</option>
            <option>6_ANO</option>
            <option>7_ANO</option>
            <option>8_ANO</option>
            <option>9_ANO</option>
          </select>
          <select
            value={form.turno}
            onChange={(e) => setForm({ ...form, turno: e.target.value })}
            className="border border-slate-200 p-2.5 rounded-xl text-sm"
          >
            <option>MATUTINO</option>
            <option>VESPERTINO</option>
            <option>INTEGRAL</option>
          </select>
          <input
            type="number"
            value={form.capacidadeMax}
            onChange={(e) => setForm({ ...form, capacidadeMax: Number(e.target.value) })}
            className="border border-slate-200 p-2.5 rounded-xl text-sm"
            placeholder="Capacidade"
          />
          <input
            placeholder="Letra (opcional)"
            value={form.letra}
            onChange={(e) => setForm({ ...form, letra: e.target.value })}
            className="border border-slate-200 p-2.5 rounded-xl text-sm"
          />
          <button
            type="submit"
            className="col-span-2 md:col-span-3 lg:col-span-6 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold"
          >
            {editId ? (
              <>
                <Save size={16} /> Salvar alterações
              </>
            ) : (
              <>
                <Plus size={16} /> Criar Turma (valida MEC 25 infantil)
              </>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <p className="text-slate-400 col-span-full text-center py-8">Carregando turmas...</p>
        )}
        {!loading &&
          turmas.map((t: any) => (
            <div
              key={t.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-cyan-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{t.nome}</p>
                  <p className="text-sm text-slate-500">
                    {t.etapa} · {t.anoSerie} · {t.turno}
                  </p>
                  <p className="text-sm mt-2 font-medium text-slate-700">
                    {t.ocupacao ?? t._count?.matriculas ?? 0}/{t.capacidadeMax} alunos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline shrink-0"
                >
                  <Pencil size={12} /> Editar
                </button>
              </div>
            </div>
          ))}
        {!loading && turmas.length === 0 && (
          <p className="text-slate-400 col-span-full text-center py-8">Nenhuma turma cadastrada.</p>
        )}
      </div>
    </div>
  );
}
