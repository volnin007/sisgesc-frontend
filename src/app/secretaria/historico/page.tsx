'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { gerarPdfSimples } from '@/lib/pdf';
import { ScrollText, Printer, Save, FileDown } from 'lucide-react';

export default function HistoricoEscolarPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [notas, setNotas] = useState<any[]>([]);
  const [freq, setFreq] = useState<{ total: number; presentes: number } | null>(null);

  useEffect(() => {
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
  }, []);

  const aluno = alunos.find((a) => String(a.id) === alunoId);
  const matricula = aluno?.matriculas?.[0];

  async function carregarDados() {
    if (!alunoId) return;
    setErr('');
    try {
      if (matricula?.id) {
        const [n, f] = await Promise.all([
          api.get('/notas', { params: { matriculaId: matricula.id } }).catch(() => ({ data: [] })),
          api.get('/frequencias', { params: { matriculaId: matricula.id } }).catch(() => ({ data: [] })),
        ]);
        setNotas(n.data || []);
        const lista = f.data || [];
        const presentes = lista.filter((x: any) => x.presente).length;
        setFreq({ total: lista.length, presentes });
      }
      setMsg('Dados carregados para o histórico.');
    } catch {
      setErr('Não foi possível carregar notas/frequência.');
    }
  }

  useEffect(() => {
    if (alunoId) carregarDados();
  }, [alunoId]);

  async function gerarPdf() {
    if (!aluno) return setErr('Selecione o estudante.');
    const linhas = [
      `Estudante: ${aluno.nomeCompleto}`,
      `Nascimento: ${aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '—'}`,
      `CPF: ${aluno.cpf || '—'}`,
      `Mãe: ${aluno.nomeMae || '—'}`,
      `Turma: ${matricula?.turma?.nome || '—'} · ${matricula?.turma?.turno || '—'}`,
      `Matrícula: ${matricula?.numeroMatricula || '—'}`,
      `Ano letivo: ${new Date().getFullYear()}`,
      '',
      '— Aproveitamento —',
      ...(notas.length
        ? notas.map(
            (n: any) =>
              `${n.disciplina || 'Disc.'} · ${n.bimestre}º bim · Nota: ${n.nota}${n.faltasBimestre != null ? ` · Faltas: ${n.faltasBimestre}` : ''}`,
          )
        : ['Notas não registradas no sistema.']),
      '',
      freq
        ? `Frequência registrada: ${freq.presentes}/${freq.total} (${freq.total ? Math.round((freq.presentes / freq.total) * 100) : 0}%)`
        : 'Frequência: sem registros.',
      '',
      observacoes ? `Observações: ${observacoes}` : '',
      '',
      'Declaramos a veracidade das informações constantes neste Histórico Escolar.',
      'Escola Municipal Dimas Nasser · Bom Jardim de Goiás',
    ].filter(Boolean);

    await gerarPdfSimples({
      titulo: 'HISTÓRICO ESCOLAR',
      subtitulo: 'Escola Municipal Dimas Nasser · SEDUC/GO (modelo municipal)',
      linhas,
      nomeArquivo: `historico-${aluno.nomeCompleto.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    });
    setMsg('PDF do Histórico Escolar gerado.');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    carregarDados();
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <ScrollText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Histórico Escolar</h1>
            <p className="text-sm text-slate-600">Emissão com dados de matrícula, notas e frequência</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold">
            <Printer size={16} /> Imprimir
          </button>
          <button type="button" onClick={gerarPdf} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold">
            <FileDown size={16} /> PDF (jsPDF)
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm no-print">
        <label className="block text-sm font-semibold text-slate-800">
          Estudante *
          <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
            <option value="">Selecione...</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>{a.nomeCompleto}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Observações
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[70px]" />
        </label>
        {err && <p className="text-sm text-red-700">{err}</p>}
        {msg && <p className="text-sm text-emerald-800">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-5 py-2.5 text-sm font-bold">
          <Save size={16} /> Atualizar dados
        </button>
      </form>

      <div id="historico-print" className="bg-white border rounded-2xl p-6 text-sm text-slate-900 space-y-3 print:border-0">
        <div className="text-center border-b pb-3">
          <p className="text-xs font-bold uppercase">Estado de Goiás · Rede Municipal de Ensino</p>
          <p className="font-bold text-base text-slate-900">Escola Municipal Dimas Nasser</p>
          <p className="text-xs text-slate-700">Bom Jardim de Goiás</p>
          <h2 className="text-lg font-black mt-2 text-slate-900">HISTÓRICO ESCOLAR</h2>
        </div>
        <p><strong>Estudante:</strong> {aluno?.nomeCompleto || '—'}</p>
        <p><strong>Nascimento:</strong> {aluno?.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '—'} · <strong>CPF:</strong> {aluno?.cpf || '—'}</p>
        <p><strong>Filiação:</strong> {aluno?.nomeMae || '—'}</p>
        <p><strong>Turma:</strong> {matricula?.turma?.nome || '—'} · {matricula?.turma?.turno || '—'} · <strong>Matrícula:</strong> {matricula?.numeroMatricula || '—'}</p>
        <p className="font-bold border-b pt-2">Aproveitamento</p>
        {notas.length === 0 ? (
          <p className="text-slate-600">Sem notas registradas.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {notas.map((n: any, i: number) => (
              <li key={i}>{n.disciplina} · {n.bimestre}º bim · Nota {n.nota}</li>
            ))}
          </ul>
        )}
        {freq && (
          <p><strong>Frequência:</strong> {freq.presentes}/{freq.total} ({freq.total ? Math.round((freq.presentes / freq.total) * 100) : 0}%)</p>
        )}
        {observacoes && <p><strong>Observações:</strong> {observacoes}</p>}
        <div className="grid sm:grid-cols-2 gap-10 pt-12 text-center text-xs">
          <div className="border-t border-slate-900 pt-1 mx-4 text-slate-900">Secretário(a) Escolar</div>
          <div className="border-t border-slate-900 pt-1 mx-4 text-slate-900">Diretor(a)</div>
        </div>
      </div>
    </div>
  );
}
