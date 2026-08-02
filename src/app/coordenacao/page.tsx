'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ClipboardPen, ChevronRight, UserCog } from 'lucide-react';

const statusLabel: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  AJUSTE: 'Ajuste',
};

const statusCls: Record<string, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-700',
  ENVIADO: 'bg-amber-50 text-amber-800',
  APROVADO: 'bg-emerald-50 text-emerald-800',
  AJUSTE: 'bg-red-50 text-red-700',
};

export default function CoordenacaoPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/planejamentos/resumo/por-professor')
      .then((r) => setLista(r.data || []))
      .catch(() => {
        // fallback: lista simples de professores
        api
          .get('/professores')
          .then((r) =>
            setLista(
              (r.data || []).map((p: any) => ({
                ...p,
                totalPlanejamentos: 0,
                recentes: [],
                turmas: (p.turmas || []).map((t: any) => ({
                  id: t.turma?.id,
                  nome: t.turma?.nome,
                  disciplina: t.disciplina,
                  turno: t.turma?.turno,
                })),
              })),
            ),
          )
          .catch(() => setErr('Não foi possível carregar o quadro de professores.'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
          <ClipboardPen size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Coordenação pedagógica</h1>
          <p className="text-sm text-slate-600 font-medium">
            Acompanhe professores e revise o planejamento quinzenal
          </p>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Carregando professores...</p>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          <UserCog className="mx-auto mb-2 text-slate-400" />
          Nenhum professor cadastrado. Cadastre em <strong>Professores</strong>.
        </div>
      ) : (
        <div className="grid gap-3">
          {lista.map((p) => (
            <Link
              key={p.id}
              href={`/coordenacao/${p.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 group-hover:text-indigo-800">
                    {p.nomeCompleto}
                  </p>
                  <p className="text-xs text-slate-600">
                    {(p.disciplinas || []).join(', ') || 'Disciplinas não informadas'}
                    {p.formacao ? ` · ${p.formacao}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.totalPlanejamentos || 0} planejamento(s)
                    {(p.turmas || []).length
                      ? ` · turmas: ${p.turmas
                          .map((t: any) => t.nome)
                          .filter(Boolean)
                          .join(', ')}`
                      : ''}
                  </p>
                  {(p.recentes || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.recentes.slice(0, 3).map((r: any) => (
                        <span
                          key={r.id}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusCls[r.status] || statusCls.RASCUNHO}`}
                        >
                          {r.quinzena}ª {r.mes}/{r.ano} · {statusLabel[r.status] || r.status}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="text-slate-400 group-hover:text-indigo-600 shrink-0 mt-1" size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
