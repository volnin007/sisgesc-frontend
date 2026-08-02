'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileSignature, Printer, Save, RotateCcw } from 'lucide-react';

const MOTIVOS = [
  'Transferência durante o ano letivo',
  'Transferência ao final do ano letivo',
  'Mudança de domicílio',
  'Solicitação do responsável',
  'Outros',
];

const DOCS = [
  'Declaração de Transferência',
  'Histórico Escolar',
  'Ficha Individual',
  'Relatório Pedagógico',
];

export default function DeclaracaoTransferenciaPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState<'DECLARACAO' | 'TRANSFERENCIA'>('DECLARACAO');
  const [alunoId, setAlunoId] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [situacao, setSituacao] = useState('');
  const [dataUltimaFrequencia, setDataUltimaFrequencia] = useState('');
  const [percentualFrequencia, setPercentualFrequencia] = useState('');
  const [escolaDestino, setEscolaDestino] = useState('');
  const [municipioDestino, setMunicipioDestino] = useState('');
  const [estadoDestino, setEstadoDestino] = useState('GO');
  const [docs, setDocs] = useState<string[]>(['Declaração de Transferência']);
  const [observacoes, setObservacoes] = useState('');
  const [secretariaNome, setSecretariaNome] = useState('');
  const [secretariaMatricula, setSecretariaMatricula] = useState('');
  const [diretorNome, setDiretorNome] = useState('');
  const [diretorMatricula, setDiretorMatricula] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [emitido, setEmitido] = useState<any>(null);

  useEffect(() => {
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
    api.get('/transferencias').then((r) => setLista(r.data || [])).catch(() => {});
  }, []);

  const aluno = alunos.find((a) => String(a.id) === alunoId);
  const matricula = aluno?.matriculas?.[0];
  const respPrincipal =
    aluno?.responsaveis?.find((r: any) => r.principal)?.responsavel ||
    aluno?.responsaveis?.[0]?.responsavel;

  async function emitir(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!alunoId) return setErr('Selecione o estudante.');
    try {
      const { data } = await api.post('/transferencias', {
        alunoId: Number(alunoId),
        matriculaId: matricula?.id || null,
        tipoDocumento,
        motivo,
        situacao: situacao || motivo,
        dataUltimaFrequencia: dataUltimaFrequencia || null,
        percentualFrequencia: percentualFrequencia ? Number(percentualFrequencia) : null,
        escolaDestino,
        municipioDestino,
        estadoDestino,
        documentosEntregues: docs,
        observacoes,
        secretariaNome,
        secretariaMatricula,
        diretorNome,
        diretorMatricula,
      });
      setEmitido(data);
      setMsg('Documento emitido e salvo. Use Imprimir / PDF.');
      const list = await api.get('/transferencias');
      setLista(list.data || []);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Erro ao emitir documento.');
    }
  }

  function carregarEmitido(item: any) {
    setEmitido(item);
    setTipoDocumento(item.tipoDocumento === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'DECLARACAO');
    setAlunoId(String(item.alunoId));
    setMotivo(item.motivo || MOTIVOS[0]);
    setSituacao(item.situacao || '');
    setDataUltimaFrequencia(item.dataUltimaFrequencia ? String(item.dataUltimaFrequencia).slice(0, 10) : '');
    setPercentualFrequencia(item.percentualFrequencia != null ? String(item.percentualFrequencia) : '');
    setEscolaDestino(item.escolaDestino || '');
    setMunicipioDestino(item.municipioDestino || '');
    setEstadoDestino(item.estadoDestino || 'GO');
    setDocs(item.documentosEntregues || []);
    setObservacoes(item.observacoes || '');
    setSecretariaNome(item.secretariaNome || '');
    setSecretariaMatricula(item.secretariaMatricula || '');
    setDiretorNome(item.diretorNome || '');
    setDiretorMatricula(item.diretorMatricula || '');
    setMsg('Documento carregado para reimpressão.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const toggleDoc = (d: string) =>
    setDocs((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const nomeAluno = aluno?.nomeCompleto || emitido?.aluno?.nomeCompleto || '________________';
  const cpfAluno = aluno?.cpf || emitido?.aluno?.cpf || '________________';
  const nascAluno = aluno?.dataNascimento
    ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')
    : emitido?.aluno?.dataNascimento
    ? new Date(emitido.aluno.dataNascimento).toLocaleDateString('pt-BR')
    : '__/__/____';
  const maeAluno = aluno?.nomeMae || emitido?.aluno?.nomeMae || '________________';
  const serieTxt = matricula?.turma?.anoSerie || matricula?.turma?.nome || '________';
  const turnoTxt = matricula?.turma?.turno || '________';
  const etapaTxt =
    matricula?.turma?.etapa === 'INFANTIL'
      ? 'Educação Infantil'
      : matricula?.turma?.etapa === 'FUND1'
      ? 'Ensino Fundamental – Anos Iniciais'
      : matricula?.turma?.etapa === 'FUND2'
      ? 'Ensino Fundamental – Anos Finais'
      : '________________';

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
            <FileSignature size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Declaração / Transferência</h1>
            <p className="text-sm text-slate-600">Modelos SEDUC-GO · Escola Municipal Dimas Nasser</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold bg-white">
          <Printer size={16} /> Imprimir / PDF
        </button>
      </div>

      <form onSubmit={emitir} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm no-print">
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <label className="flex items-center gap-2">
            <input type="radio" checked={tipoDocumento === 'DECLARACAO'} onChange={() => setTipoDocumento('DECLARACAO')} /> Declaração de Transferência
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={tipoDocumento === 'TRANSFERENCIA'} onChange={() => setTipoDocumento('TRANSFERENCIA')} /> Documento completo de Transferência
          </label>
        </div>

        <label className="block text-sm font-semibold">Estudante *
          <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
            <option value="">Selecione...</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nomeCompleto}{a.matriculas?.[0]?.turma?.nome ? ` · ${a.matriculas[0].turma.nome}` : ''}
              </option>
            ))}
          </select>
        </label>

        {aluno && (
          <div className="rounded-xl bg-slate-50 border px-3 py-2 text-xs text-slate-700 grid sm:grid-cols-2 gap-1">
            <span>CPF: {aluno.cpf || '—'}</span>
            <span>Nasc.: {aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '—'}</span>
            <span>Mãe: {aluno.nomeMae || '—'}</span>
            <span>Resp.: {respPrincipal?.nome || '—'}</span>
            <span>Matrícula: {matricula?.numeroMatricula || '—'}</span>
            <span>Turma: {matricula?.turma?.nome || '—'} · {matricula?.turma?.turno || '—'}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Motivo / situação
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Detalhe (se Outros)
            <input value={situacao} onChange={(e) => setSituacao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Último dia de frequência
            <input type="date" value={dataUltimaFrequencia} onChange={(e) => setDataUltimaFrequencia(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">% Frequência
            <input type="number" min={0} max={100} value={percentualFrequencia} onChange={(e) => setPercentualFrequencia(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Escola de destino
            <input value={escolaDestino} onChange={(e) => setEscolaDestino(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Município destino
            <input value={municipioDestino} onChange={(e) => setMunicipioDestino(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Estado destino
            <input value={estadoDestino} onChange={(e) => setEstadoDestino(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" maxLength={2} />
          </label>
        </div>

        {tipoDocumento === 'TRANSFERENCIA' && (
          <div>
            <p className="text-sm font-bold mb-1">Documentos entregues</p>
            <div className="grid sm:grid-cols-2 gap-1 text-sm">
              {DOCS.map((d) => (
                <label key={d} className="flex items-center gap-2">
                  <input type="checkbox" checked={docs.includes(d)} onChange={() => toggleDoc(d)} /> {d}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Secretário(a) — nome<input value={secretariaNome} onChange={(e) => setSecretariaNome(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Secretário(a) — matrícula<input value={secretariaMatricula} onChange={(e) => setSecretariaMatricula(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Diretor(a) — nome<input value={diretorNome} onChange={(e) => setDiretorNome(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Diretor(a) — matrícula<input value={diretorMatricula} onChange={(e) => setDiretorMatricula(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
        </div>

        <label className="block text-sm font-semibold">Observações
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[60px]" />
        </label>

        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-sky-700 text-white px-5 py-2.5 text-sm font-bold">
          <Save size={16} /> Emitir e salvar documento
        </button>
      </form>

      {/* Documento oficial para impressão */}
      <div className="bg-white border rounded-2xl p-8 text-slate-900 text-sm space-y-4 print:border-0 print:p-2 leading-relaxed">
        <div className="text-center space-y-1 border-b pb-3">
          <p className="text-[11px] font-bold uppercase tracking-wide">Estado de Goiás</p>
          <p className="text-[11px] font-bold uppercase tracking-wide">Secretaria de Estado da Educação – SEDUC/GO</p>
          <p className="font-bold mt-1">Escola Municipal Dimas Nasser</p>
          <p className="text-xs">Município: Bom Jardim de Goiás</p>
          <h2 className="text-base font-black mt-2 uppercase">
            {tipoDocumento === 'DECLARACAO' ? 'Declaração de Transferência Escolar' : 'Documento de Transferência Escolar'}
          </h2>
        </div>

        {tipoDocumento === 'DECLARACAO' ? (
          <div className="space-y-3">
            <p>
              Declaramos, para os devidos fins, que o(a) estudante <strong>{nomeAluno}</strong>,
              inscrito(a) no CPF nº <strong>{cpfAluno}</strong>, nascido(a) em <strong>{nascAluno}</strong>,
              filho(a) de <strong>{maeAluno}</strong>
              {respPrincipal?.nome ? <> e <strong>{respPrincipal.nome}</strong></> : null},
              esteve regularmente matriculado(a) nesta unidade escolar no <strong>Ano Letivo de {new Date().getFullYear()}</strong>,
              cursando o <strong>{serieTxt}</strong>, da etapa <strong>{etapaTxt}</strong>, no turno <strong>{turnoTxt}</strong>.
            </p>
            <p>
              Informamos que, por solicitação do(a) responsável legal (ou do próprio estudante, quando maior de idade),
              foi concedida a <strong>Transferência Escolar</strong>, ficando o(a) estudante apto(a) à continuidade de seus estudos
              em outra unidade de ensino, conforme a legislação educacional vigente.
            </p>
            <p>
              O <strong>Histórico Escolar</strong> será entregue juntamente com esta declaração ou encaminhado à unidade escolar de destino,
              observados os procedimentos administrativos e os prazos estabelecidos pela legislação e pelas normas da Secretaria de Estado da Educação de Goiás.
            </p>
            <p>
              A presente declaração é emitida para fins de efetivação de matrícula em outra instituição de ensino e tem validade de{' '}
              <strong>30 (trinta) dias</strong>, contados da data de sua emissão, ou até a apresentação do Histórico Escolar definitivo,
              conforme normas da rede de ensino.
            </p>
            <p>Por ser verdade, firmamos a presente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-bold text-xs uppercase border-b pb-1">Dados do(a) estudante</p>
            <p><strong>Nome completo:</strong> {nomeAluno}</p>
            <p><strong>Data de nascimento:</strong> {nascAluno} · <strong>CPF:</strong> {cpfAluno}</p>
            <p><strong>Nome da mãe:</strong> {maeAluno}</p>
            <p><strong>Responsável:</strong> {respPrincipal?.nome || '—'}</p>
            <p><strong>Número da matrícula:</strong> {matricula?.numeroMatricula || '—'}</p>
            <p><strong>Etapa:</strong> {etapaTxt} · <strong>Ano/Série:</strong> {serieTxt} · <strong>Turma:</strong> {matricula?.turma?.nome || '—'} · <strong>Turno:</strong> {turnoTxt}</p>
            <p><strong>Ano letivo:</strong> {new Date().getFullYear()}</p>

            <p className="font-bold text-xs uppercase border-b pb-1 pt-2">Situação escolar</p>
            <p>O(a) estudante esteve regularmente matriculado(a) nesta unidade até a data de{' '}
              <strong>{dataUltimaFrequencia ? new Date(dataUltimaFrequencia + 'T12:00:00').toLocaleDateString('pt-BR') : '____/____/______'}</strong>.</p>
            <p><strong>Situação:</strong> {motivo}{situacao ? ` — ${situacao}` : ''}</p>
            <p><strong>Percentual de frequência:</strong> {percentualFrequencia ? `${percentualFrequencia}%` : '________ %'}</p>

            <p className="font-bold text-xs uppercase border-b pb-1 pt-2">Documentos entregues</p>
            <p>{docs.length ? docs.join('; ') : '—'}</p>

            <p className="font-bold text-xs uppercase border-b pb-1 pt-2">Destino</p>
            <p><strong>Unidade de destino:</strong> {escolaDestino || '________________'}</p>
            <p><strong>Município:</strong> {municipioDestino || '________________'} · <strong>Estado:</strong> {estadoDestino || '____'}</p>
            {observacoes && <p><strong>Observações:</strong> {observacoes}</p>}

            <p className="pt-2">
              Declaramos, para os devidos fins, que o(a) estudante acima identificado(a) esteve regularmente matriculado(a)
              nesta unidade escolar, estando apto(a) à continuidade de seus estudos na unidade de destino, conforme legislação
              vigente e normas da Secretaria de Estado da Educação de Goiás.
            </p>
          </div>
        )}

        <p className="pt-4">Município: <strong>Bom Jardim de Goiás</strong> · Data de emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></p>

        <div className="grid sm:grid-cols-2 gap-12 pt-14 text-center text-xs">
          <div>
            <div className="border-t border-slate-900 pt-1 mx-4">Secretário(a) Escolar</div>
            <p className="mt-2">{secretariaNome || 'Nome: ________________'}</p>
            <p>Matrícula: {secretariaMatricula || '________________'}</p>
          </div>
          <div>
            <div className="border-t border-slate-900 pt-1 mx-4">Diretor(a) da Unidade Escolar</div>
            <p className="mt-2">{diretorNome || 'Nome: ________________'}</p>
            <p>Matrícula: {diretorMatricula || '________________'}</p>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500 pt-8">Carimbo oficial da unidade escolar · SISGESC · Escola Municipal Dimas Nasser</p>
      </div>

      {lista.length > 0 && (
        <div className="no-print bg-white rounded-2xl border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
            <RotateCcw size={14} />
            <p className="text-sm font-bold text-slate-800">Documentos emitidos ({lista.length})</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-600">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Aluno</th>
                <th className="p-3">Tipo</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{new Date(item.dataEmissao || item.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 font-medium">{item.aluno?.nomeCompleto}</td>
                  <td className="p-3">{item.tipoDocumento}</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => carregarEmitido(item)} className="text-sky-700 font-semibold text-xs hover:underline">
                      Reimprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
