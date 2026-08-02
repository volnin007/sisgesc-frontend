'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Phone, MessageCircle, UserRound } from 'lucide-react';

/**
 * Submódulo Responsável (Coordenação):
 * Lista alunos com responsáveis cadastrados na matrícula,
 * telefone/WhatsApp para contato e convocação.
 */
export default function CoordenacaoResponsavelPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/alunos')
      .then((r) => setAlunos(r.data || []))
      .catch(() => setErr('Não foi possível carregar alunos/responsáveis.'));
  }, []);

  const lista = alunos.filter((a) => {
    const q = filtro.toLowerCase();
    if (!q) return true;
    const nomesResp = (a.responsaveis || [])
      .map((r: any) => r.responsavel?.nome || '')
      .join(' ')
      .toLowerCase();
    return a.nomeCompleto?.toLowerCase().includes(q) || nomesResp.includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
          <UserRound size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Contato com Responsável</h1>
          <p className="text-sm text-slate-600">
            Dados vindos da matrícula · telefone e WhatsApp dos responsáveis
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-800">
        <strong>Como está configurado:</strong> ao matricular o aluno, cadastram-se mãe, pai e/ou responsável legal
        (nome, CPF, telefone). Esta tela lista esses contatos para a Coordenação convocar, registrar ligação ou
        abrir WhatsApp. Integração com envio em massa fica em <strong>Avisos WhatsApp</strong>.
      </div>

      <input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar aluno ou responsável..."
        className="w-full border rounded-xl px-4 py-2.5 text-sm text-slate-900"
      />

      {err && <p className="text-sm text-red-700">{err}</p>}

      <div className="grid gap-3">
        {lista.map((a) => {
          const resps = a.responsaveis || [];
          const tel = a.telefoneContato;
          return (
            <div key={a.id} className="bg-white rounded-2xl border p-4 shadow-sm">
              <p className="font-bold text-slate-900">{a.nomeCompleto}</p>
              <p className="text-xs text-slate-600">
                {a.matriculas?.[0]?.turma?.nome || 'Sem turma'} · {a.matriculas?.[0]?.turma?.turno || ''}
              </p>
              {tel && (
                <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
                  <Phone size={12} /> Contato principal: {tel}
                </p>
              )}
              <div className="mt-3 space-y-2">
                {resps.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum responsável detalhado no cadastro.</p>
                )}
                {resps.map((r: any) => {
                  const resp = r.responsavel;
                  if (!resp) return null;
                  const wa = (resp.whatsapp || resp.telefone || '').replace(/\D/g, '');
                  return (
                    <div key={r.id || resp.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 border px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{resp.nome}</p>
                        <p className="text-xs text-slate-600">
                          {resp.parentesco || '—'} · {resp.telefone || resp.whatsapp || 'sem telefone'}
                          {r.principal ? ' · principal' : ''}
                        </p>
                      </div>
                      {wa && (
                        <a
                          href={`https://wa.me/55${wa}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {lista.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">Nenhum registro encontrado.</p>
        )}
      </div>
    </div>
  );
}
