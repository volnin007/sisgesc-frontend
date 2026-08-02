'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  ScrollText,
  Search,
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

type LogItem = {
  id: number;
  nivel: string;
  origem: string | null;
  mensagem: string;
  stack: string | null;
  usuarioId: number | null;
  metadata: any;
  createdAt: string;
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [resumo, setResumo] = useState<{ total: number; porNivel: { nivel: string; total: number }[] }>({
    total: 0,
    porNivel: [],
  });
  const [nivel, setNivel] = useState('');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 150 };
      if (nivel) params.nivel = nivel;
      if (busca) params.busca = busca;
      const [rLogs, rResumo] = await Promise.all([
        api.get('/logs', { params }),
        api.get('/logs/resumo'),
      ]);
      setLogs(rLogs.data || []);
      setResumo(rResumo.data || { total: 0, porNivel: [] });
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const limparAntigos = async () => {
    if (!confirm('Remover logs com mais de 30 dias? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete('/logs', { params: { dias: 30 } });
      carregar();
    } catch {
      alert('Erro ao limpar logs');
    }
  };

  const nivelColor = (n: string) => {
    switch (n?.toUpperCase()) {
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WARN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const nivelIcon = (n: string) => {
    switch (n?.toUpperCase()) {
      case 'ERROR':
        return <AlertCircle size={14} className="text-red-600" />;
      case 'WARN':
        return <AlertTriangle size={14} className="text-amber-600" />;
      default:
        return <Info size={14} className="text-blue-600" />;
    }
  };

  const countNivel = (n: string) =>
    resumo.porNivel.find((p) => p.nivel === n)?.total || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ScrollText className="text-cyan-600" /> Auditoria de Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro de erros e eventos do sistema. Útil para diagnóstico e suporte.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={carregar}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
          <button
            onClick={limparAntigos}
            className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-50"
          >
            <Trash2 size={16} /> Limpar &gt;30 dias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total de logs</p>
          <p className="text-2xl font-bold text-gray-900">{resumo.total}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Errors</p>
          <p className="text-2xl font-bold text-red-600">{countNivel('ERROR')}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500">Warnings</p>
          <p className="text-2xl font-bold text-amber-600">{countNivel('WARN')}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Info</p>
          <p className="text-2xl font-bold text-blue-600">{countNivel('INFO')}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-gray-400" />
          <input
            placeholder="Buscar mensagem, origem ou stack..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && carregar()}
            className="border rounded-lg px-3 py-2 text-sm w-full max-w-md text-slate-900"
          />
        </div>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-slate-900"
        >
          <option value="">Todos os níveis</option>
          <option value="ERROR">ERROR</option>
          <option value="WARN">WARN</option>
          <option value="INFO">INFO</option>
          <option value="DEBUG">DEBUG</option>
        </select>
        <button
          onClick={carregar}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
        >
          Filtrar
        </button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {logs.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-400 text-sm">
            Nenhum log encontrado. Os erros do sistema aparecerão aqui automaticamente.
          </div>
        )}
        <ul className="divide-y">
          {logs.map((log) => (
            <li key={log.id} className="hover:bg-gray-50/80">
              <button
                type="button"
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                className="w-full text-left p-4 flex gap-3 items-start"
              >
                <div className="mt-0.5">{nivelIcon(log.nivel)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${nivelColor(log.nivel)}`}
                    >
                      {log.nivel}
                    </span>
                    <span className="text-xs text-gray-500 font-mono truncate max-w-[280px]">
                      {log.origem || '—'}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-auto">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString('pt-BR')
                        : '—'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2">{log.mensagem}</p>
                </div>
                <div className="text-gray-400">
                  {expanded === log.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>
              {expanded === log.id && (
                <div className="px-4 pb-4 pl-12 space-y-2">
                  {log.stack && (
                    <pre className="text-[11px] bg-gray-900 text-green-300 p-3 rounded-lg overflow-x-auto max-h-48 whitespace-pre-wrap font-mono">
                      {log.stack}
                    </pre>
                  )}
                  {log.metadata && (
                    <pre className="text-[11px] bg-gray-100 text-gray-700 p-3 rounded-lg overflow-x-auto max-h-32 whitespace-pre-wrap font-mono">
                      {typeof log.metadata === 'string'
                        ? log.metadata
                        : JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                  {log.usuarioId && (
                    <p className="text-xs text-gray-500">Usuário ID: {log.usuarioId}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
