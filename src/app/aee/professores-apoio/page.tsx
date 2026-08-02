'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Accessibility, Users } from 'lucide-react';

export default function ProfessoresApoioPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/usuarios/apoio')
      .then((r) => setLista(r.data || []))
      .catch(() =>
        api
          .get('/usuarios')
          .then((r) => {
            const all = r.data || [];
            setLista(
              all.filter((u: any) => {
                const d = u.dadosExtras || {};
                return u.perfil === 'AEE' || d.tipoDocente === 'APOIO' || d.tipoDocente === 'AEE';
              }),
            );
          })
          .catch(() => setErr('Não foi possível carregar profissionais de apoio.')),
      );
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
  }, []);

  function nomeAluno(id: any) {
    if (!id) return '—';
    const a = alunos.find((x) => x.id === Number(id) || String(x.id) === String(id));
    return a?.nomeCompleto || `Aluno #${id}`;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-800 flex items-center justify-center">
          <Accessibility size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Professores de Apoio</h1>
          <p className="text-sm text-slate-600">
            Dados vindos do cadastro em <strong>Usuários</strong> (perfil AEE / tipo Apoio)
          </p>
        </div>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <Users className="inline mr-2" size={16} />
        Cadastre o profissional em <strong>Usuários</strong> com perfil <strong>AEE</strong> ou Professor com tipo docente{' '}
        <strong>Apoio</strong>, informando aluno especial, turno e turma.
      </div>

      <div className="grid gap-3">
        {lista.map((u) => {
          const d = u.dadosExtras || {};
          return (
            <div key={u.id} className="bg-white rounded-2xl border p-4 shadow-sm">
              <p className="font-bold text-slate-900">{u.nome}</p>
              <p className="text-xs text-slate-600">{u.email} · {u.perfil}</p>
              <div className="mt-2 grid sm:grid-cols-2 gap-2 text-sm text-slate-800">
                <p><span className="font-semibold">Tipo:</span> {d.tipoDocente || (u.perfil === 'AEE' ? 'AEE' : '—')}</p>
                <p><span className="font-semibold">Disciplinas:</span> {Array.isArray(d.disciplinas) ? d.disciplinas.join(', ') : d.disciplinas || '—'}</p>
                <p><span className="font-semibold">Aluno especial:</span> {nomeAluno(d.alunoApoioId || d.alunoId)}</p>
                <p><span className="font-semibold">Turma / turno:</span> {d.turmaApoio || d.turmaTurno || '—'}</p>
                {d.nomePos && <p className="sm:col-span-2"><span className="font-semibold">Pós-graduação:</span> {d.nomePos}</p>}
              </div>
            </div>
          );
        })}
        {lista.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">Nenhum professor de apoio cadastrado em Usuários.</p>
        )}
      </div>
    </div>
  );
}
