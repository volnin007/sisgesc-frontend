import { api } from '@/lib/api';
import { formatCep, onlyDigits } from '@/lib/validacao';

export type CepResult = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  ibge?: string;
  ddd?: string;
  /** Origem da consulta: ViaCEP (prioritário) ou BrasilAPI (fallback). */
  fonte?: 'viacep' | 'brasilapi';
};

/** Consulta CEP via API SISGESC (ViaCEP + fallback BrasilAPI). */
export async function consultarCep(cepRaw: string): Promise<CepResult> {
  const digits = onlyDigits(cepRaw);
  if (digits.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos.');
  }
  const { data } = await api.get(`/cep/${digits}`);
  return data as CepResult;
}

export { formatCep, onlyDigits };
