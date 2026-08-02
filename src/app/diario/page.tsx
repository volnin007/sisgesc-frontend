'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Download, Printer, Save } from 'lucide-react';

type ChamadaRow = {
  ordem: number;
  matriculaId: number;
  numeroMatricula: string;
  aluno: string;
  presente: boolean | null;
  justificativa: string | null;
};

export default function DiarioPage() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [turmaId, setTurmaId] = useState('');
  const [dataAula, setDataAula] = useState(new Date().toISOString().slice(0, 10));
  const [disciplina, setDisciplina] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [metodologia, setMetodologia] = useState('');
  const [chamada, setChamada] = useState<ChamadaRow[]>([]);
  const [turmaInfo, setTurmaInfo] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data || [])).catch(() => {});
  }, []);

  const carregar = async () => {
    if (!turmaId) {
      setErr('Selecione a turma.');
      return;
    }
    setLoading(true);
    setErr('');
    setMsg('');
    try {
      const { data } = await api.get('/diario/completo', {
        params: { turmaId, dataAula, disciplina },
      });
      setTurmaInfo(data.turma);
      setChamada(
        (data.chamada || []).map((c: ChamadaRow) => ({
          ...c,
          presente: c.presente === null ? true : c.presente,
        })),
      );
      if (data.conteudo) {
        setConteudo(data.conteudo.conteudo || '');
        setObjetivos(data.conteudo.objetivosBncc || '');
        setMetodologia(data.conteudo.metodologia || '');
      } else {
        setConteudo('');
        setObjetivos('');
        setMetodologia('');
      }
      setMsg('Diário carregado.');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Não foi possível carregar o diário.');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    if (!turmaId) return setErr('Selecione a turma.');
    if (conteudo.trim().length < 3) return setErr('Descreva o conteúdo ministrado.');
    setSaving(true);
    setErr('');
    try {
      await api.post('/diario/completo', {
        turmaId: Number(turmaId),
        dataAula,
        disciplina,
        conteudo,
        objetivosBncc: objetivos || undefined,
        metodologia: metodologia || undefined,
        presencas: chamada.map((c) => ({
          matriculaId: c.matriculaId,
          presente: Boolean(c.presente),
          justificativa: c.justificativa || undefined,
        })),
      });
      setMsg('Diário salvo com sucesso.');
      await carregar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha ao salvar o diário.');
    } finally {
      setSaving(false);
    }
  };

  const presentes = chamada.filter((c) => c.presente).length;
  const ausentes = chamada.filter((c) => !c.presente).length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Diário de Classe</h1>
            <p className="text-sm text-slate-700 font-medium">Conteúdo · chamada · assinaturas · impressão</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold text-slate-800">
            <Printer size={16} /> Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm no-print">
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm font-semibold text-slate-800">
            Turma *
            <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5">
              <option value="">Selecione...</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome} · {t.turno}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Data da aula *
            <input type="date" value={dataAula} onChange={(e) => setDataAula(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Disciplina (6º–9º)
            <input value={disciplina} onChange={(e) => setDisciplina(e.target.value)} placeholder="Ex.: Matemática" className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5" />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={carregar} disabled={loading} className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-bold disabled:opacity-60">
            {loading ? 'Carregando...' : 'Carregar diário / chamada'}
          </button>
          <button type="button" onClick={salvar} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold disabled:opacity-60">
            <Save size={16} /> {saving ? 'Salvando...' : 'Salvar diário completo'}
          </button>
        </div>
        {err && <p className="text-sm text-red-700 font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">{msg}</p>}
      </div>

      {/* Área impressão / visual oficial */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden print:shadow-none print:border-0">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white text-slate-900 flex items-center justify-center text-xs font-black">DN</div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-300 font-semibold">Diário de classe oficial</p>
            <h2 className="text-lg font-bold">Escola Municipal Dimas Nasser</h2>
            <p className="text-xs text-slate-300">SISGESC · Volnin Tech Hacker</p>
          </div>
        </div>

        <div className="p-5 space-y-5 text-slate-900">
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <p><span className="font-bold">Turma:</span> {turmaInfo?.nome || '—'}</p>
            <p><span className="font-bold">Turno:</span> {turmaInfo?.turno || '—'}</p>
            <p><span className="font-bold">Data:</span> {dataAula ? new Date(dataAula + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
            <p><span className="font-bold">Etapa/série:</span> {turmaInfo ? `${turmaInfo.etapa} · ${turmaInfo.anoSerie}` : '—'}</p>
            <p><span className="font-bold">Disciplina:</span> {disciplina || 'Regência / Infantil'}</p>
            <p><span className="font-bold">Presenças:</span> {presentes} · <span className="font-bold">Faltas:</span> {ausentes}</p>
          </div>

          <div className="space-y-2 no-print">
            <label className="block text-sm font-bold text-slate-900">Conteúdo ministrado *</label>
            <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 min-h-[100px] text-slate-900" placeholder="Descreva o conteúdo da aula..." />
            <label className="block text-sm font-bold text-slate-900">Objetivos BNCC</label>
            <input value={objetivos} onChange={(e) => setObjetivos(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 text-slate-900" placeholder="Ex.: EF06MA01 · EI03EO01" />
            <label className="block text-sm font-bold text-slate-900">Metodologia / recursos</label>
            <textarea value={metodologia} onChange={(e) => setMetodologia(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 min-h-[70px] text-slate-900" />
          </div>

          <div className="hidden print:block text-sm space-y-1">
            <p><span className="font-bold">Conteúdo:</span> {conteudo || '—'}</p>
            <p><span className="font-bold">BNCC:</span> {objetivos || '—'}</p>
            <p><span className="font-bold">Metodologia:</span> {metodologia || '—'}</p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-2 border-b border-slate-200 pb-1">Lista de chamada</h3>
            {chamada.length === 0 ? (
              <p className="text-sm text-slate-600">Carregue a turma para exibir os alunos.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-left">
                    <th className="border border-slate-300 px-2 py-1.5 w-10">Nº</th>
                    <th className="border border-slate-300 px-2 py-1.5">Aluno</th>
                    <th className="border border-slate-300 px-2 py-1.5 w-24 text-center">P</th>
                    <th className="border border-slate-300 px-2 py-1.5 w-24 text-center">F</th>
                    <th className="border border-slate-300 px-2 py-1.5">Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {chamada.map((c, i) => (
                    <tr key={c.matriculaId}>
                      <td className="border border-slate-300 px-2 py-1 text-center">{c.ordem || i + 1}</td>
                      <td className="border border-slate-300 px-2 py-1 font-medium">{c.aluno}</td>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        <input
                          type="radio"
                          name={`p-${c.matriculaId}`}
                          checked={c.presente === true}
                          onChange={() =>
                            setChamada((prev) =>
                              prev.map((x) => (x.matriculaId === c.matriculaId ? { ...x, presente: true } : x)),
                            )
                          }
                          className="no-print"
                        />
                        <span className="hidden print:inline">{c.presente ? '✓' : ''}</span>
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-center">
                        <input
                          type="radio"
                          name={`p-${c.matriculaId}`}
                          checked={c.presente === false}
                          onChange={() =>
                            setChamada((prev) =>
                              prev.map((x) => (x.matriculaId === c.matriculaId ? { ...x, presente: false } : x)),
                            )
                          }
                          className="no-print"
                        />
                        <span className="hidden print:inline">{!c.presente ? 'F' : ''}</span>
                      </td>
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          value={c.justificativa || ''}
                          onChange={(e) =>
                            setChamada((prev) =>
                              prev.map((x) =>
                                x.matriculaId === c.matriculaId ? { ...x, justificativa: e.target.value } : x,
                              ),
                            )
                          }
                          className="w-full border-0 bg-transparent text-sm no-print"
                          placeholder="—"
                        />
                        <span className="hidden print:inline">{c.justificativa || ''}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Assinaturas */}
          <div className="grid sm:grid-cols-2 gap-8 pt-10 mt-6">
            <div className="text-center">
              <div className="border-t border-slate-800 pt-2 mx-4">
                <p className="text-sm font-bold text-slate-900">Professor(a) responsável</p>
                <p className="text-xs text-slate-600">Assinatura e carimbo</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-800 pt-2 mx-4">
                <p className="text-sm font-bold text-slate-900">Coordenação / Direção</p>
                <p className="text-xs text-slate-600">Visto</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center pt-4">
            Documento gerado pelo SISGESC · Escola Municipal Dimas Nasser · Volnin Tech Hacker · (66) 93618-2776
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 no-print flex items-center gap-1">
        <Download size={12} /> Use <strong className="mx-1">Imprimir / PDF</strong> do navegador para baixar o diário assinado.
      </p>
    </div>
  );
}
