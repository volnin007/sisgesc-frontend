'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [stats, setStats] = useState({ alunos: 0, turmas: 0, infantil: 0, fund1: 0, fund2: 0 });

  useEffect(() => {
    api.get('/turmas').then(r => {
      setTurmas(r.data);
      const alunos = r.data.reduce((acc: number, t: any) => acc + (t.ocupacao || 0), 0);
      setStats({
        alunos,
        turmas: r.data.length,
        infantil: r.data.filter((t: any) => t.etapa === 'INFANTIL').length,
        fund1: r.data.filter((t: any) => t.etapa === 'FUND1').length,
        fund2: r.data.filter((t: any) => t.etapa === 'FUND2').length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard - Escola Municipal Dimas Nasser</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Total Alunos</p><p className="text-3xl font-bold">{stats.alunos}</p></div>
        <div className="bg-white p-5 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Turmas</p><p className="text-3xl font-bold">{stats.turmas}</p><p className="text-xs mt-1">{stats.infantil} Infantil | {stats.fund1} Fund I | {stats.fund2} Fund II</p></div>
        <div className="bg-white p-5 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Frequência Média</p><p className="text-3xl font-bold text-green-600">—</p></div>
        <div className="bg-white p-5 rounded-xl shadow-sm border"><p className="text-sm text-gray-500">Alertas</p><p className="text-sm mt-1">• Busca Ativa<br/>• Censo</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Turmas - Pré-Escola ao 9º Ano</h3>
        <div className="grid grid-cols-3 gap-3">
          {turmas.map((t: any) => (
            <div key={t.id} className="border rounded-lg p-4 hover:shadow-md">
              <div className="flex justify-between"><span className="font-bold">{t.nome}</span><span className={`text-xs px-2 py-1 rounded ${t.etapa === 'INFANTIL' ? 'bg-purple-100 text-purple-700' : t.etapa === 'FUND1' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{t.etapa}</span></div>
              <p className="text-sm text-gray-500 mt-1">{t.turno} - {t.anoSerie} - {t.ocupacao || 0}/{t.capacidadeMax} alunos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
