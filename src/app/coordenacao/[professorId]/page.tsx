'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, CheckCircle2, ClipboardPen, MessageSquareWarning } from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const statusLabel: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  AJUSTE: 'Ajuste solicitado',
};

const statusCls: Record<string, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-700 border-slate-200',
  ENVIADO: 'bg-amber-50 text-amber-800 border-amber-200',
  APROVADO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  AJUSTE: 'bg-red-50 text-red-700 border-red-200',
};

export default function CoordenacaoProfessorPage() {
  const params = useParams();
  const professorId = String(params.professorId || '');
  const [professor, setProfessor] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [selecionado, setSelecionado] = useState<any>(null);
  const [obs, setObs] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    setErr('');
    try {
      const [profs, pls] = await Promise.all([
        api.get('/professores'),
        api.get('/planejamentos', { params: { professorId } }),
      ]);
      const p = (profs.data || []).find((x: any) => String(x.id) === professorId);
      setProfessor(p || null);
      setItens(pls.data || []);
      if (pls.data?.[0]) {
        setSelecionado(pls.data[0]);
        setObs(pls.data[0].observacaoCoord || '');
      } else {
        setSelecionado(null);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha ao carregar planejamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professorId) carregar();
  }, [professorId]);

  const atualizarStatus = async (status: 'APROVADO' | 'AJUSTE' | 'ENVIADO') => {
    if (!selecionado) return;
    setMsg('');
    setErr('');
    try {
      const { data } = await api.patch(`/planejamentos/${selecionado.id}/status`, {
        status,
        observacaoCoord: obs || null,
      });
      setSelecionado(data);
      setMsg(
        status === 'APROVADO'
          ? 'Planejamento aprovado pela Coordenação.'
          : status === 'AJUSTE'
            ? 'Solicitação de ajuste registrada.'
            : 'Status atualizado.',
      );
      carregar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Não foi possível atualizar o status.');
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
            <ClipboardPen size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {professor?.nomeCompleto || 'Professor'}
            </h1>
            <p className="text-sm text-slate-600">
              Planejamentos quinzenais · vista da Coordenação
            </p>
          </div>
        </div>
        <Link
          href="/coordenacao"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>

      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          <aside className="bg-white rounded-2xl border shadow-sm overflow-hidden h-fit">
            <div className="px-3 py-2.5 border-b bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              Planejamentos ({itens.length})
            </div>
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {itens.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelecionado(item);
                    setObs(item.observacaoCoord || '');
                    setMsg('');
                  }}
                  className={`w-full text-left px-3 py-3 text-sm hover:bg-indigo-50/50 transition ${
                    selecionado?.id === item.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    {item.quinzena}ª · {MESES[(item.mes || 1) - 1]}/{item.ano}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {item.disciplina}
                    {item.turma?.nome ? ` · ${item.turma.nome}` : ''}
                  </p>
                  <span
                    className={`mt-1 inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusCls[item.status] || statusCls.RASCUNHO}`}
                  >
                    {statusLabel[item.status] || item.status}
                  </span>
                </button>
              ))}
              {itens.length === 0 && (
                <p className="p-4 text-sm text-slate-500 text-center">
                  Este professor ainda não registrou planejamento.
                </p>
              )}
            </div>
          </aside>

          <main className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
            {!selecionado ? (
              <p className="text-sm text-slate-500">Selecione um planejamento à esquerda.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selecionado.tema || `${selecionado.disciplina} — ${selecionado.quinzena}ª quinzena`}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {MESES[(selecionado.mes || 1) - 1]}/{selecionado.ano} ·{' '}
                      {new Date(selecionado.dataInicio).toLocaleDateString('pt-BR')} a{' '}
                      {new Date(selecionado.dataFim).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusCls[selecionado.status] || statusCls.RASCUNHO}`}
                  >
                    {statusLabel[selecionado.status] || selecionado.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="font-bold text-slate-800">Disciplina:</span>{' '}
                    {selecionado.disciplina}
                  </p>
                  <p>
                    <span className="font-bold text-slate-800">Turma:</span>{' '}
                    {selecionado.turma?.nome || '—'}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-bold text-slate-800">BNCC:</span>{' '}
                    {selecionado.bncc || '—'}
                  </p>
                </div>

                <Block title="Objetivos" text={selecionado.objetivos} />
                <Block title="Conteúdos / sequência" text={selecionado.conteudos} />
                <div className="grid sm:grid-cols-3 gap-3">
                  <Block title="Metodologia" text={selecionado.metodologia} compact />
                  <Block title="Recursos" text={selecionado.recursos} compact />
                  <Block title="Avaliação" text={selecionado.avaliacao} compact />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <label className="block text-sm font-bold text-slate-800">
                    Observação da Coordenação
                    <textarea
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[80px] text-sm font-normal"
                      placeholder="Comentários, orientações ou pedido de ajuste..."
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => atualizarStatus('APROVADO')}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold"
                    >
                      <CheckCircle2 size={16} /> Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => atualizarStatus('AJUSTE')}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-sm font-bold"
                    >
                      <MessageSquareWarning size={16} /> Solicitar ajuste
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function Block({ title, text, compact }: { title: string; text?: string | null; compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/60 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">{title}</p>
      <p className="text-sm text-slate-900 whitespace-pre-wrap">{text || '—'}</p>
    </div>
  );
}
