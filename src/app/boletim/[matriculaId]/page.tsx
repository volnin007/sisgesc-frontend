'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function BoletimPage({ params }: { params: { matriculaId: string } }) {
  const [dados, setDados] = useState<any>(null);
  const [id, setId] = useState(params.matriculaId);

  useEffect(() => {
    if (id) api.get(`/notas/boletim/${id}`).then(r => setDados(r.data)).catch(() => {});
  }, [id]);

  if (!dados) return <div className="p-8">Carregando... Digite a matrícula ID<br /><input value={id} onChange={e => setId(e.target.value)} className="border p-2 rounded mt-2" /></div>;

  const isInfantil = dados.tipo === 'INFANTIL';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Boletim - {dados.matricula?.aluno?.nomeCompleto} - {dados.matricula?.turma?.nome}</h1>
      {isInfantil ? (
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-semibold">Avaliação Infantil - Campos de Experiência (BNCC)</h3>
          <table className="w-full mt-4 text-sm"><thead className="bg-gray-50"><tr><th className="p-2 text-left">Campo</th><th>Bim</th><th>Conceito</th></tr></thead>
          <tbody>{(dados.avaliacoes || []).map((a: any, i: number) => <tr key={i} className="border-t"><td className="p-2">{a.campoExperiencia}</td><td>{a.bimestre}º</td><td>{a.conceito}</td></tr>)}</tbody></table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-semibold">Boletim Fundamental - Notas</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {(dados.medias || []).map((m: any) => <div key={m.disciplina} className="border p-3 rounded"><p className="font-bold">{m.disciplina}</p><p className="text-sm">Média: {m.media} - {m.situacao}</p></div>)}
          </div>
        </div>
      )}
    </div>
  );
}
