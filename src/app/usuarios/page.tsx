'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Shield } from 'lucide-react';

const PERFIS = [
  { codigo: 'ADMIN', label: 'Administrador' },
  { codigo: 'DIRETORA', label: 'Diretora' },
  { codigo: 'SECRETARIA', label: 'Secretaria' },
  { codigo: 'PROFESSOR', label: 'Professor' },
  { codigo: 'RESPONSAVEL', label: 'Responsável' },
];

export default function UsuariosPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [perfisInfo, setPerfisInfo] = useState<any[]>([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'PROFESSOR' });
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  const carregar = () =>
    api
      .get('/usuarios')
      .then((r) => setLista(r.data))
      .catch(() => setErro('Sem permissão ou API indisponível'));

  useEffect(() => {
    carregar();
    api.get('/usuarios/perfis').then((r) => setPerfisInfo(r.data.perfis || [])).catch(() => {});
  }, []);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErro('');
    try {
      await api.post('/usuarios', form);
      setForm({ nome: '', email: '', senha: '', perfil: 'PROFESSOR' });
      setMsg('Usuário criado com sucesso.');
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Erro ao criar usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="text-cyan-600" />
        <div>
          <h1 className="text-2xl font-bold">Usuários do sistema</h1>
          <p className="text-sm text-gray-500">Acesso por perfil · liberação de módulos</p>
        </div>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">{msg}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}

      <form onSubmit={criar} className="bg-white p-6 rounded-2xl border grid md:grid-cols-2 gap-3">
        <input required placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <input required type="password" placeholder="Senha (mín. 6)" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="border p-2.5 rounded-lg text-sm" />
        <select value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })} className="border p-2.5 rounded-lg text-sm">
          {PERFIS.map((p) => (
            <option key={p.codigo} value={p.codigo}>
              {p.label}
            </option>
          ))}
        </select>
        <button className="bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold md:col-span-2">Criar usuário</button>
      </form>

      {perfisInfo.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {perfisInfo.map((p) => (
            <div key={p.codigo} className="bg-white border rounded-xl p-4 text-sm">
              <p className="font-bold text-gray-900">{p.codigo}</p>
              <p className="text-gray-600 text-xs mt-1">{p.descricao}</p>
              <p className="text-[11px] text-cyan-700 mt-2">{(p.modulos || []).join(' · ')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Email</th>
              <th className="p-3">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.nome}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-semibold">{u.perfil}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
