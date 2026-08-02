'use client';
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Camera, ChevronDown, FileText, Save, X } from 'lucide-react';

type Responsavel = {
  nome: string;
  rg: string;
  cpf: string;
  telefone: string;
  parentesco: 'MAE' | 'PAI' | 'RESPONSAVEL_LEGAL' | 'OUTRO';
  principal?: boolean;
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

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data)).catch(() => {});
  }, []);

  async function onFoto(file?: File | null) {
    if (!file) return;
    try {
      setFotoUrl(await processarFoto3x4(file));
    } catch {
      setError('Não foi possível processar a foto 3x4.');
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const responsaveis = [mae, pai, respLegal]
        .filter((r) => r.nome.trim())
        .map((r) => ({
          nome: r.nome,
          parentesco: r.parentesco,
          telefone: r.telefone || telefoneResponsavel || undefined,
          cpf: r.cpf || undefined,
          rg: r.rg || undefined,
          principal: Boolean(r.principal),
          podeBuscar: true,
        }));

      const { data: aluno } = await api.post('/alunos', {
        nomeCompleto: nome,
        dataNascimento,
        nomeMae: mae.nome || undefined,
        sexo,
        zona: moradia,
        racaCor,
        nacionalidade,
        sus: sus || undefined,
        certidaoNascimento: certidaoNascimento || undefined,
        telefoneContato: telefoneResponsavel || undefined,
        cpf: cpf || undefined,
        nis: nis || undefined,
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
        estado: estado || undefined,
        cep: cep || undefined,
        fotoUrl: fotoUrl || undefined,
        responsaveis,
      });

      if (turmaId) {
        await api.post('/matriculas', {
          alunoId: aluno.id,
          turmaId: Number(turmaId),
          anoLetivoId: 1,
        });
      }

      setMessage(
        turmaId
          ? `Matrícula concluída: ${aluno.nomeCompleto}`
          : `Aluno cadastrado: ${aluno.nomeCompleto}`,
      );
      setTimeout(() => router.push('/alunos'), 1200);
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
          <p className="text-sm text-slate-500">
            Padrão oficial · Escola Municipal Dimas Nasser · erp-escolar-publico
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/alunos')}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-600"
        >
          <X size={16} /> Lista de alunos
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>
      )}

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-[#12325a] to-cyan-800 text-white px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-blue-100 font-semibold">
            Ficha de matrícula / cadastro do aluno
          </p>
          <h2 className="text-lg font-bold">Escola Municipal Dimas Nasser</h2>
          <p className="text-xs text-blue-100">Campos com * são obrigatórios. Demais podem ser complementados depois.</p>
        </div>

        <div className="p-5 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Foto + obrigatórios */}
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
              <p className="mt-2 text-[10px] text-slate-500 text-center">Recorte automático 3×4 · recomendado na matrícula</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-b pb-2">
                1. Dados obrigatórios do aluno *
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nome completo *" className="sm:col-span-2">
                  <input required value={nome} onChange={(e) => setNome(e.target.value)} className="field-input" placeholder="Nome completo do aluno" />
                </Field>
                <Field label="Data de nascimento *">
                  <input required type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="field-input" />
                </Field>
                <Field label="Sexo *">
                  <select required value={sexo} onChange={(e) => setSexo(e.target.value)} className="field-input">
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </Field>
                <Field label="Raça/cor *">
                  <select required value={racaCor} onChange={(e) => setRacaCor(e.target.value)} className="field-input">
                    {RACAS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nacionalidade *">
                  <input required value={nacionalidade} onChange={(e) => setNacionalidade(e.target.value)} className="field-input" />
                </Field>
                <Field label="Cartão SUS *">
                  <input required value={sus} onChange={(e) => setSus(e.target.value)} className="field-input" placeholder="Número do cartão SUS" />
                </Field>
                <Field label="Certidão de nascimento *">
                  <input required value={certidaoNascimento} onChange={(e) => setCertidaoNascimento(e.target.value)} className="field-input" placeholder="Nº / livro / folha / cartório" />
                </Field>
                <Field label="Moradia *">
                  <select required value={moradia} onChange={(e) => setMoradia(e.target.value as 'URBANA' | 'RURAL')} className="field-input">
                    <option value="URBANA">Urbana</option>
                    <option value="RURAL">Rural</option>
                  </select>
                </Field>
                <Field label="Telefone do responsável *">
                  <input required value={telefoneResponsavel} onChange={(e) => setTelefoneResponsavel(e.target.value)} className="field-input" placeholder="(00) 00000-0000" />
                </Field>
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 border-b pb-2">2. Endereço atualizado</h3>
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
              <Field label="Cidade / Município">
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} className="field-input" />
              </Field>
              <Field label="UF">
                <input value={estado} onChange={(e) => setEstado(e.target.value)} className="field-input" maxLength={2} />
              </Field>
              <Field label="CEP">
                <input value={cep} onChange={(e) => setCep(e.target.value)} className="field-input" />
              </Field>
            </div>
          </section>

          {/* Opcionais */}
          <section className="rounded-2xl border border-slate-200 overflow-hidden">
            <button type="button" onClick={() => setOpenOptional((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-left">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-800">3. Dados opcionais (podem ser inseridos depois)</span>
              <ChevronDown className={`transition-transform ${openOptional ? 'rotate-180' : ''}`} size={18} />
            </button>
            {openOptional && (
              <div className="p-4 space-y-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Field label="CPF do aluno"><input value={cpf} onChange={(e) => setCpf(e.target.value)} className="field-input" /></Field>
                  <Field label="NIS"><input value={nis} onChange={(e) => setNis(e.target.value)} className="field-input" /></Field>
                  <Field label="Naturalidade"><input value={naturalidade} onChange={(e) => setNaturalidade(e.target.value)} className="field-input" /></Field>
                  <Field label="Tipo sanguíneo"><input value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)} className="field-input" placeholder="A, B, AB, O" /></Field>
                  <Field label="Fator RH (Lei 4.067/2019)">
                    <select value={fatorRh} onChange={(e) => setFatorRh(e.target.value)} className="field-input">
                      <option value="">Não informado</option>
                      <option value="POSITIVO">Positivo (+)</option>
                      <option value="NEGATIVO">Negativo (-)</option>
                    </select>
                  </Field>
                  <Field label="Histórico escolar (origem)"><input value={historicoEscolarOrigem} onChange={(e) => setHistoricoEscolarOrigem(e.target.value)} className="field-input" /></Field>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={transporteEscolar} onChange={(e) => setTransporteEscolar(e.target.checked)} /> Transporte escolar</label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={bolsaFamilia} onChange={(e) => setBolsaFamilia(e.target.checked)} /> Bolsa Família / CadÚnico</label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={deficiencia} onChange={(e) => setDeficiencia(e.target.checked)} /> Pessoa com deficiência</label>
                </div>

                {transporteEscolar && (
                  <Field label="Nome da propriedade rural">
                    <input value={nomePropriedadeRural} onChange={(e) => setNomePropriedadeRural(e.target.value)} className="field-input" />
                  </Field>
                )}
                {deficiencia && (
                  <Field label="Tipo de deficiência">
                    <input value={tipoDeficiencia} onChange={(e) => setTipoDeficiencia(e.target.value)} className="field-input" />
                  </Field>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-2">
                    <FileText size={14} /> Nome e documentos dos responsáveis
                  </h4>
                  <div className="grid lg:grid-cols-3 gap-3">
                    <RespCard title="Mãe" data={mae} onChange={(k, v) => setMae((p) => ({ ...p, [k]: v }))} />
                    <RespCard title="Pai" data={pai} onChange={(k, v) => setPai((p) => ({ ...p, [k]: v }))} />
                    <RespCard title="Responsável legal" data={respLegal} onChange={(k, v) => setRespLegal((p) => ({ ...p, [k]: v }))} />
                  </div>
                </div>

                <Field label="Matricular na turma (opcional)">
                  <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="field-input">
                    <option value="">Somente cadastrar (sem turma)</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} · {t.turno} · vagas {t.vagas ?? t.capacidadeMax - (t.ocupacao || 0)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </section>

          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => router.push('/alunos')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar cadastro do aluno'}
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
      `}</style>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
      {children}
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
      <input value={data.cpf} onChange={(e) => onChange('cpf', e.target.value)} className="field-input" placeholder="CPF" />
      <input value={data.telefone} onChange={(e) => onChange('telefone', e.target.value)} className="field-input" placeholder="Telefone" />
    </div>
  );
}
