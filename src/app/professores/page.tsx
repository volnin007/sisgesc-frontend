'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { GraduationCap } from 'lucide-react';

export default function ProfessoresPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [form, setForm] = useState({
    nomeCompleto: '',
    cpf: '',
    formacao: '',
    telefone: '',
    email: '',
    disciplinas: '',
    habilitacaoInfantil: false,
  });
  const [msg, setMsg] = useState('');

  const carregar = () => api.get('/professores').then((r) => setLista(r.data)).catch(() => {});
  useEffect(() => {
    carregar();
  }, []);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/professores', {
        ...form,
        disciplinas: form.disciplinas
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        email: form.email || undefined,
      });
      setForm({
        nomeCompleto: '',
        cpf: '',
        formacao: '',
        telefone: '',
        email: '',
        disciplinas: '',
        habilitacaoInfantil: false,
      });
      setMsg('Professor cadastrado.');
      carregar();
    } catch (err: any) {
      setMsg(err?.response?.data?.error || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="text-cyan-600" />
        <div>
          <h1 className="text-2xl font-bold">Professores</h1>
          <p className="text-sm text-gray-500">Quadro docente · disciplinas · habilitação infantil</p>
        </div>
      </div>

      {msg && <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 text-sm rounded-xl px-4 py-3">{msg}</div>}

      <form onSubmit={criar} className="bg-white p-6 rounded-2xl border grid md:grid-cols-3 gap-3">
        <input required placeholder="Nome completo" value={form.nomeCompleto} onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
        <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Formação" value={form.formacao} onChange={(e) => setForm({ ...form, formacao: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Disciplinas (vírgula)" value={form.disciplinas} onChange={(e) => setForm({ ...form, disciplinas: e.target.value })} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.habilitacaoInfantil} onChange={(e) => setForm({ ...form, habilitacaoInfantil: e.target.checked })} />
          Habilitado Educação Infantil
        </label>
        <button className="bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold md:col-span-3">Cadastrar professor</button>
      </form>

      <div className="bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Formação</th>
              <th className="p-3">Disciplinas</th>
              <th className="p-3">Infantil</th>
              <th className="p-3">Contato</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.nomeCompleto}</td>
                <td className="p-3">{p.formacao || '—'}</td>
                <td className="p-3">{(p.disciplinas || []).join(', ') || '—'}</td>
                <td className="p-3">{p.habilitacaoInfantil ? 'Sim' : 'Não'}</td>
                <td className="p-3 text-xs">{p.telefone || p.email || '—'}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Nenhum professor cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
