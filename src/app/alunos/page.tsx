'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, Users, UserPlus } from 'lucide-react';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');

  const carregar = () =>
    api
      .get('/alunos', { params: { nome: busca || undefined } })
      .then((r) => setAlunos(r.data))
      .catch(() => {});

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="text-cyan-600" />
          <div>
            <h1 className="text-2xl font-bold">Alunos</h1>
            <p className="text-sm text-gray-500">Lista · ficha · foto 3×4</p>
          </div>
        </div>
        <Link
          href="/matricula"
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm"
        >
          <UserPlus size={16} /> Nova matrícula
        </Link>
      </div>

      <div className="bg-white rounded-2xl border">
        <div className="p-4 border-b flex gap-2">
          <input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border p-2 rounded-lg w-64 text-sm"
          />
          <button onClick={carregar} className="border px-4 rounded-lg text-sm flex items-center gap-1">
            <Search size={14} /> Buscar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3 w-14">Foto</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Nascimento</th>
                <th className="p-3">Mãe</th>
                <th className="p-3">Zona</th>
                <th className="p-3">Turma</th>
                <th className="p-3">Responsáveis</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {a.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.fotoUrl} alt="" className="w-10 h-12 object-cover rounded border" />
                    ) : (
                      <div className="w-10 h-12 rounded border bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                        3×4
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{a.nomeCompleto}</td>
                  <td className="p-3">{new Date(a.dataNascimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">{a.nomeMae}</td>
                  <td className="p-3">{a.zona}</td>
                  <td className="p-3">{a.matriculas?.[0]?.turma?.nome || '—'}</td>
                  <td className="p-3 text-xs text-gray-600">
                    {(a.responsaveis || []).map((r: any) => r.responsavel?.nome).filter(Boolean).join(', ') || '—'}
                  </td>
                </tr>
              ))}
              {alunos.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Nenhum aluno. Use <strong>Nova matrícula</strong> para cadastrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
