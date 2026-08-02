'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileText, AlertTriangle, CheckCircle2, Search, Printer } from 'lucide-react';

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
      } else setDados(data);
    } catch {
      setErro('Não foi possível carregar o boletim.');
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

  const gerarPdf = () => window.print();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-cyan-600" /> Boletim Escolar
          </h1>
          <p className="text-sm text-gray-500">Escola Municipal Dimas Nasser · Pré ao 9º Ano</p>
        </div>
        <div className="flex gap-2">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="ID matrícula" className="border rounded-lg px-3 py-2 text-sm w-36" />
          <button onClick={() => carregar(id)} className="bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Search size={16} /> Buscar
          </button>
          {dados && (
            <button onClick={gerarPdf} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Printer size={16} /> Gerar PDF / Imprimir
            </button>
          )}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500 print:hidden">Carregando...</p>}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex gap-2 print:hidden">
          <AlertTriangle size={18} /> {erro}
        </div>
      )}

      {dados && (
        <div id="boletim-print" className="space-y-4 bg-white print:shadow-none">
          {/* Cabeçalho impressão */}
          <div className="border rounded-2xl p-6 print:border-black print:rounded-none">
            <div className="text-center border-b pb-4 mb-4 print:border-black">
              <p className="text-xs tracking-widest text-gray-500 uppercase">Estado de Goiás · Rede Municipal</p>
              <h2 className="text-xl font-black mt-1">Escola Municipal Dimas Nasser</h2>
              <p className="text-sm text-gray-600">Boletim Escolar · {dados.tipo === 'INFANTIL' ? 'Educação Infantil' : 'Ensino Fundamental'}</p>
              <p className="text-xs text-gray-400 mt-1">Gestão 2025/2028 · SISGESC</p>
            </div>

            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Aluno</p>
                <p className="text-lg font-bold">{dados.matricula?.aluno?.nomeCompleto}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {dados.matricula?.turma?.nome} · {dados.matricula?.turma?.anoSerie} · {dados.matricula?.turma?.turno}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Matrícula {dados.matricula?.numeroMatricula} · Nasc.{' '}
                  {dados.matricula?.aluno?.dataNascimento
                    ? new Date(dados.matricula.aluno.dataNascimento).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${corSituacao(dados.situacaoGeral?.resultado)}`}>
                  {dados.situacaoGeral?.resultado || dados.tipo}
                </span>
                <p className="text-xs text-gray-500 mt-2 max-w-xs ml-auto">{dados.situacaoGeral?.detalhe}</p>
              </div>
            </div>
          </div>

          {dados.frequencia && (
            <div className="border rounded-2xl p-5 print:border-black print:rounded-none">
              <h3 className="font-semibold text-sm mb-3">Frequência</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 print:border print:border-gray-300">
                  <p className="text-xs text-gray-500">Aulas</p>
                  <p className="font-bold text-lg">{dados.frequencia.total ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 print:border print:border-gray-300">
                  <p className="text-xs text-gray-500">Presenças</p>
                  <p className="font-bold text-lg">{dados.frequencia.presentes ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 print:border print:border-gray-300">
                  <p className="text-xs text-gray-500">Percentual</p>
                  <p className="font-bold text-lg">
                    {dados.frequencia.percentual != null ? `${dados.frequencia.percentual}%` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 print:border print:border-gray-300">
                  <p className="text-xs text-gray-500">Mínimo</p>
                  <p className="font-bold text-sm">{dados.frequencia.minimo}% · {dados.frequencia.situacao}</p>
                </div>
              </div>
            </div>
          )}

          {dados.tipo === 'INFANTIL' ? (
            <div className="border rounded-2xl p-6 print:border-black print:rounded-none">
              <h3 className="font-semibold mb-3">Campos de Experiência (BNCC)</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-2">Campo</th>
                    <th className="p-2">Bim</th>
                    <th className="p-2">Conceito</th>
                    <th className="p-2">Parecer</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.avaliacoes || []).map((a: any) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-2">{a.campoExperiencia}</td>
                      <td className="p-2">{a.bimestre}º</td>
                      <td className="p-2">{a.conceito}</td>
                      <td className="p-2 text-gray-600">{a.parecerDescritivo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border rounded-2xl p-6 print:border-black print:rounded-none">
              <h3 className="font-semibold mb-3">Rendimento</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-2">Disciplina</th>
                    <th className="p-2">Notas</th>
                    <th className="p-2">Média</th>
                    <th className="p-2">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.medias || []).map((m: any) => (
                    <tr key={m.disciplina} className="border-t">
                      <td className="p-2 font-medium">{m.disciplina}</td>
                      <td className="p-2">{(m.notas || []).join(' · ')}</td>
                      <td className="p-2 font-bold">{m.media}</td>
                      <td className="p-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${corSituacao(m.situacao)}`}>
                          {m.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="hidden print:block text-xs text-gray-500 pt-8 border-t mt-8">
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center border-t border-gray-400 pt-2">Secretaria Escolar</div>
              <div className="text-center border-t border-gray-400 pt-2">Direção</div>
            </div>
            <p className="text-center mt-8">Documento gerado pelo SISGESC · Escola Municipal Dimas Nasser · {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-2 print:hidden">
            <CheckCircle2 size={14} /> Use “Gerar PDF / Imprimir” e escolha “Salvar como PDF” no navegador.
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #boletim-print, #boletim-print * { visibility: visible !important; }
          #boletim-print { position: absolute; left: 0; top: 0; width: 100%; padding: 12px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
