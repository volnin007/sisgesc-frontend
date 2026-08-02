'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Camera, FileText, Save, User } from 'lucide-react';

/** Converte e redimensiona para proporção 3x4 (retrato), JPEG comprimido */
async function processarFoto3x4(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const targetW = 300;
        const targetH = 400; // 3x4
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas não suportado'));

        // crop central mantendo proporção 3:4
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
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

const empty = {
  nomeCompleto: '',
  dataNascimento: '',
  sexo: '',
  nomeMae: '',
  cpf: '',
  nis: '',
  inepId: '',
  endereco: '',
  bairro: '',
  zona: 'URBANA',
  telefoneContato: '',
  alergias: '',
  usaFralda: false,
  deficiencia: false,
  transporteEscolar: false,
  bolsaFamilia: false,
  fotoUrl: '',
  respNome: '',
  respParentesco: 'MAE',
  respTelefone: '',
  respWhatsapp: '',
  turmaId: '',
};

export default function MatriculaPage() {
  const [form, setForm] = useState(empty);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/turmas').then((r) => setTurmas(r.data)).catch(() => {});
  }, []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErro('Selecione uma imagem (JPG ou PNG).');
      return;
    }
    try {
      const dataUrl = await processarFoto3x4(file);
      set('fotoUrl', dataUrl);
      setErro('');
    } catch {
      setErro('Não foi possível processar a foto.');
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMsg('');
    try {
      const payload: any = {
        nomeCompleto: form.nomeCompleto,
        dataNascimento: form.dataNascimento,
        nomeMae: form.nomeMae,
        zona: form.zona,
        sexo: form.sexo || undefined,
        endereco: form.endereco || undefined,
        bairro: form.bairro || undefined,
        telefoneContato: form.telefoneContato || undefined,
        alergias: form.alergias || undefined,
        usaFralda: form.usaFralda,
        deficiencia: form.deficiencia,
        transporteEscolar: form.transporteEscolar,
        bolsaFamilia: form.bolsaFamilia,
        nis: form.nis || undefined,
        cpf: form.cpf || undefined,
        inepId: form.inepId || undefined,
        fotoUrl: form.fotoUrl || undefined,
      };
      if (form.respNome) {
        payload.responsaveis = [
          {
            nome: form.respNome,
            parentesco: form.respParentesco,
            telefone: form.respTelefone || undefined,
            whatsapp: form.respWhatsapp || undefined,
            principal: true,
            podeBuscar: true,
          },
        ];
      }

      const { data: aluno } = await api.post('/alunos', payload);

      if (form.turmaId) {
        await api.post('/matriculas', {
          alunoId: aluno.id,
          turmaId: Number(form.turmaId),
          anoLetivoId: 1,
        });
      }

      setMsg(
        form.turmaId
          ? `Matrícula concluída: ${aluno.nomeCompleto}`
          : `Aluno cadastrado: ${aluno.nomeCompleto} (sem turma)`
      );
      setForm(empty);
      setTimeout(() => router.push('/alunos'), 1500);
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Erro ao salvar matrícula');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-cyan-700 uppercase">Ficha oficial</p>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="text-cyan-600" /> Matrícula completa
          </h1>
          <p className="text-sm text-gray-500">Escola Municipal Dimas Nasser · Ano letivo 2026 · Pré ao 9º</p>
        </div>
        <div className="hidden sm:block text-right text-xs text-gray-400">
          <p>Secretaria Escolar</p>
          <p>Gestão 2025/2028</p>
        </div>
      </div>

      {msg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">{msg}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{erro}</div>}

      <form onSubmit={salvar} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Cabeçalho formulário */}
        <div className="bg-gradient-to-r from-slate-900 to-cyan-900 text-white px-6 py-4 flex flex-wrap justify-between gap-2">
          <div>
            <p className="font-bold">Requisição de Matrícula</p>
            <p className="text-xs text-cyan-200/80">Preencha todos os campos obrigatórios (*)</p>
          </div>
          <p className="text-xs text-cyan-200/70 self-end">SISGESC · Volnin Tech</p>
        </div>

        <div className="p-6 grid lg:grid-cols-[140px_1fr] gap-8">
          {/* Foto 3x4 */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Foto 3×4</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-[120px] h-[160px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-cyan-500 hover:bg-cyan-50/40 transition overflow-hidden group"
              title="Clique para enviar foto 3x4"
            >
              {form.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.fotoUrl} alt="Foto 3x4" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1 p-2">
                  <Camera size={28} />
                  <span className="text-[10px] text-center leading-tight">Clique para
                    <br />
                    enviar 3×4
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] py-1 opacity-0 group-hover:opacity-100 transition text-center">
                Alterar
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFoto} />
            <p className="text-[10px] text-gray-400 text-center leading-tight max-w-[120px]">
              JPG/PNG · recorte automático 3×4
            </p>
            {form.fotoUrl && (
              <button type="button" onClick={() => set('fotoUrl', '')} className="text-[11px] text-red-600 hover:underline">
                Remover foto
              </button>
            )}
          </div>

          {/* Campos */}
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <User size={14} /> Identificação do aluno
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-gray-600">Nome completo *</label>
                  <input required value={form.nomeCompleto} onChange={(e) => set('nomeCompleto', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Data de nascimento *</label>
                  <input required type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Sexo</label>
                  <select value={form.sexo} onChange={(e) => set('sexo', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm">
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">CPF do aluno</label>
                  <input value={form.cpf} onChange={(e) => set('cpf', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Código INEP (se houver)</label>
                  <input value={form.inepId} onChange={(e) => set('inepId', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Filiação</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-gray-600">Nome da mãe *</label>
                  <input required value={form.nomeMae} onChange={(e) => set('nomeMae', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Endereço e contato</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-gray-600">Endereço</label>
                  <input value={form.endereco} onChange={(e) => set('endereco', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Bairro</label>
                  <input value={form.bairro} onChange={(e) => set('bairro', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Zona *</label>
                  <select value={form.zona} onChange={(e) => set('zona', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm">
                    <option value="URBANA">Urbana</option>
                    <option value="RURAL">Rural</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Telefone</label>
                  <input value={form.telefoneContato} onChange={(e) => set('telefoneContato', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Programas · Saúde · Inclusão</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[11px] font-medium text-gray-600">NIS / Bolsa Família</label>
                  <input value={form.nis} onChange={(e) => set('nis', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Alergias / restrições</label>
                  <input value={form.alergias} onChange={(e) => set('alergias', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.bolsaFamilia} onChange={(e) => set('bolsaFamilia', e.target.checked)} /> Bolsa Família</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.transporteEscolar} onChange={(e) => set('transporteEscolar', e.target.checked)} /> Transporte escolar</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.deficiencia} onChange={(e) => set('deficiencia', e.target.checked)} /> PcD / deficiência</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.usaFralda} onChange={(e) => set('usaFralda', e.target.checked)} /> Usa fralda</label>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Responsável (quem pode buscar)</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-gray-600">Nome do responsável</label>
                  <input value={form.respNome} onChange={(e) => set('respNome', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Parentesco</label>
                  <select value={form.respParentesco} onChange={(e) => set('respParentesco', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm">
                    <option value="MAE">Mãe</option>
                    <option value="PAI">Pai</option>
                    <option value="AVO">Avô/Avó</option>
                    <option value="TIO">Tio/Tia</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">Telefone</label>
                  <input value={form.respTelefone} onChange={(e) => set('respTelefone', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-600">WhatsApp</label>
                  <input value={form.respWhatsapp} onChange={(e) => set('respWhatsapp', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2.5 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Turma de destino</h3>
              <select value={form.turmaId} onChange={(e) => set('turmaId', e.target.value)} className="w-full border rounded-lg px-3 py-2.5 text-sm">
                <option value="">Cadastrar sem matricular em turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} · {t.turno} · {t.etapa} · vagas {t.vagas ?? t.capacidadeMax - (t.ocupacao || 0)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Infantil: máximo 25 alunos (MEC). Sistema bloqueia turma lotada.</p>
            </section>
          </div>
        </div>

        <div className="border-t bg-gray-50 px-6 py-4 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => router.push('/alunos')} className="px-5 py-2.5 rounded-xl border text-sm font-medium text-gray-600 hover:bg-white">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60">
            <Save size={16} />
            {loading ? 'Salvando...' : 'Confirmar matrícula'}
          </button>
        </div>
      </form>
    </div>
  );
}
