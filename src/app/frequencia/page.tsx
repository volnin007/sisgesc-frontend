'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function FrequenciaPage() {
  const [turmaId, setTurmaId] = useState('1');
  const [dataAula, setDataAula] = useState(new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState('');

  const salvar = async () => {
    try {
      await api.post('/frequencias/lote', {
        turmaId: Number(turmaId),
        dataAula,
        disciplina: '',
        presencas: [], // em produção carregar alunos da turma
      });
      setMsg('Frequência salva (adicione alunos da turma no frontend completo)');
    } catch {
      setMsg('Erro ao salvar');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Frequência / Chamada</h1>
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <div className="flex gap-3">
          <input value={turmaId} onChange={e => setTurmaId(e.target.value)} placeholder="Turma ID" className="border p-2 rounded" />
          <input type="date" value={dataAula} onChange={e => setDataAula(e.target.value)} className="border p-2 rounded" />
          <button onClick={salvar} className="bg-green-700 text-white px-4 py-2 rounded">Salvar Lote</button>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <p className="text-sm text-gray-500">Use o Diário de Classe para lançar conteúdo + chamada juntos.</p>
      </div>
    </div>
  );
}
