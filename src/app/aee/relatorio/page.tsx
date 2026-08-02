'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ClipboardList, Printer, Save, FolderOpen } from 'lucide-react';

const CAMPOS_LABELS: Record<string, string> = {
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
  intervencoes: '6. Sugestões de intervenções, atividades e procedimentos didáticos',
};

export default function RelatorioAeePage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
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

  const loadLista = () => api.get('/aee/relatorios').then((r) => setLista(r.data || [])).catch(() => {});

  useEffect(() => {
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
    loadLista();
  }, []);

  useEffect(() => {
    if (editId) return;
    const a = alunos.find((x) => String(x.id) === alunoId);
    if (!a) return;
    setMae(a.nomeMae || '');
    setNecessidadeEspecial(a.tipoDeficiencia || '');
    const mat = a.matriculas?.[0];
    if (mat?.turma) setSerieAno(mat.turma.anoSerie || mat.turma.nome || '');
    const resp = a.responsaveis?.find((r: any) => r.principal)?.responsavel || a.responsaveis?.[0]?.responsavel;
    if (resp?.nome) setResponsavel(resp.nome);
    const paiResp = a.responsaveis?.find((r: any) => r.responsavel?.parentesco === 'PAI')?.responsavel;
    if (paiResp?.nome) setPai(paiResp.nome);
  }, [alunoId, alunos]);

  function carregar(item: any) {
    setEditId(item.id);
    setAlunoId(String(item.alunoId));
    setBimestre(String(item.bimestre || '1'));
    setSerieAno(item.serieAno || '');
    setNecessidadeEspecial(item.necessidadeEspecial || '');
    setPai(item.pai || '');
    setMae(item.mae || '');
    setResponsavel(item.responsavel || '');
    setCoordenacao(item.coordenacao || '');
    setProfessorRegente(item.professorRegente || '');
    setProfissionalApoio(item.profissionalApoio || '');
    setProfessorAee(item.professorAee || '');
    setDadosRelevantes(item.dadosRelevantes || '');
    setCampos({
      percepcao: item.percepcao || '',
      atencao: item.atencao || '',
      memoria: item.memoria || '',
      linguagem: item.linguagem || '',
      criatividade: item.criatividade || '',
      raciocinio: item.raciocinio || '',
      psicomotor: item.psicomotor || '',
      autocuidado: item.autocuidado || '',
      autonomia: item.autonomia || '',
      habilidadesSociais: item.habilidadesSociais || '',
      intervencoes: item.intervencoes || '',
    });
    setMsg('Relatório carregado para edição/impressão.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!alunoId) return setErr('Selecione o aluno.');
    const payload = {
      alunoId: Number(alunoId),
      bimestre: Number(bimestre),
      serieAno,
      necessidadeEspecial,
      pai, mae, responsavel, coordenacao, professorRegente, profissionalApoio, professorAee,
      dadosRelevantes,
      ...campos,
      status: 'SALVO',
    };
    try {
      if (editId) {
        await api.put(`/aee/relatorios/${editId}`, payload);
        setMsg('Relatório atualizado. Use Imprimir / PDF.');
      } else {
        const { data } = await api.post('/aee/relatorios', payload);
        setEditId(data.id);
        setMsg('Relatório AEE salvo. Use Imprimir / PDF.');
      }
      loadLista();
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
            <p className="text-sm text-slate-600">Aprendizagem e desenvolvimento · Dimas Nasser · Bom Jardim de Goiás</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold bg-white">
          <Printer size={16} /> Imprimir / PDF
        </button>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-2xl border p-5 space-y-3 shadow-sm no-print">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm font-semibold sm:col-span-2">Aluno *
            <select value={alunoId} onChange={(e) => { setAlunoId(e.target.value); setEditId(null); }} className="mt-1 w-full border rounded-xl px-3 py-2.5">
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
          <label className="text-sm font-semibold sm:col-span-2">Necessidade Educacional Especial<input value={necessidadeEspecial} onChange={(e) => setNecessidadeEspecial(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" placeholder="TEA, DI, TDAH..." /></label>
          <label className="text-sm font-semibold">Pai<input value={pai} onChange={(e) => setPai(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Mãe<input value={mae} onChange={(e) => setMae(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Responsável<input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Coordenador(a) Pedagógico(a)<input value={coordenacao} onChange={(e) => setCoordenacao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Professor(a) Regente<input value={professorRegente} onChange={(e) => setProfessorRegente(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Profissional de apoio<input value={profissionalApoio} onChange={(e) => setProfissionalApoio(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
          <label className="text-sm font-semibold">Professor(a) do AEE<input value={professorAee} onChange={(e) => setProfessorAee(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" /></label>
        </div>

        <label className="block text-sm font-semibold">2. Dados relevantes sobre o aluno
          <textarea
            value={dadosRelevantes}
            onChange={(e) => setDadosRelevantes(e.target.value)}
            className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[110px]"
            placeholder="História de vida social/familiar, trajetória escolar, laudo/diagnóstico, medicamentos, acompanhamentos clínico-terapêuticos..."
          />
        </label>

        <p className="text-sm font-bold pt-1">3. Áreas de desenvolvimento psíquico / funções superiores</p>
        {Object.entries(CAMPOS_LABELS).map(([k, label]) => (
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
          <Save size={16} /> {editId ? 'Atualizar relatório' : 'Salvar relatório'}
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-6 text-sm text-slate-900 space-y-3 print:border-0 print:p-2">
        <div className="text-center border-b pb-3">
          <p className="text-xs font-semibold uppercase">Relatório Bimestral de Aprendizagem / Desenvolvimento</p>
          <p className="text-[11px]">Relatório Educacional Especializado · público-alvo da Educação Especial</p>
          <p className="font-bold mt-1">Escola Municipal Dimas Nasser · Bom Jardim de Goiás</p>
          <p className="text-xs mt-1">Série/Ano: {serieAno || '—'} · Bimestre: {bimestre}º</p>
        </div>

        <p className="font-bold border-b">1. Dados gerais</p>
        <p><strong>Nome do aluno:</strong> {aluno?.nomeCompleto || '—'}</p>
        <p><strong>Data de nascimento:</strong> {aluno?.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '—'}</p>
        <p><strong>Pai:</strong> {pai || '—'} · <strong>Mãe:</strong> {mae || '—'} · <strong>Responsável:</strong> {responsavel || '—'}</p>
        <p><strong>Necessidade Educacional Especial:</strong> {necessidadeEspecial || '—'}</p>
        <p><strong>Coordenador(a):</strong> {coordenacao || '—'} · <strong>Regente:</strong> {professorRegente || '—'} · <strong>Apoio:</strong> {profissionalApoio || '—'} · <strong>AEE:</strong> {professorAee || '—'}</p>

        <p className="font-bold border-b pt-2">2. Dados relevantes sobre o aluno</p>
        <p className="whitespace-pre-wrap">{dadosRelevantes || '—'}</p>

        <p className="font-bold border-b pt-2">3–4. Desenvolvimento e habilidades adaptativas</p>
        {Object.entries(campos).map(([k, v]) => (
          <div key={k} className="mb-2 break-inside-avoid">
            <p className="font-semibold">{CAMPOS_LABELS[k] || k}</p>
            <p className="whitespace-pre-wrap">{v || '—'}</p>
          </div>
        ))}

        <div className="grid sm:grid-cols-2 gap-10 pt-12 text-center text-xs">
          {['Professora Regente', 'Profissional de Apoio', 'Professor(a) do AEE', 'Coordenador(a) Pedagógico(a)', 'Diretor(a)'].map((a) => (
            <div key={a} className="border-t border-slate-900 pt-1 mx-4">{a}</div>
          ))}
        </div>
      </div>

      {lista.length > 0 && (
        <div className="no-print bg-white rounded-2xl border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
            <FolderOpen size={14} />
            <p className="text-sm font-bold">Relatórios salvos ({lista.length})</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-600">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Aluno</th>
                <th className="p-3">Bimestre</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{new Date(item.updatedAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 font-medium">{item.aluno?.nomeCompleto}</td>
                  <td className="p-3">{item.bimestre}º</td>
                  <td className="p-3 text-right">
                    <button type="button" onClick={() => carregar(item)} className="text-teal-700 font-semibold text-xs hover:underline">Abrir / Imprimir</button>
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
