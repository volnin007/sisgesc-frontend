'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart3, Download, Printer } from 'lucide-react';

function downloadCsv(filename: string, rows: string[][]) {
  const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = rows.map((r) => r.map(esc).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CensoPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/censo/resumo')
      .then((r) => setData(r.data))
      .catch(() => setErr('Não foi possível carregar o resumo do censo. Faça login e tente de novo.'));
  }, []);

  function exportarCsv() {
    if (!data) return;
    const t = data.totais || {};
    const rows: string[][] = [
      ['INDICADOR', 'VALOR'],
      ['Escola', data.escola || ''],
      ['Gerado em', data.geradoEm || ''],
      ['Alunos cadastrados', String(t.alunosCadastrados ?? 0)],
      ['Matrículas ativas', String(t.matriculasAtivas ?? 0)],
      ['Turmas', String(t.turmas ?? 0)],
      ['Professores', String(t.professores ?? 0)],
      ['PcD', String(t.pcd ?? 0)],
      ['Transporte escolar', String(t.transporteEscolar ?? 0)],
      ['Bolsa Família', String(t.bolsaFamilia ?? 0)],
      [],
      ['POR SEXO', 'QUANTIDADE'],
      ...Object.entries(data.porSexo || {}).map(([k, v]) => [k, String(v)]),
      [],
      ['POR RAÇA/COR', 'QUANTIDADE'],
      ...Object.entries(data.porRacaCor || {}).map(([k, v]) => [k, String(v)]),
      [],
      ['POR ZONA', 'QUANTIDADE'],
      ...Object.entries(data.porZona || {}).map(([k, v]) => [k, String(v)]),
      [],
      ['POR ETAPA', 'QUANTIDADE'],
      ...Object.entries(data.porEtapa || {}).map(([k, v]) => [k, String(v)]),
      [],
      ['TURMA', 'ETAPA', 'TURNO', 'MATRICULADOS', 'CAPACIDADE'],
      ...(data.turmas || []).map((x: any) => [
        x.nome,
        x.etapa,
        x.turno,
        String(x.matriculados),
        String(x.capacidade),
      ]),
    ];
    downloadCsv(`censo-dimas-nasser-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  if (err) return <p className="text-red-700 font-medium">{err}</p>;
  if (!data) return <p className="text-slate-700">Carregando indicadores do Censo Escolar...</p>;

  const t = data.totais || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Censo Escolar</h1>
            <p className="text-sm text-slate-700 font-medium">
              Painel agregado · {data.escola} · apoio ao Educacenso
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <button
            type="button"
            onClick={exportarCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 text-white px-4 py-2 text-sm font-bold"
          >
            <Download size={16} /> Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"
          >
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card title="Alunos cadastrados" value={t.alunosCadastrados} />
        <Card title="Matrículas ativas" value={t.matriculasAtivas} />
        <Card title="Turmas" value={t.turmas} />
        <Card title="Professores" value={t.professores} />
        <Card title="PcD" value={t.pcd} />
        <Card title="Transporte escolar" value={t.transporteEscolar} />
        <Card title="Bolsa Família" value={t.bolsaFamilia} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Block title="Por sexo" obj={data.porSexo} />
        <Block title="Por raça/cor" obj={data.porRacaCor} />
        <Block title="Por zona" obj={data.porZona} />
        <Block title="Por etapa" obj={data.porEtapa} />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-bold text-slate-900">Turmas (ocupação)</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2 font-bold">Turma</th>
              <th className="px-4 py-2 font-bold">Etapa</th>
              <th className="px-4 py-2 font-bold">Turno</th>
              <th className="px-4 py-2 font-bold">Matriculados</th>
              <th className="px-4 py-2 font-bold">Capacidade</th>
            </tr>
          </thead>
          <tbody>
            {(data.turmas || []).map((x: any) => (
              <tr key={x.id} className="border-t">
                <td className="px-4 py-2 font-medium">{x.nome}</td>
                <td className="px-4 py-2">{x.etapa}</td>
                <td className="px-4 py-2">{x.turno}</td>
                <td className="px-4 py-2">{x.matriculados}</td>
                <td className="px-4 py-2">{x.capacidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Gerado em {new Date(data.geradoEm).toLocaleString('pt-BR')} · CSV com separador “;” compatível com Excel BR.
      </p>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value ?? 0}</p>
    </div>
  );
}

function Block({ title, obj }: { title: string; obj: Record<string, number> }) {
  const entries = Object.entries(obj || {});
  return (
    <div className="bg-white rounded-2xl border p-4 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-3">{title}</h3>
      {entries.length === 0 && <p className="text-sm text-slate-500">Sem dados</p>}
      <ul className="space-y-1.5">
        {entries.map(([k, v]) => (
          <li key={k} className="flex justify-between text-sm border-b border-slate-100 pb-1">
            <span className="font-medium text-slate-800">{k}</span>
            <span className="font-bold text-slate-900">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
