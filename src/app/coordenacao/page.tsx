'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ClipboardPen, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export default function CoordenacaoPlanejamentosPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    setLoading(true);
    api
      .get('/planejamentos/resumo/por-professor')
      .then((r) => setLista(r.data || []))
      .catch(() => {
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
          .catch(() => setErr('Não foi possível carregar os planejamentos.'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const statusPlanejado = (p: any) => {
    const recentes = p.recentes || [];
    const temEnviadoOuAprovado = recentes.some((r: any) =>
      ['ENVIADO', 'APROVADO'].includes(r.status),
    );
    const temRascunho = recentes.some((r: any) => r.status === 'RASCUNHO' || r.status === 'AJUSTE');
    if (temEnviadoOuAprovado && !temRascunho) return 'PLANEJADO';
    if (recentes.length === 0) return 'PENDENTE';
    return 'PLANEJANDO';
  };

  async function receberPlanejamento(professorId: number, planejamentoId?: number) {
    try {
      if (planejamentoId) {
        await api.patch(`/planejamentos/${planejamentoId}/status`, { status: 'APROVADO' });
      }
      setMsg('Planejamento recebido / marcado como aprovado pela Coordenação.');
      carregar();
    } catch (e: any) {
      // tenta rota alternativa
      try {
        if (planejamentoId) {
          await api.patch(`/planejamentos/${planejamentoId}`, { status: 'APROVADO' });
          setMsg('Planejamento recebido.');
          carregar();
          return;
        }
      } catch {}
      setErr(e?.response?.data?.error || 'Não foi possível receber o planejamento. Abra o detalhe do professor.');
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
          <ClipboardPen size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Planejamentos</h1>
          <p className="text-sm text-slate-700 font-medium">
            Lista de professores · turno · turma · status do planejamento quinzenal
          </p>
        </div>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>}
      {msg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
          Nenhum professor encontrado. Cadastre em <strong>Usuários</strong> (perfil Professor).
        </div>
      ) : (
        <div className="grid gap-3">
          {lista.map((p) => {
            const st = statusPlanejado(p);
            const turmasTxt =
              (p.turmas || [])
                .map((t: any) => [t.nome, t.turno].filter(Boolean).join(' · '))
                .filter(Boolean)
                .join(', ') || 'Turma não vinculada';
            const ultimoEnviado = (p.recentes || []).find((r: any) => r.status === 'ENVIADO');

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-base font-bold text-slate-900">{p.nomeCompleto}</p>
                  <p className="text-xs text-slate-600">
                    {(p.disciplinas || []).join(', ') || 'Disciplinas não informadas'}
                  </p>
                  <p className="text-xs text-slate-700 font-medium">Turma / turno: {turmasTxt}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {st === 'PLANEJADO' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        <CheckCircle2 size={12} /> Planejado
                      </span>
                    )}
                    {st === 'PLANEJANDO' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                        <Clock size={12} /> Planejando
                      </span>
                    )}
                    {st === 'PENDENTE' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Pendente
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">
                      {p.totalPlanejamentos || 0} registro(s)
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {ultimoEnviado && (
                    <button
                      type="button"
                      onClick={() => receberPlanejamento(p.id, ultimoEnviado.id)}
                      className="rounded-xl bg-indigo-700 text-white px-3 py-2 text-xs font-bold"
                    >
                      Receber planejamento
                    </button>
                  )}
                  <Link
                    href={`/coordenacao/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold text-slate-800 hover:border-indigo-300"
                  >
                    Detalhes <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
