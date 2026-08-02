'use client';
import { useState } from 'react';
import { consultarCep } from '@/lib/cep';
import { formatCep, onlyDigits } from '@/lib/validacao';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onAddress?: (a: {
    logradouro?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  }) => void;
  onError?: (msg: string | null) => void;
  className?: string;
  error?: string;
};

/** Campo CEP com consulta automática ao sair (blur) com 8 dígitos. */
export function CepInput({ value, onChange, onAddress, onError, className, error }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleBlur() {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return;
    setLoading(true);
    onError?.(null);
    try {
      const data = await consultarCep(digits);
      onAddress?.({
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.error || e?.message || 'CEP não encontrado. Verifique os dígitos.';
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <input
        value={value}
        inputMode="numeric"
        onChange={(e) => onChange(formatCep(e.target.value))}
        onBlur={handleBlur}
        className={className}
        placeholder="00000-000"
        disabled={loading}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyan-700 font-semibold">
          buscando...
        </span>
      )}
      {error && <span className="mt-1 block text-[11px] text-red-600 font-medium">{error}</span>}
    </div>
  );
}
