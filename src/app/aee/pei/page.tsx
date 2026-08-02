'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileText, Printer, Save } from 'lucide-react';

const NECESSIDADES = [
  'Deficiência Intelectual',
  'Transtorno do Espectro Autista',
  'Síndrome de Down',
  'Deficiência Múltipla',
  'Paralisia Cerebral',
  'TDAH',
  'Distúrbios de Aprendizagem',
  'Outro',
];

const DISCIPLINAS = [
  'Espanhol', 'Inglês', 'Matemática', 'Língua Portuguesa / Artes',
  'Geografia', 'Ciências', 'História', 'Educação Física', 'Ensino Religioso',
];

export default function PeiPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [serieAno, setSerieAno] = useState('');
  const [turmaTurno, setTurmaTurno] = useState('');
  const [necessidades, setNecessidades] = useState<string[]>([]);
  const [professorRegente, setProfessorRegente] = useState('');
  const [professorApoio, setProfessorApoio] = useState('');
  const [professorAee, setProfessorAee] = useState('');
  const [coordenacao, setCoordenacao] = useState('');
  const [diretoria, setDiretoria] = useState('');
  const [potencialidades, setPotencialidades] = useState({
    percepcao: '', atencao: '', linguagem: '', memoria: '', criatividade: '', psicomotor: '', raciocinio: '', adaptativo: '',
  });
  const [dificuldades, setDificuldades] = useState('');
  const [habilidadesAdaptativas, setHabilidadesAdaptativas] = useState('');
  const [componentes, setComponentes] = useState<Record<string, any>>(
    Object.fromEntries(DISCIPLINAS.map((d) => [d, { expectativas: '', conteudo: '', estrategias: '', avaliacao: '' }])),
  );
  const [recursos, setRecursos] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [atual, setAtual] = useState<any>(null);

  useEffect(() => {
    api.get('/alunos').then((r) => setAlunos(r.data || [])).catch(() => {});
    api.get('/aee/pei').then((r) => setLista(r.data || [])).catch(() => {});
  }, []);

  const toggleNec = (n: string) => {
    setNecessidades((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!alunoId) return setErr('Selecione o estudante.');
    try {
      const { data } = await api.post('/aee/pei', {
        alunoId: Number(alunoId),
        serieAno,
        turmaTurno,
        necessidades,
        professorRegente,
        professorApoio,
        professorAee,
        coordenacao,
        diretoria,
        potencialidades,
        dificuldades,
        habilidadesAdaptativas,
        componentes,
        recursos,
        status: 'SALVO',
      });
      setAtual(data);
      setMsg('PEI salvo. Use Imprimir / PDF para emitir o documento.');
      const list = await api.get('/aee/pei');
      setLista(list.data || []);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Erro ao salvar PEI.');
    }
  }

  const aluno = alunos.find((a) => String(a.id) === alunoId);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-800 flex items-center justify-center">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">PEI — Plano Educacional Individualizado</h1>
            <p className="text-sm text-slate-600">Modelo oficial · Dimas Nasser · Bom Jardim de Goiás</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold">
          <Printer size={16} /> Imprimir / PDF
        </button>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-2xl border p-5 space-y-4 shadow-sm no-print">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Estudante *
            <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5">
              <option value="">Selecione...</option>
              {alunos.map((a) => <option key={a.id} value={a.id}>{a.nomeCompleto}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Ano/série
            <input value={serieAno} onChange={(e) => setSerieAno(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Turma/turno
            <input value={turmaTurno} onChange={(e) => setTurmaTurno(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Professor(a) Regente
            <input value={professorRegente} onChange={(e) => setProfessorRegente(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Professor de Apoio
            <input value={professorApoio} onChange={(e) => setProfessorApoio(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Professor(a) AEE
            <input value={professorAee} onChange={(e) => setProfessorAee(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Coordenação
            <input value={coordenacao} onChange={(e) => setCoordenacao(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold">Direção
            <input value={diretoria} onChange={(e) => setDiretoria(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5" />
          </label>
        </div>

        <div>
          <p className="text-sm font-bold mb-2">Necessidade educacional especial</p>
          <div className="grid sm:grid-cols-2 gap-1.5 text-sm">
            {NECESSIDADES.map((n) => (
              <label key={n} className="flex items-center gap-2">
                <input type="checkbox" checked={necessidades.includes(n)} onChange={() => toggleNec(n)} /> {n}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold">Potencialidades (aspectos cognitivos)</p>
          {Object.entries({
            percepcao: 'Percepção',
            atencao: 'Atenção e concentração',
            linguagem: 'Linguagem/comunicação',
            memoria: 'Memória/abstração/generalização',
            criatividade: 'Criatividade',
            psicomotor: 'Aspectos psicomotores',
            raciocinio: 'Raciocínio lógico',
            adaptativo: 'Comportamento adaptativo',
          }).map(([k, label]) => (
            <label key={k} className="block text-sm font-semibold">
              {label}
              <textarea
                value={(potencialidades as any)[k]}
                onChange={(e) => setPotencialidades({ ...potencialidades, [k]: e.target.value })}
                className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[56px]"
              />
            </label>
          ))}
        </div>

        <label className="block text-sm font-semibold">Necessidades / dificuldades
          <textarea value={dificuldades} onChange={(e) => setDificuldades(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[70px]" />
        </label>
        <label className="block text-sm font-semibold">Habilidades adaptativas
          <textarea value={habilidadesAdaptativas} onChange={(e) => setHabilidadesAdaptativas(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[70px]" />
        </label>

        <div className="space-y-3">
          <p className="text-sm font-bold">Área acadêmica — flexibilizações por componente</p>
          {DISCIPLINAS.map((d) => (
            <details key={d} className="border rounded-xl p-3">
              <summary className="font-bold text-sm cursor-pointer">{d}</summary>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {['expectativas', 'conteudo', 'estrategias', 'avaliacao'].map((campo) => (
                  <label key={campo} className="text-xs font-semibold capitalize">
                    {campo}
                    <textarea
                      value={componentes[d]?.[campo] || ''}
                      onChange={(e) =>
                        setComponentes({
                          ...componentes,
                          [d]: { ...componentes[d], [campo]: e.target.value },
                        })
                      }
                      className="mt-1 w-full border rounded-lg px-2 py-1.5 min-h-[50px] text-sm"
                    />
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>

        <label className="block text-sm font-semibold">Livros, recursos e adaptações
          <textarea value={recursos} onChange={(e) => setRecursos(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 min-h-[70px]" />
        </label>

        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white px-5 py-2.5 text-sm font-bold">
          <Save size={16} /> Salvar PEI
        </button>
      </form>

      {/* Documento para impressão */}
      <div className="bg-white border rounded-2xl p-6 print:border-0 print:shadow-none text-slate-900 text-sm space-y-4">
        <div className="text-center border-b pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide">Secretaria Municipal de Educação</p>
          <p className="text-xs">Município: Bom Jardim de Goiás</p>
          <p className="font-bold">Escola Municipal Dimas Nasser</p>
          <h2 className="text-lg font-black mt-2">PLANO EDUCACIONAL INDIVIDUALIZADO — PEI</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <p><strong>Estudante:</strong> {aluno?.nomeCompleto || '—'}</p>
          <p><strong>Nascimento:</strong> {aluno?.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '—'}</p>
          <p><strong>Ano/série:</strong> {serieAno || '—'}</p>
          <p><strong>Turma/turno:</strong> {turmaTurno || '—'}</p>
          <p className="sm:col-span-2"><strong>Necessidades:</strong> {necessidades.join(', ') || '—'}</p>
          <p><strong>Regente:</strong> {professorRegente || '—'}</p>
          <p><strong>Apoio:</strong> {professorApoio || '—'}</p>
          <p><strong>AEE:</strong> {professorAee || '—'}</p>
          <p><strong>Coordenação:</strong> {coordenacao || '—'}</p>
        </div>
        <div>
          <p className="font-bold border-b mb-1">Potencialidades</p>
          {Object.entries(potencialidades).map(([k, v]) => (
            <p key={k} className="mb-1"><strong className="capitalize">{k}:</strong> {v || '—'}</p>
          ))}
        </div>
        <p><strong>Dificuldades:</strong> {dificuldades || '—'}</p>
        <p><strong>Habilidades adaptativas:</strong> {habilidadesAdaptativas || '—'}</p>
        <div>
          <p className="font-bold border-b mb-1">Flexibilizações curriculares</p>
          {DISCIPLINAS.map((d) => (
            <div key={d} className="mb-2">
              <p className="font-semibold">{d}</p>
              <p className="text-xs">Expectativas: {componentes[d]?.expectativas || '—'}</p>
              <p className="text-xs">Conteúdo: {componentes[d]?.conteudo || '—'}</p>
              <p className="text-xs">Estratégias: {componentes[d]?.estrategias || '—'}</p>
              <p className="text-xs">Avaliação: {componentes[d]?.avaliacao || '—'}</p>
            </div>
          ))}
        </div>
        <p><strong>Recursos:</strong> {recursos || '—'}</p>
        <div className="grid sm:grid-cols-2 gap-8 pt-10 text-center text-xs">
          {['Professor Regente', 'Professor de Apoio', 'Professor AEE', 'Coordenação Pedagógica', 'Diretor(a)'].map((a) => (
            <div key={a} className="border-t border-slate-800 pt-1 mx-4">{a}</div>
          ))}
        </div>
        <p className="text-[10px] text-center text-slate-500 pt-4">Local: Bom Jardim de Goiás — Data ____/____/______</p>
      </div>

      {lista.length > 0 && (
        <div className="no-print text-sm text-slate-600">
          PEIs salvos: {lista.length} · último ID {atual?.id || lista[0]?.id}
        </div>
      )}
    </div>
  );
}
