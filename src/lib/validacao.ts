/** Validações brasileiras para matrícula / cadastro escolar */

export function onlyDigits(v: string): string {
  return (v || '').replace(/\D/g, '');
}

/** CPF com dígitos verificadores */
export function isValidCpf(cpfRaw: string): boolean {
  const cpf = onlyDigits(cpfRaw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

export function formatCpf(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Telefone BR: 10 ou 11 dígitos */
export function isValidPhone(phoneRaw: string): boolean {
  const d = onlyDigits(phoneRaw);
  return d.length === 10 || d.length === 11;
}

export function formatPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatCep(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function isValidCep(cepRaw: string): boolean {
  const d = onlyDigits(cepRaw);
  return d.length === 0 || d.length === 8;
}

/** Idade em anos completos */
export function ageFromBirth(isoDate: string, ref = new Date()): number | null {
  if (!isoDate) return null;
  const b = new Date(isoDate + 'T12:00:00');
  if (Number.isNaN(b.getTime())) return null;
  let age = ref.getFullYear() - b.getFullYear();
  const m = ref.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) age--;
  return age;
}

export type MatriculaErrors = Record<string, string>;

export type MatriculaInput = {
  nome: string;
  dataNascimento: string;
  sexo: string;
  racaCor: string;
  nacionalidade: string;
  sus: string;
  certidaoNascimento: string;
  telefoneResponsavel: string;
  cpf?: string;
  cep?: string;
  estado?: string;
  deficiencia?: boolean;
  tipoDeficiencia?: string;
  maeNome?: string;
  paiNome?: string;
  respLegalNome?: string;
};

export function validateMatricula(input: MatriculaInput): MatriculaErrors {
  const e: MatriculaErrors = {};

  const nome = input.nome.trim();
  if (nome.length < 3) e.nome = 'Informe o nome completo (mín. 3 caracteres).';
  else if (nome.split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome.';

  if (!input.dataNascimento) e.dataNascimento = 'Data de nascimento obrigatória.';
  else {
    const age = ageFromBirth(input.dataNascimento);
    if (age === null) e.dataNascimento = 'Data inválida.';
    else if (age < 0) e.dataNascimento = 'Data não pode ser no futuro.';
    else if (age > 25) e.dataNascimento = 'Idade acima do esperado para educação básica (verifique a data).';
    else if (age < 1) e.dataNascimento = 'Aluno deve ter pelo menos 1 ano completo.';
  }

  if (!input.sexo) e.sexo = 'Selecione o sexo.';
  if (!input.racaCor) e.racaCor = 'Selecione a raça/cor.';
  if (!input.nacionalidade?.trim()) e.nacionalidade = 'Nacionalidade obrigatória.';

  const sus = onlyDigits(input.sus);
  if (sus.length < 15) e.sus = 'Cartão SUS deve ter 15 dígitos.';

  if (!input.certidaoNascimento?.trim() || input.certidaoNascimento.trim().length < 5) {
    e.certidaoNascimento = 'Informe nº / livro / folha da certidão.';
  }

  if (!isValidPhone(input.telefoneResponsavel)) {
    e.telefoneResponsavel = 'Telefone inválido. Use DDD + número (10 ou 11 dígitos).';
  }

  if (input.cpf && onlyDigits(input.cpf).length > 0 && !isValidCpf(input.cpf)) {
    e.cpf = 'CPF inválido.';
  }

  if (input.cep && !isValidCep(input.cep)) {
    e.cep = 'CEP deve ter 8 dígitos.';
  }

  if (input.estado && input.estado.trim() && input.estado.trim().length !== 2) {
    e.estado = 'UF com 2 letras (ex.: GO).';
  }

  if (input.deficiencia && !input.tipoDeficiencia?.trim()) {
    e.tipoDeficiencia = 'Informe o tipo de deficiência.';
  }

  const temResp =
    Boolean(input.maeNome?.trim()) ||
    Boolean(input.paiNome?.trim()) ||
    Boolean(input.respLegalNome?.trim());
  if (!temResp) {
    e.responsaveis = 'Informe ao menos um responsável (mãe, pai ou responsável legal).';
  }

  return e;
}
