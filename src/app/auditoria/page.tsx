'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { isAdminUser } from '@/lib/permissoes';
import { AlertTriangle, RefreshCw, Search, Trash2, FileWarning } from 'lucide-react';

type LogRow = {
  id: number;
  nivel: string;
  mensagem: string;
  stack?: string | null;
  modulo?: string | null;
  rota?: string | null;
  metodo?: string | null;
  status_code?: number | null;
  usuario_email?: string | null;
  created_at: string;
};

export default function AuditoriaLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [resumo, setResumo] = useState({ total: 0, erros: 0, warns: 0, infos: 0 });
  const [nivel, setNivel] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [expandId, setExpandId] = useState<number | null>(null);
  const admin = isAdminUser();

  const carregar = () => {
    setLoading(true);
    setErro('');
    const params: any = { limit: 150 };
    if (nivel) params.nivel = nivel;
    if (q) params.q = q;
    Promise.all([api.get('/logs', { params }), api.get('/logs/resumo')])
      .then(([rLogs, rResumo]) => {
        setLogs(Array.isArray(rLogs.data) ? rLogs.data : []);
        setResumo(rResumo.data || { total: 0, erros: 0, warns: 0, infos: 0 });
      })
      .catch(() => {
        setErro('Não foi possível carregar os logs. Verifique se a API está no ar.');
        setLogs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const limpar = async () => {
    if (!admin) return;
    if (!confirm('Apagar TODOS os logs do sistema? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete('/logs', { params: { tudo: '1' } });
      carregar();
    } catch {
      setErro('Falha ao limpar logs');
    }
  };

  const corNivel = (n: string) => {
    if (n === 'ERROR') return 'bg-red-100 text-red-800 border-red-200';
    if (n === 'WARN') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (n === 'INFO') return 'bg-sky-100 text-sky-800 border-sky-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
            <FileWarning size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Auditoria de Logs</h1>
            <p className="text-sm text-slate-500">Erros, avisos e eventos do sistema SISGESC</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={carregar} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <RefreshCw size={14} /> Atualizar
          </button>
          {admin && (
            <button type="button" onClick={limpar} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              <Trash2 size={14} /> Limpar tudo
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: resumo.total, color: 'text-slate-900' },
          { label: 'Erros', value: resumo.erros, color: 'text-red-700' },
          { label: 'Avisos', value: resumo.warns, color: 'text-amber-700' },
          { label: 'Info', value: resumo.infos, color: 'text-sky-700' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && carregar()} placeholder="Buscar mensagem, rota ou e-mail..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 text-slate-900" />
        </div>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900">
          <option value="">Todos os níveis</option>
          <option value="ERROR">ERROR</option>
          <option value="WARN">WARN</option>
          <option value="INFO">INFO</option>
        </select>
        <button type="button" onClick={carregar} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} /> {erro}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Nível</th>
                <th className="px-4 py-3 font-medium">Mensagem</th>
                <th className="px-4 py-3 font-medium">Rota</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Carregando logs...</td></tr>
              )}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Nenhum log registrado ainda.</td></tr>
              )}
              {!loading && logs.map((log) => (
                <>
                  <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50/80 cursor-pointer" onClick={() => setExpandId(expandId === log.id ? null : log.id)}>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${corNivel(log.nivel)}`}>{log.nivel}</span></td>
                    <td className="px-4 py-3 text-slate-800 max-w-md truncate font-medium">{log.mensagem}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{log.metodo || ''} {log.rota || '—'}{log.status_code ? ` · ${log.status_code}` : ''}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.usuario_email || '—'}</td>
                  </tr>
                  {expandId === log.id && log.stack && (
                    <tr key={`${log.id}-stack`} className="border-t border-slate-50 bg-slate-50">
                      <td colSpan={5} className="px-4 py-3">
                        <pre className="text-[11px] text-slate-700 whitespace-pre-wrap break-all max-h-48 overflow-auto font-mono">{log.stack}</pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
