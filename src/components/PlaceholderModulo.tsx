'use client';
import { Construction } from 'lucide-react';

export function PlaceholderModulo({
  titulo,
  descricao,
  grupo,
}: {
  titulo: string;
  descricao: string;
  grupo?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-700">
            <Construction size={22} />
          </div>
          <div>
            {grupo && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70">{grupo}</p>
            )}
            <h1 className="text-2xl font-black text-slate-900">{titulo}</h1>
            <p className="text-sm text-slate-700 mt-1">{descricao}</p>
            <p className="text-xs text-slate-500 mt-3">
              Módulo estruturado e liberado por permissão. As regras de negócio e fluxos detalhados
              serão implementados na próxima etapa, conforme sua orientação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
