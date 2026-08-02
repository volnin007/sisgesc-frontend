'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';

const TIPOS = [
  { tipo: 'CERTIDAO', label: 'Certidão de nascimento' },
  { tipo: 'TIPAGEM', label: 'Tipagem sanguínea' },
  { tipo: 'HISTORICO', label: 'Histórico escolar' },
  { tipo: 'COMPROVANTE_ENDERECO', label: 'Comprovante de endereço' },
  { tipo: 'UNIDADE_CONSUMIDORA', label: 'Unidade consumidora' },
  { tipo: 'RG', label: 'RG' },
  { tipo: 'CPF', label: 'CPF' },
  { tipo: 'OUTRO', label: 'Outro documento' },
] as const;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler'));
    reader.readAsDataURL(file);
  });
}

export default function AlunoFichaPage() {
  const params = useParams();
  const id = params?.id as string;
  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tipoUpload, setTipoUpload] = useState<string>('CERTIDAO');

  const load = () => {
    setLoading(true);
    api
      .get(`/alunos/${id}`)
      .then((r) => setAluno(r.data))
      .catch(() => setError('Aluno não encontrado'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function onUpload(file?: File | null) {
    if (!file || !id) return;
    if (file.size > 900_000) {
      setError('Arquivo muito grande (máx. ~900KB).');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const conteudo = await fileToBase64(file);
      await api.post(`/documentos/aluno/${id}`, {
        tipo: tipoUpload,
        nomeArquivo: file.name,
        mimeType: file.type || 'application/octet-stream',
        conteudo,
      });
      setMsg('Documento anexado.');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Falha no upload');
    } finally {
      setUploading(false);
    }
  }

  async function verDoc(docId: number) {
    try {
      const { data } = await api.get(`/documentos/${docId}`);
      if (!data?.conteudo) return;
      const w = window.open();
      if (!w) return;
      if (String(data.mimeType || '').includes('pdf') || data.conteudo.startsWith('data:application/pdf')) {
        w.document.write(
          `<iframe src="${data.conteudo}" style="border:0;width:100%;height:100%"></iframe>`,
        );
      } else {
        w.document.write(`<img src="${data.conteudo}" style="max-width:100%" />`);
      }
    } catch {
      setError('Não foi possível abrir o documento.');
    }
  }

  async function excluirDoc(docId: number) {
    if (!confirm('Excluir este documento?')) return;
    try {
      await api.delete(`/documentos/${docId}`);
      setMsg('Documento removido.');
      load();
    } catch {
      setError('Falha ao excluir');
    }
  }

  if (loading) {
    return <p className="text-slate-400 text-sm p-6">Carregando ficha...</p>;
  }
  if (!aluno) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Não encontrado'}</p>
        <Link href="/alunos" className="text-cyan-700 text-sm font-semibold">← Voltar</Link>
      </div>
    );
  }

  const docs = aluno.documentos || [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/alunos" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Lista de alunos
        </Link>
        <Link href="/matricula" className="text-sm font-bold text-emerald-700 hover:underline">
          + Nova matrícula
        </Link>
      </div>

      {msg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Cabeçalho ficha */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-[#12325a] to-cyan-800 text-white px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-blue-100 font-semibold">Ficha do aluno</p>
          <h1 className="text-xl font-bold">{aluno.nomeCompleto}</h1>
          <p className="text-xs text-blue-100">Escola Municipal Dimas Nasser · SISGESC</p>
        </div>

        <div className="p-5 grid gap-6 lg:grid-cols-[140px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-40 w-32 rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
              {aluno.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={aluno.fotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="text-slate-300" size={40} />
              )}
            </div>
            <p className="text-[10px] text-slate-400">Foto 3×4</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Info label="Nascimento" value={new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')} />
            <Info label="Sexo" value={aluno.sexo} />
            <Info label="Raça/cor" value={aluno.racaCor} />
            <Info label="Nacionalidade" value={aluno.nacionalidade} />
            <Info label="SUS" value={aluno.sus} />
            <Info label="CPF" value={aluno.cpf} />
            <Info label="Certidão" value={aluno.certidaoNascimento} />
            <Info label="Moradia" value={aluno.zona} />
            <Info label="Mãe" value={aluno.nomeMae} />
            <Info label="Telefone" value={aluno.telefoneContato} />
            <Info label="Tipo sanguíneo" value={[aluno.tipoSanguineo, aluno.fatorRh].filter(Boolean).join(' ') || null} />
            <Info label="NIS" value={aluno.nis} />
            <div className="sm:col-span-2">
              <Info
                label="Endereço"
                value={[aluno.endereco, aluno.numero && `nº ${aluno.numero}`, aluno.bairro, aluno.cidade, aluno.estado, aluno.cep]
                  .filter(Boolean)
                  .join(' · ') || null}
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
              {aluno.bolsaFamilia && <Badge>Bolsa Família</Badge>}
              {aluno.transporteEscolar && <Badge>Transporte</Badge>}
              {aluno.deficiencia && <Badge>PcD{aluno.tipoDeficiencia ? `: ${aluno.tipoDeficiencia}` : ''}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Matrículas e responsáveis */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Matrículas</h3>
          {(aluno.matriculas || []).length === 0 && <p className="text-sm text-slate-400">Sem matrícula ativa</p>}
          {(aluno.matriculas || []).map((m: any) => (
            <div key={m.id} className="text-sm border rounded-xl px-3 py-2 mb-2">
              <p className="font-semibold">{m.turma?.nome || 'Turma'}</p>
              <p className="text-xs text-slate-500">
                {m.numeroMatricula} · {m.status} · {m.turma?.turno}
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Responsáveis</h3>
          {(aluno.responsaveis || []).length === 0 && <p className="text-sm text-slate-400">Não informados</p>}
          {(aluno.responsaveis || []).map((r: any) => (
            <div key={r.id} className="text-sm border rounded-xl px-3 py-2 mb-2">
              <p className="font-semibold">{r.responsavel?.nome}</p>
              <p className="text-xs text-slate-500">
                {r.responsavel?.parentesco || '—'} · {r.responsavel?.telefone || 'sem telefone'}
                {r.principal ? ' · principal' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Documentos */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} /> Documentos digitais
          </h3>
          <span className="text-xs text-slate-500">{docs.length} arquivo(s)</span>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs font-semibold text-slate-600">
              Tipo
              <select
                value={tipoUpload}
                onChange={(e) => setTipoUpload(e.target.value)}
                className="mt-1 block rounded-lg border px-3 py-2 text-sm"
              >
                {TIPOS.map((t) => (
                  <option key={t.tipo} value={t.tipo}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Arquivo (PDF/imagem · máx. 900KB)
              <input
                type="file"
                accept="image/*,.pdf,application/pdf"
                disabled={uploading}
                className="mt-1 block text-xs"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </label>
            {uploading && <span className="text-xs text-slate-400">Enviando...</span>}
          </div>

          {docs.length === 0 && (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Upload size={14} /> Nenhum anexo ainda.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-2">
            {docs.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> {d.tipo}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{d.nomeArquivo || `doc #${d.id}`}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => verDoc(d.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-cyan-700"
                    title="Abrir"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => excluirDoc(d.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-800 font-medium">{value || '—'}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-cyan-50 text-cyan-800 px-2.5 py-1 text-[11px] font-semibold">
      {children}
    </span>
  );
}
