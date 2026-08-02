'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileText, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

export default function BoletimPage({ params }: { params: { matriculaId: string } }) {
  const [dados, setDados] = useState<any>(null);
  const [id, setId] = useState(params.matriculaId || '');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = async (mid: string) => {
    if (!mid) return;
    setLoading(true);
    setErro('');
    try {
      const { data } = await api.get(`/notas/boletim/${mid}`);
      if (data.error) {
        setErro(data.error);
        setDados(null);
      } else {
        setDados(data);
      }
    } catch {
      setErro('Não foi possível carregar o boletim. Verifique o ID da matrícula.');
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) carregar(id);
  }, []);

  const corSituacao = (s: string) => {
    if (s?.includes('APROVADO') || s === 'PROGRESSAO_CONTINUADA' || s === 'PROGRESSAO' || s === 'FREQUENCIA_OK')
      return 'bg-green-100 text-green-800 border-green-200';
    if (s?.includes('REPROVADO') || s?.includes('FALTA')) return 'bg-red-100 text-red-800 border-red-200';
    if (s?.includes('RECUPERACAO') || s?.includes('ALERTA') || s?.includes('ACOMPANHAMENTO'))
      return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-cyan-600" /> Boletim Escolar
          </h1>
          <p className="text-sm text-gray-500">Escola Municipal Dimas Nasser · Pré ao 9º Ano</p>
        </div>
        <div className="flex gap-2">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID da matrícula"
            className="border rounded-lg px-3 py-2 text-sm w-36"
          />
          <button
            onClick={() => carregar(id)}
            className="bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Search size={16} /> Buscar
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Carregando boletim...</p>}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex gap-2">
          <AlertTriangle size={18} /> {erro}
        </div>
      )}

      {dados && (
        <>
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Aluno</p>
                <p className="text-xl font-bold">{dados.matricula?.aluno?.nomeCompleto}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {dados.matricula?.turma?.nome} · {dados.matricula?.turma?.etapa} ·{' '}
                  {dados.matricula?.turma?.anoSerie}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Matrícula {dados.matricula?.numeroMatricula} · Status {dados.matricula?.status}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${corSituacao(dados.situacaoGeral?.resultado)}`}>
                  {dados.situacaoGeral?.resultado || dados.tipo}
                </span>
                <p className="text-xs text-gray-500 mt-2 max-w-xs">{dados.situacaoGeral?.detalhe}</p>
              </div>
            </div>
          </div>

          {dados.frequencia && (
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-semibold text-sm mb-3">Frequência</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Aulas</p>
                  <p className="font-bold text-lg">{dados.frequencia.total ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Presenças</p>
                  <p className="font-bold text-lg">{dados.frequencia.presentes ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Percentual</p>
                  <p className="font-bold text-lg">
                    {dados.frequencia.percentual != null ? `${dados.frequencia.percentual}%` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Mínimo / Situação</p>
                  <p className="font-bold text-sm">{dados.frequencia.minimo}% · {dados.frequencia.situacao}</p>
                </div>
              </div>
              {dados.frequencia.observacao && (
                <p className="text-xs text-amber-700 mt-3 flex gap-1">
                  <AlertTriangle size={14} /> {dados.frequencia.observacao}
                </p>
              )}
            </div>
          )}

          {dados.tipo === 'INFANTIL' ? (
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-semibold mb-1">Campos de Experiência (BNCC)</h3>
              <p className="text-xs text-gray-500 mb-4">{dados.regras?.nota}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="p-3">Campo</th>
                      <th className="p-3">Bimestre</th>
                      <th className="p-3">Conceito</th>
                      <th className="p-3">Parecer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dados.avaliacoes || []).map((a: any) => (
                      <tr key={a.id} className="border-t">
                        <td className="p-3 font-medium">{a.campoExperiencia}</td>
                        <td className="p-3">{a.bimestre}º</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full border ${corSituacao(a.conceito === 'ALCANCOU' ? 'APROVADO' : 'ALERTA')}`}>
                            {a.conceito}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{a.parecerDescritivo || '—'}</td>
                      </tr>
                    ))}
                    {(!dados.avaliacoes || dados.avaliacoes.length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400">
                          Nenhuma avaliação lançada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-semibold mb-1">Rendimento por disciplina</h3>
              <p className="text-xs text-gray-500 mb-4">
                Média mínima 6,0 · {dados.regras?.formulaMedia}
                {dados.regras?.progressaoContinuada && ' · Progressão continuada (1º/2º ano)'}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {(dados.medias || []).map((m: any) => (
                  <div key={m.disciplina} className="border rounded-xl p-4 hover:shadow-sm transition">
                    <div className="flex justify-between items-start">
                      <p className="font-bold">{m.disciplina}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${corSituacao(m.situacao)}`}>
                        {m.situacao}
                      </span>
                    </div>
                    <p className="text-3xl font-black text-gray-800 mt-2">{m.media}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.bimestresLancados} bimestre(s) · notas: {(m.notas || []).join(', ')}
                    </p>
                    {m.observacao && <p className="text-xs text-amber-700 mt-2">{m.observacao}</p>}
                  </div>
                ))}
                {(!dados.medias || dados.medias.length === 0) && (
                  <p className="text-sm text-gray-400 col-span-2">Nenhuma nota lançada</p>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 flex items-center gap-2">
            <CheckCircle2 size={14} /> Documento gerado pelo SISGESC · {dados.escola}
          </div>
        </>
      )}
    </div>
  );
}
