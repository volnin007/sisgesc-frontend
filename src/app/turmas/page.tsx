'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [form, setForm] = useState({ nome: '', etapa: 'INFANTIL', anoSerie: 'PRE_II', turno: 'MATUTINO', capacidadeMax: 25, anoLetivoId: 1 });

  useEffect(() => { api.get('/turmas').then(r => setTurmas(r.data)); }, []);

  const criar = async (e: any) => {
    e.preventDefault();
    await api.post('/turmas', form);
    const r = await api.get('/turmas');
    setTurmas(r.data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Turmas - Pré-Escola ao 9º Ano</h1>
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-semibold mb-3">Nova Turma</h3>
        <form onSubmit={criar} className="grid grid-cols-5 gap-3">
          <input required placeholder="Nome ex: Pré II A" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="border p-2 rounded" />
          <select value={form.etapa} onChange={e => setForm({ ...form, etapa: e.target.value })} className="border p-2 rounded"><option>INFANTIL</option><option>FUND1</option><option>FUND2</option></select>
          <select value={form.anoSerie} onChange={e => setForm({ ...form, anoSerie: e.target.value })} className="border p-2 rounded">
            <option>PRE_I</option><option>PRE_II</option><option>1_ANO</option><option>2_ANO</option><option>3_ANO</option><option>4_ANO</option><option>5_ANO</option><option>6_ANO</option><option>7_ANO</option><option>8_ANO</option><option>9_ANO</option>
          </select>
          <select value={form.turno} onChange={e => setForm({ ...form, turno: e.target.value })} className="border p-2 rounded"><option>MATUTINO</option><option>VESPERTINO</option><option>INTEGRAL</option></select>
          <input type="number" value={form.capacidadeMax} onChange={e => setForm({ ...form, capacidadeMax: Number(e.target.value) })} className="border p-2 rounded" />
          <button className="bg-green-700 text-white px-4 py-2 rounded col-span-5">Criar Turma (valida MEC 25 infantil)</button>
        </form>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {turmas.map((t: any) => <div key={t.id} className="bg-white p-4 rounded-xl border"><p className="font-bold">{t.nome}</p><p className="text-sm text-gray-500">{t.etapa} - {t.anoSerie} - {t.turno}</p><p className="text-sm mt-1">{t.ocupacao || 0}/{t.capacidadeMax} alunos</p></div>)}
      </div>
    </div>
  );
}
