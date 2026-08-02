'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [form, setForm] = useState({ nomeCompleto: '', dataNascimento: '', nomeMae: '', zona: 'URBANA' });
  const [busca, setBusca] = useState('');

  const carregar = () => api.get('/alunos', { params: { nome: busca } }).then(r => setAlunos(r.data)).catch(() => {});
  useEffect(() => { carregar(); }, []);

  const criar = async (e: any) => {
    e.preventDefault();
    await api.post('/alunos', form);
    setForm({ nomeCompleto: '', dataNascimento: '', nomeMae: '', zona: 'URBANA' });
    carregar();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alunos - Pré ao 9º</h1>
      <div className="bg-white p-6 rounded-xl border">
        <h3 className="font-semibold mb-3">Novo Aluno</h3>
        <form onSubmit={criar} className="grid grid-cols-4 gap-3">
          <input required placeholder="Nome completo" value={form.nomeCompleto} onChange={e => setForm({ ...form, nomeCompleto: e.target.value })} className="border p-2 rounded col-span-2" />
          <input required type="date" value={form.dataNascimento} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Nome da Mãe" value={form.nomeMae} onChange={e => setForm({ ...form, nomeMae: e.target.value })} className="border p-2 rounded" />
          <select value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })} className="border p-2 rounded"><option>URBANA</option><option>RURAL</option></select>
          <button className="bg-green-700 text-white px-4 py-2 rounded">Cadastrar</button>
        </form>
      </div>
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex gap-2">
          <input placeholder="Buscar aluno..." value={busca} onChange={e => setBusca(e.target.value)} className="border p-2 rounded w-64" />
          <button onClick={carregar} className="border px-4 rounded">Buscar</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="p-3 text-left">Nome</th><th>Nasc.</th><th>Mãe</th><th>Zona</th></tr></thead>
          <tbody>{alunos.map((a: any) => <tr key={a.id} className="border-t"><td className="p-3 font-medium">{a.nomeCompleto}</td><td>{new Date(a.dataNascimento).toLocaleDateString('pt-BR')}</td><td>{a.nomeMae}</td><td>{a.zona}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
