'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Users, GraduationCap, AlertTriangle, BookOpen, ClipboardList, UserPlus } from 'lucide-react';

export default function Dashboard() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [infreq, setInfreq] = useState<any[]>([]);
  const [stats, setStats] = useState({ alunos: 0, turmas: 0, infantil: 0, fund1: 0, fund2: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/turmas').catch(() => ({ data: [] })),
      api.get('/frequencias/relatorio/infrequencia?percentualMax=75').catch(() => ({ data: [] })),
    ]).then(([tRes, iRes]) => {
      const t = tRes.data || [];
      setTurmas(t);
      setInfreq(Array.isArray(iRes.data) ? iRes.data.slice(0, 5) : []);
      setStats({
        alunos: t.reduce((acc: number, x: any) => acc + (x.ocupacao || 0), 0),
        turmas: t.length,
        infantil: t.filter((x: any) => x.etapa === 'INFANTIL').length,
        fund1: t.filter((x: any) => x.etapa === 'FUND1').length,
        fund2: t.filter((x: any) => x.etapa === 'FUND2').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Escola Municipal Dimas Nasser · visão geral operacional</p>
        </div>
        <Link
          href="/matricula"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
        >
          <UserPlus size={16} /> Nova matrícula
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
            <Users size={14} /> Matrículas ativas
          </div>
          <p className="text-3xl font-black text-gray-900">{loading ? '—' : stats.alunos}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
            <GraduationCap size={14} /> Turmas
          </div>
          <p className="text-3xl font-black text-gray-900">{loading ? '—' : stats.turmas}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {stats.infantil} Inf · {stats.fund1} Fund I · {stats.fund2} Fund II
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
            <AlertTriangle size={14} /> Busca Ativa
          </div>
          <p className="text-3xl font-black text-amber-600">{loading ? '—' : infreq.length}</p>
          <p className="text-[11px] text-gray-400 mt-1">alunos &lt; 75% frequência</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
            <BookOpen size={14} /> Atalhos
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <Link href="/alunos" className="text-xs text-cyan-700 hover:underline flex items-center gap-1">
              <ClipboardList size={12} /> Fichas de alunos
            </Link>
            <Link href="/diario" className="text-xs text-cyan-700 hover:underline">Diário de classe</Link>
            <Link href="/ia-duvidas" className="text-xs text-cyan-700 hover:underline">IA Dúvidas</Link>
          </div>
        </div>
      </div>

      {infreq.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Alertas de infrequência (Busca Ativa)
          </h3>
          <div className="space-y-2">
            {infreq.map((r: any) => (
              <div key={r.matriculaId} className="flex justify-between text-sm bg-white/70 rounded-lg px-3 py-2">
                <span className="font-medium text-gray-800">{r.aluno}</span>
                <span className="text-amber-700 font-bold">{r.percentual}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold mb-4">Turmas · Pré-Escola ao 9º Ano</h3>
        {loading && <p className="text-sm text-gray-400">Carregando...</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {turmas.map((t: any) => (
            <div key={t.id} className="border rounded-xl p-4 hover:shadow-md transition bg-gray-50/50">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-gray-900">{t.nome}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    t.etapa === 'INFANTIL'
                      ? 'bg-purple-100 text-purple-700'
                      : t.etapa === 'FUND1'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {t.etapa}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.turno} · {t.anoSerie}</p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                  <span>{t.ocupacao || 0}/{t.capacidadeMax} alunos</span>
                  <span>{t.vagas ?? t.capacidadeMax - (t.ocupacao || 0)} vagas</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-green-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, ((t.ocupacao || 0) / (t.capacidadeMax || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
