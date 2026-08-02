'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FileText, Pencil, Search, UserPlus, UserRound, Users } from 'lucide-react';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    setLoading(true);
    api.get('/alunos', { params: { nome: busca || undefined } })
      .then((r) => setAlunos(r.data || []))
      .catch(() => setAlunos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const incompletos = alunos.filter((a) => !a.telefoneContato || !a.sus).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center"><Users size={22} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Alunos</h1>
            <p className="text-sm text-slate-500">{alunos.length} cadastros · ficha oficial · edição sempre disponível</p>
          </div>
        </div>
        <Link href="/matricula" className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm">
          <UserPlus size={16} /> Nova matrícula
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && carregar()} placeholder="Buscar por nome, CPF ou SUS..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 text-slate-900" />
        </div>
        <button type="button" onClick={carregar} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Buscar</button>
        <span className="text-xs text-slate-500">{incompletos > 0 ? `${incompletos} cadastro(s) sem SUS ou telefone` : 'Dados básicos ok'}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Aluno</th>
                <th className="px-4 py-3 font-semibold">Moradia</th>
                <th className="px-4 py-3 font-semibold">SUS / CPF</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
                <th className="px-4 py-3 font-semibold">Turma</th>
                <th className="px-4 py-3 font-semibold">Docs</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (<tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Carregando...</td></tr>)}
              {!loading && alunos.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-9 rounded-lg border bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                        {a.fotoUrl ? <img src={a.fotoUrl} alt="" className="h-full w-full object-cover" /> : <UserRound size={16} className="text-slate-400" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{a.nomeCompleto}</p>
                        <p className="text-[11px] text-slate-500">{a.sexo || '—'} · nasc. {new Date(a.dataNascimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{a.zona || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-700"><div>SUS: {a.sus || '—'}</div><div>CPF: {a.cpf || '—'}</div></td>
                  <td className="px-4 py-3 text-slate-700">{a.telefoneContato || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{a.matriculas?.[0]?.turma?.nome || '—'}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"><FileText size={12} />{a._count?.documentos ?? 0}</span></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    <Link href={`/alunos/${a.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:underline"><Pencil size={12} /> Editar</Link>
                    <Link href={`/alunos/${a.id}`} className="text-xs font-semibold text-slate-600 hover:underline">Ficha</Link>
                  </td>
                </tr>
              ))}
              {!loading && alunos.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Nenhum aluno. Use <Link href="/matricula" className="text-cyan-700 font-semibold">Nova matrícula</Link>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
