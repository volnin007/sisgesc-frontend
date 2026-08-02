'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function DiarioPage() {
  const [turmaId, setTurmaId] = useState('1');
  const [dataAula, setDataAula] = useState(new Date().toISOString().slice(0, 10));
  const [disciplina, setDisciplina] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [msg, setMsg] = useState('');

  const salvar = async () => {
    try {
      // Em produção: POST /diario/completo com conteúdo + chamada
      setMsg('Diário preparado. Integração completa com backend de conteúdo em breve.');
    } catch {
      setMsg('Erro');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Diário de Classe - Conteúdo + Chamada</h1>
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <input value={turmaId} onChange={e => setTurmaId(e.target.value)} placeholder="Turma ID" className="border p-2 rounded" />
          <input type="date" value={dataAula} onChange={e => setDataAula(e.target.value)} className="border p-2 rounded" />
          <input value={disciplina} onChange={e => setDisciplina(e.target.value)} placeholder="Disciplina (6º-9º)" className="border p-2 rounded" />
        </div>
        <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Conteúdo ministrado..." className="w-full border p-3 rounded h-24" />
        <input value={objetivos} onChange={e => setObjetivos(e.target.value)} placeholder="Objetivos BNCC (ex: EI03EO01)" className="w-full border p-2 rounded" />
        <button onClick={salvar} className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold">Salvar Diário Completo</button>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
      </div>
    </div>
  );
}
