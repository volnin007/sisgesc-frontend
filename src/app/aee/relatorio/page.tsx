'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ClipboardList, Printer, Save } from 'lucide-react';

export default function RelatorioAeePage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [bimestre, setBimestre] = useState('1');
  const [serieAno, setSerieAno] = useState('');
  const [necessidadeEspecial, setNecessidadeEspecial] = useState('');
  const [pai, setPai] = useState('');
  const [mae, setMae] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [coordenacao, setCoordenacao] = useState('');
  const [professorRegente, setProfessorRegente] = useState('');
  const [profissionalApoio, setProfissionalApoio] = useState('');
  const [professorAee, setProfessorAee] = useState('');
  const [dadosRelevantes, setDadosRelevantes] = useState('');
  const [campos, setCampos] = useState({
    percepcao: '', atencao: '', memoria: '', linguagem: '', criatividade: '',
    raciocinio: '', psicomotor: '', autocuidado: '', autonomia: '', habilidadesSociais: '', intervencoes: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const a = alunos.find((x) => String(x.id) === alunoId);
    if (a) {
      setMae(a.nomeMae || '');
      setNecessidadeEspecial(a.tipoDeficiencia || '');
    }
  }, [alunoId, alunos]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!alunoId) return setErr('Selecione o aluno.');
    try {
      await api.post('/aee/relatorios', {
        alunoId: Number(alunoId),
        bimestre: Number(bimestre),
        serieAno,
        necessidadeEspecial,
        pai, mae, responsavel, coordenacao, professorRegente, profissionalApoio, professorAee,
        dadosRelevantes,
        ...campos,
        status: 'SALVO',
      });
      setMsg('Relatório AEE salvo. Use Imprimir / PDF.');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Erro ao salvar relatório.');
    }
  }

  const aluno = alunos.find((a) => String(a.id) === alunoId);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Relatório Bimestral AEE</h1>
            <p className="text-sm text-slate-600">Aprendizagem e desenvolvimento · Dimas Nasser</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold">
          <Printer size={16} /> Imprimir / PDF
        </button>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm no-print">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm font-semibold sm:col-span-2">Aluno *
            <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              <option value="">Selecione...</option>
              {alunos.map((a) => <option key={a.id} value={a.id}>{a.nomeCompleto}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Bimestre
            <select value={bimestre} onChange={(e) => setBimestre(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              {[1, 2, 3, 4].map((b) => <option key={b} value={b}>{b}º</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Série/Ano<input value={serieAno} onChange={(e) => setSerieAno(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Necessidade educacional especial<input value={necessidadeEspecial} onChange={(e) => setNecessidadeEspecial(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Pai<input value={pai} onChange={(e) => setPai(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Mãe<input value={mae} onChange={(e) => setMae(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Responsável<input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Coordenação<input value={coordenacao} onChange={(e) => setCoordenacao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Regente<input value={professorRegente} onChange={(e) => setProfessorRegente(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Apoio<input value={profissionalApoio} onChange={(e) => setProfissionalApoio(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Professor AEE<input value={professorAee} onChange={(e) => setProfessorAee(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
        </div>

        <label className="block text-sm font-semibold">2. Dados relevantes sobre o aluno
          <textarea value={dadosRelevantes} onChange={(e) => setDadosRelevantes(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[100px]" placeholder="História de vida, laudo, medicamentos, trajetória escolar..." />
        </label>

        {Object.entries({
          percepcao: '3.1 Percepção',
          atencao: '3.2 Atenção / concentração',
          memoria: '3.3 Memória / abstração / generalização',
          linguagem: '3.4 Linguagem / comunicação',
          criatividade: '3.5 Criatividade',
          raciocinio: '3.6 Raciocínio lógico',
          psicomotor: '3.7 Aspectos psicomotores',
          autocuidado: '4.1 Autocuidado',
          autonomia: '4.2 Autonomia',
          habilidadesSociais: '4.3 Habilidades sociais',
          intervencoes: '6. Sugestões de intervenções',
        }).map(([k, label]) => (
          <label key={k} className="block text-sm font-semibold">
            {label}
            <textarea
              value={(campos as any)[k]}
              onChange={(e) => setCampos({ ...campos, [k]: e.target.value })}
              className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[70px]"
            />
          </label>
        ))}

        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 text-white px-5 py-2.5 text-sm font-bold">
          <Save size={16} /> Salvar relatório
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-6 text-sm text-slate-900 space-y-3 print:border-0">
        <div className="text-center border-b pb-3">
          <p className="text-xs font-semibold uppercase">Relatório Bimestral de Aprendizagem / Desenvolvimento</p>
          <p className="font-bold">Escola Municipal Dimas Nasser · Bom Jardim de Goiás</p>
          <p className="text-xs">Bimestre: {bimestre}º</p>
        </div>
        <p><strong>Aluno:</strong> {aluno?.nomeCompleto || '—'} · <strong>Nasc.:</strong> {aluno?.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '—'}</p>
        <p><strong>Série:</strong> {serieAno || '—'} · <strong>NEE:</strong> {necessidadeEspecial || '—'}</p>
        <p><strong>Pai:</strong> {pai || '—'} · <strong>Mãe:</strong> {mae || '—'} · <strong>Responsável:</strong> {responsavel || '—'}</p>
        <p><strong>Regente:</strong> {professorRegente || '—'} · <strong>Apoio:</strong> {profissionalApoio || '—'} · <strong>AEE:</strong> {professorAee || '—'}</p>
        <p><strong>Dados relevantes:</strong> {dadosRelevantes || '—'}</p>
        {Object.entries(campos).map(([k, v]) => (
          <p key={k}><strong className="capitalize">{k}:</strong> {v || '—'}</p>
        ))}
        <div className="grid sm:grid-cols-2 gap-8 pt-10 text-center text-xs">
          {['Professora Regente', 'Profissional de Apoio', 'Professor(a) do AEE', 'Coordenador(a) Pedagógico(a)', 'Diretor(a)'].map((a) => (
            <div key={a} className="border-t border-slate-800 pt-1 mx-4">{a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
