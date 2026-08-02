'use client';
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  formatCep,
  formatCpf,
  formatPhone,
  onlyDigits,
  validateMatricula,
  type MatriculaErrors,
} from '@/lib/validacao';
import { Camera, CheckCircle2, ChevronDown, FileText, Save, Upload, X } from 'lucide-react';

type Responsavel = {
  nome: string;
  rg: string;
  cpf: string;
  telefone: string;
  parentesco: 'MAE' | 'PAI' | 'RESPONSAVEL_LEGAL' | 'OUTRO';
  principal?: boolean;
};

type DocSlot = {
  tipo: 'CERTIDAO' | 'TIPAGEM' | 'HISTORICO' | 'UNIDADE_CONSUMIDORA' | 'COMPROVANTE_ENDERECO';
  label: string;
  hint: string;
  nomeArquivo?: string;
  mimeType?: string;
  conteudo?: string;
};

const RACAS = ['BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA', 'NAO_DECLARADA'];

const emptyResp = (parentesco: Responsavel['parentesco']): Responsavel => ({
  nome: '',
  rg: '',
  cpf: '',
  telefone: '',
  parentesco,
  principal: parentesco === 'MAE' || parentesco === 'RESPONSAVEL_LEGAL',
});

const DOC_SLOTS_INIT: DocSlot[] = [
  { tipo: 'CERTIDAO', label: 'Cópia da certidão de nascimento', hint: 'PDF ou imagem · recomendado' },
  { tipo: 'TIPAGEM', label: 'Tipagem sanguínea / fator RH', hint: 'Lei 4.067/2019 · opcional' },
  { tipo: 'HISTORICO', label: 'Histórico escolar', hint: 'Transferência / origem · opcional' },
  { tipo: 'COMPROVANTE_ENDERECO', label: 'Comprovante de endereço', hint: 'Conta de luz, água ou declaração' },
  { tipo: 'UNIDADE_CONSUMIDORA', label: 'Unidade consumidora (energia)', hint: 'Obrigatório se transporte escolar rural' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

async function processarFoto3x4(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const targetW = 300;
        const targetH = 400;
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas'));
        const srcRatio = img.width / img.height;
        const dstRatio = 3 / 4;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (srcRatio > dstRatio) {
          sw = img.height * dstRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / dstRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler'));
    reader.readAsDataURL(file);
  });
}

export default function MatriculaPage() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<any[]>([]);
  const [openOptional, setOpenOptional] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<MatriculaErrors>({});
  const [message, setMessage] = useState('');

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('MASCULINO');
  const [racaCor, setRacaCor] = useState('PARDA');
  const [nacionalidade, setNacionalidade] = useState('Brasileira');
  const [sus, setSus] = useState('');
  const [moradia, setMoradia] = useState<'URBANA' | 'RURAL'>('URBANA');
  const [certidaoNascimento, setCertidaoNascimento] = useState('');
  const [telefoneResponsavel, setTelefoneResponsavel] = useState('');
  const [cpf, setCpf] = useState('');
  const [nis, setNis] = useState('');
  const [tipoSanguineo, setTipoSanguineo] = useState('');
  const [fatorRh, setFatorRh] = useState('');
  const [naturalidade, setNaturalidade] = useState('');
  const [historicoEscolarOrigem, setHistoricoEscolarOrigem] = useState('');
  const [transporteEscolar, setTransporteEscolar] = useState(false);
  const [nomePropriedadeRural, setNomePropriedadeRural] = useState('');
  const [bolsaFamilia, setBolsaFamilia] = useState(false);
  const [deficiencia, setDeficiencia] = useState(false);
  const [tipoDeficiencia, setTipoDeficiencia] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('GO');
  const [cep, setCep] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [mae, setMae] = useState(emptyResp('MAE'));
  const [pai, setPai] = useState(emptyResp('PAI'));
  const [respLegal, setRespLegal] = useState(emptyResp('RESPONSAVEL_LEGAL'));
  const [turmaId, setTurmaId] = useState('');
  const [docs, setDocs] = useState<DocSlot[]>(DOC_SLOTS_INIT);

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data)).catch(() => {});
  }, []);

  function clearFieldError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onFoto(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('A foto 3×4 deve ser uma imagem (JPG/PNG).');
      return;
    }
    if (file.size > 5_000_000) {
      setError('Foto original muito grande. Use imagem menor que 5MB.');
      return;
    }
    try {
      setFotoUrl(await processarFoto3x4(file));
      setError('');
    } catch {
      setError('Não foi possível processar a foto 3x4.');
    }
  }

  async function onDoc(tipo: DocSlot['tipo'], file?: File | null) {
    if (!file) return;
    const okMime =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');
    if (!okMime) {
      setError('Anexo deve ser PDF ou imagem.');
      return;
    }
    if (file.size > 900_000) {
      setError(`Arquivo "${file.name}" muito grande. Máximo ~900KB.`);
      return;
    }
    try {
      const conteudo = await fileToBase64(file);
      setDocs((prev) =>
        prev.map((d) =>
          d.tipo === tipo
            ? { ...d, conteudo, nomeArquivo: file.name, mimeType: file.type || 'application/octet-stream' }
            : d,
        ),
      );
      setError('');
    } catch {
      setError('Falha ao ler o documento.');
    }
  }

  function clearDoc(tipo: DocSlot['tipo']) {
    setDocs((prev) =>
      prev.map((d) =>
        d.tipo === tipo ? { ...d, conteudo: undefined, nomeArquivo: undefined, mimeType: undefined } : d,
      ),
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    const errors = validateMatricula({
      nome,
      dataNascimento,
      sexo,
      racaCor,
      nacionalidade,
      sus,
      certidaoNascimento,
      telefoneResponsavel,
      cpf,
      cep,
      estado,
      deficiencia,
      tipoDeficiencia,
      maeNome: mae.nome,
      paiNome: pai.nome,
      respLegalNome: respLegal.nome,
    });

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError('Corrija os campos destacados antes de salvar.');
      if (errors.responsaveis) setOpenOptional(true);
      return;
    }
    setFieldErrors({});

    setSaving(true);
    try {
      const responsaveis = [mae, pai, respLegal]
        .filter((r) => r.nome.trim())
        .map((r) => ({
          nome: r.nome.trim(),
          parentesco: r.parentesco,
          telefone: onlyDigits(r.telefone) || onlyDigits(telefoneResponsavel) || undefined,
          cpf: onlyDigits(r.cpf) || undefined,
          rg: r.rg || undefined,
          principal: Boolean(r.principal),
          podeBuscar: true,
        }));

      const { data: aluno } = await api.post('/alunos', {
        nomeCompleto: nome.trim(),
        dataNascimento,
        nomeMae: mae.nome.trim() || undefined,
        sexo,
        zona: moradia,
        racaCor,
        nacionalidade: nacionalidade.trim(),
        sus: onlyDigits(sus),
        certidaoNascimento: certidaoNascimento.trim(),
        telefoneContato: onlyDigits(telefoneResponsavel),
        cpf: onlyDigits(cpf) || undefined,
        nis: onlyDigits(nis) || undefined,
        tipoSanguineo: tipoSanguineo || undefined,
        fatorRh: fatorRh || undefined,
        naturalidade: naturalidade || undefined,
        historicoEscolarOrigem: historicoEscolarOrigem || undefined,
        transporteEscolar,
        nomePropriedadeRural: nomePropriedadeRural || undefined,
        bolsaFamilia,
        deficiencia,
        tipoDeficiencia: tipoDeficiencia || undefined,
        endereco: logradouro || undefined,
        numero: numero || undefined,
        bairro: bairro || undefined,
        cidade: cidade || undefined,
        estado: estado.toUpperCase() || undefined,
        cep: onlyDigits(cep) || undefined,
        fotoUrl: fotoUrl || undefined,
        responsaveis,
      });

      const documentos = docs
        .filter((d) => d.conteudo)
        .map((d) => ({
          tipo: d.tipo,
          nomeArquivo: d.nomeArquivo,
          mimeType: d.mimeType,
          conteudo: d.conteudo!,
        }));

      if (documentos.length) {
        await api.post(`/documentos/aluno/${aluno.id}/lote`, { documentos });
      }

      if (turmaId) {
        await api.post('/matriculas', {
          alunoId: aluno.id,
          turmaId: Number(turmaId),
          anoLetivoId: 1,
        });
      }

      const nDocs = documentos.length;
      setMessage(
        `Cadastro salvo: ${aluno.nomeCompleto}${nDocs ? ` · ${nDocs} documento(s)` : ''}${turmaId ? ' · matriculado' : ''}`,
      );
      setTimeout(() => router.push('/alunos'), 1400);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao salvar cadastro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Ficha de matrícula</h1>
          <p className="text-sm text-slate-500">Validação de CPF, telefone, SUS e idade · Dimas Nasser</p>
        </div>
        <button type="button" onClick={() => router.push('/alunos')} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-600">
          <X size={16} /> Lista de alunos
        </button>
      </div>

      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

      <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-[#12325a] to-cyan-800 text-white px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-blue-100 font-semibold">Ficha de matrícula / cadastro do aluno</p>
          <h2 className="text-lg font-bold">Escola Municipal Dimas Nasser</h2>
          <p className="text-xs text-blue-100">Campos com * são obrigatórios. O sistema valida CPF, telefone e cartão SUS.</p>
        </div>

        <div className="p-5 space-y-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <section className="grid gap-5 lg:grid-cols-[180px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Foto 3×4</p>
              <div className="h-40 w-32 rounded-xl border-2 border-dashed border-slate-300 bg-white overflow-hidden flex items-center justify-center">
                {fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoUrl} alt="3x4" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <Camera className="mx-auto mb-1" size={22} />
                    <p className="text-[10px]">Upload opcional</p>
                  </div>
                )}
              </div>
              <label className="mt-3 w-full">
                <input type="file" accept="image/*" className="block w-full text-[11px]" onChange={(e) => onFoto(e.target.files?.[0])} />
              </label>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-b pb-2">1. Dados obrigatórios *</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nome completo *" className="sm:col-span-2" error={fieldErrors.nome}>
                  <input
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      clearFieldError('nome');
                    }}
                    className={inputCls(fieldErrors.nome)}
                    placeholder="Nome e sobrenome"
                  />
                </Field>
                <Field label="Data de nascimento *" error={fieldErrors.dataNascimento}>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => {
                      setDataNascimento(e.target.value);
                      clearFieldError('dataNascimento');
                    }}
                    className={inputCls(fieldErrors.dataNascimento)}
                  />
                </Field>
                <Field label="Sexo *" error={fieldErrors.sexo}>
                  <select value={sexo} onChange={(e) => setSexo(e.target.value)} className={inputCls(fieldErrors.sexo)}>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </Field>
                <Field label="Raça/cor *" error={fieldErrors.racaCor}>
                  <select value={racaCor} onChange={(e) => setRacaCor(e.target.value)} className={inputCls(fieldErrors.racaCor)}>
                    {RACAS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nacionalidade *" error={fieldErrors.nacionalidade}>
                  <input
                    value={nacionalidade}
                    onChange={(e) => {
                      setNacionalidade(e.target.value);
                      clearFieldError('nacionalidade');
                    }}
                    className={inputCls(fieldErrors.nacionalidade)}
                  />
                </Field>
                <Field label="Cartão SUS * (15 dígitos)" error={fieldErrors.sus}>
                  <input
                    value={sus}
                    inputMode="numeric"
                    maxLength={15}
                    onChange={(e) => {
                      setSus(onlyDigits(e.target.value).slice(0, 15));
                      clearFieldError('sus');
                    }}
                    className={inputCls(fieldErrors.sus)}
                    placeholder="000000000000000"
                  />
                </Field>
                <Field label="Certidão de nascimento (nº) *" error={fieldErrors.certidaoNascimento}>
                  <input
                    value={certidaoNascimento}
                    onChange={(e) => {
                      setCertidaoNascimento(e.target.value);
                      clearFieldError('certidaoNascimento');
                    }}
                    className={inputCls(fieldErrors.certidaoNascimento)}
                    placeholder="Nº / livro / folha / cartório"
                  />
                </Field>
                <Field label="Moradia *">
                  <select value={moradia} onChange={(e) => setMoradia(e.target.value as 'URBANA' | 'RURAL')} className="field-input">
                    <option value="URBANA">Urbana</option>
                    <option value="RURAL">Rural</option>
                  </select>
                </Field>
                <Field label="Telefone do responsável *" error={fieldErrors.telefoneResponsavel}>
                  <input
                    value={telefoneResponsavel}
                    inputMode="tel"
                    onChange={(e) => {
                      setTelefoneResponsavel(formatPhone(e.target.value));
                      clearFieldError('telefoneResponsavel');
                    }}
                    className={inputCls(fieldErrors.telefoneResponsavel)}
                    placeholder="(66) 99999-0000"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-b pb-2">2. Endereço</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Rua / Avenida" className="lg:col-span-2">
                <input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className="field-input" />
              </Field>
              <Field label="Número">
                <input value={numero} onChange={(e) => setNumero(e.target.value)} className="field-input" />
              </Field>
              <Field label="Bairro">
                <input value={bairro} onChange={(e) => setBairro(e.target.value)} className="field-input" />
              </Field>
              <Field label="Cidade">
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} className="field-input" />
              </Field>
              <Field label="UF" error={fieldErrors.estado}>
                <input
                  value={estado}
                  maxLength={2}
                  onChange={(e) => {
                    setEstado(e.target.value.toUpperCase());
                    clearFieldError('estado');
                  }}
                  className={inputCls(fieldErrors.estado)}
                />
              </Field>
              <Field label="CEP" error={fieldErrors.cep}>
                <input
                  value={cep}
                  inputMode="numeric"
                  onChange={(e) => {
                    setCep(formatCep(e.target.value));
                    clearFieldError('cep');
                  }}
                  className={inputCls(fieldErrors.cep)}
                  placeholder="00000-000"
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-b pb-2 flex items-center gap-2">
              <Upload size={16} /> 3. Anexos digitais (PDF ou imagem · máx. ~900KB cada)
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {docs
                .filter((d) => d.tipo !== 'UNIDADE_CONSUMIDORA' || transporteEscolar || moradia === 'RURAL')
                .map((d) => (
                  <div key={d.tipo} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{d.label}</p>
                        <p className="text-[11px] text-slate-500">{d.hint}</p>
                      </div>
                      {d.conteudo && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                    </div>
                    {d.nomeArquivo ? (
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-slate-600 font-medium">{d.nomeArquivo}</span>
                        <button type="button" onClick={() => clearDoc(d.tipo)} className="text-red-600 hover:underline shrink-0">
                          Remover
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        className="mt-2 block w-full text-[11px]"
                        onChange={(e) => onDoc(d.tipo, e.target.files?.[0])}
                      />
                    )}
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 overflow-hidden">
            <button type="button" onClick={() => setOpenOptional((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-left">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-800">4. Dados complementares e responsáveis</span>
              <ChevronDown className={`transition-transform ${openOptional ? 'rotate-180' : ''}`} size={18} />
            </button>
            {openOptional && (
              <div className="p-4 space-y-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="CPF do aluno" error={fieldErrors.cpf}>
                    <input
                      value={cpf}
                      inputMode="numeric"
                      onChange={(e) => {
                        setCpf(formatCpf(e.target.value));
                        clearFieldError('cpf');
                      }}
                      className={inputCls(fieldErrors.cpf)}
                      placeholder="000.000.000-00"
                    />
                  </Field>
                  <Field label="NIS">
                    <input value={nis} inputMode="numeric" onChange={(e) => setNis(onlyDigits(e.target.value).slice(0, 11))} className="field-input" />
                  </Field>
                  <Field label="Naturalidade">
                    <input value={naturalidade} onChange={(e) => setNaturalidade(e.target.value)} className="field-input" />
                  </Field>
                  <Field label="Tipo sanguíneo">
                    <input value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)} className="field-input" />
                  </Field>
                  <Field label="Fator RH">
                    <select value={fatorRh} onChange={(e) => setFatorRh(e.target.value)} className="field-input">
                      <option value="">Não informado</option>
                      <option value="POSITIVO">Positivo (+)</option>
                      <option value="NEGATIVO">Negativo (-)</option>
                    </select>
                  </Field>
                  <Field label="Histórico (escola de origem)">
                    <input value={historicoEscolarOrigem} onChange={(e) => setHistoricoEscolarOrigem(e.target.value)} className="field-input" />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={transporteEscolar} onChange={(e) => setTransporteEscolar(e.target.checked)} /> Transporte escolar</label>
                  <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={bolsaFamilia} onChange={(e) => setBolsaFamilia(e.target.checked)} /> Bolsa Família</label>
                  <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={deficiencia} onChange={(e) => setDeficiencia(e.target.checked)} /> PcD</label>
                </div>

                {transporteEscolar && (
                  <Field label="Nome da propriedade rural">
                    <input value={nomePropriedadeRural} onChange={(e) => setNomePropriedadeRural(e.target.value)} className="field-input" />
                  </Field>
                )}
                {deficiencia && (
                  <Field label="Tipo de deficiência *" error={fieldErrors.tipoDeficiencia}>
                    <input
                      value={tipoDeficiencia}
                      onChange={(e) => {
                        setTipoDeficiencia(e.target.value);
                        clearFieldError('tipoDeficiencia');
                      }}
                      className={inputCls(fieldErrors.tipoDeficiencia)}
                    />
                  </Field>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-2">
                    <FileText size={14} /> Responsáveis (ao menos um obrigatório)
                  </h4>
                  {fieldErrors.responsaveis && (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.responsaveis}</p>
                  )}
                  <div className="grid lg:grid-cols-3 gap-3">
                    <RespCard title="Mãe" data={mae} onChange={(k, v) => { setMae((p) => ({ ...p, [k]: v })); clearFieldError('responsaveis'); }} />
                    <RespCard title="Pai" data={pai} onChange={(k, v) => { setPai((p) => ({ ...p, [k]: v })); clearFieldError('responsaveis'); }} />
                    <RespCard title="Responsável legal" data={respLegal} onChange={(k, v) => { setRespLegal((p) => ({ ...p, [k]: v })); clearFieldError('responsaveis'); }} />
                  </div>
                </div>

                <Field label="Matricular na turma (opcional)">
                  <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="field-input">
                    <option value="">Somente cadastrar</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} · {t.turno}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </section>

          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => router.push('/alunos')} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar cadastro + documentos'}
            </button>
          </div>
        </div>
      </form>

      <style jsx global>{`
        .field-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .field-input:focus {
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
        }
        .field-input-error {
          border-color: #f87171 !important;
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
}

function inputCls(err?: string) {
  return `field-input ${err ? 'field-input-error' : ''}`;
}

function Field({
  label,
  children,
  className = '',
  error,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-red-600 font-medium">{error}</span>}
    </label>
  );
}

function RespCard({
  title,
  data,
  onChange,
}: {
  title: string;
  data: Responsavel;
  onChange: (key: keyof Responsavel, value: string | boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/50">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">{title}</p>
      <input value={data.nome} onChange={(e) => onChange('nome', e.target.value)} className="field-input" placeholder="Nome completo" />
      <input value={data.rg} onChange={(e) => onChange('rg', e.target.value)} className="field-input" placeholder="RG" />
      <input
        value={data.cpf}
        onChange={(e) => onChange('cpf', formatCpf(e.target.value))}
        className="field-input"
        placeholder="CPF"
        inputMode="numeric"
      />
      <input
        value={data.telefone}
        onChange={(e) => onChange('telefone', formatPhone(e.target.value))}
        className="field-input"
        placeholder="Telefone"
        inputMode="tel"
      />
    </div>
  );
}
