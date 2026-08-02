'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserPlus, Search, Users } from 'lucide-react';

const emptyForm = {
  nomeCompleto: '',
  dataNascimento: '',
  nomeMae: '',
  zona: 'URBANA',
  sexo: '',
  endereco: '',
  bairro: '',
  telefoneContato: '',
  alergias: '',
  usaFralda: false,
  deficiencia: false,
  transporteEscolar: false,
  bolsaFamilia: false,
  nis: '',
  cpf: '',
  respNome: '',
  respParentesco: 'MAE',
  respTelefone: '',
  respWhatsapp: '',
  matricularTurmaId: '',
};

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busca, setBusca] = useState('');
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = () =>
    api
      .get('/alunos', { params: { nome: busca || undefined } })
      .then((r) => setAlunos(r.data))
      .catch(() => {});

  useEffect(() => {
    carregar();
    api.get('/turmas').then((r) => setTurmas(r.data)).catch(() => {});
  }, []);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const criar = async (e: React.FormEvent) => {
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

      if (form.matricularTurmaId) {
        await api.post('/matriculas', {
          alunoId: aluno.id,
          turmaId: Number(form.matricularTurmaId),
          anoLetivoId: 1,
        });
      }

      setMsg(
        form.matricularTurmaId
          ? `Aluno ${aluno.nomeCompleto} cadastrado e matriculado.`
          : `Aluno ${aluno.nomeCompleto} cadastrado (sem turma).`
      );
      setForm(emptyForm);
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="text-cyan-600" />
        <div>
          <h1 className="text-2xl font-bold">Alunos</h1>
          <p className="text-sm text-gray-500">Cadastro completo · responsáveis · matrícula</p>
        </div>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">{msg}</div>}
      {erro && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>}

      <form onSubmit={criar} className="bg-white p-6 rounded-2xl border space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <UserPlus size={18} /> Nova matrícula / cadastro
        </h3>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Dados do aluno</p>
          <div className="grid md:grid-cols-3 gap-3">
            <input required placeholder="Nome completo" value={form.nomeCompleto} onChange={(e) => set('nomeCompleto', e.target.value)} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
            <input required type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <input required placeholder="Nome da mãe" value={form.nomeMae} onChange={(e) => set('nomeMae', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <select value={form.sexo} onChange={(e) => set('sexo', e.target.value)} className="border p-2.5 rounded-lg text-sm">
              <option value="">Sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            <select value={form.zona} onChange={(e) => set('zona', e.target.value)} className="border p-2.5 rounded-lg text-sm">
              <option value="URBANA">Zona Urbana</option>
              <option value="RURAL">Zona Rural</option>
            </select>
            <input placeholder="Telefone contato" value={form.telefoneContato} onChange={(e) => set('telefoneContato', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <input placeholder="Endereço" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
            <input placeholder="Bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <input placeholder="CPF (opcional)" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <input placeholder="NIS / Bolsa Família" value={form.nis} onChange={(e) => set('nis', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <input placeholder="Alergias" value={form.alergias} onChange={(e) => set('alergias', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.transporteEscolar} onChange={(e) => set('transporteEscolar', e.target.checked)} /> Transporte escolar</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.bolsaFamilia} onChange={(e) => set('bolsaFamilia', e.target.checked)} /> Bolsa Família</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.deficiencia} onChange={(e) => set('deficiencia', e.target.checked)} /> PcD / deficiência</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.usaFralda} onChange={(e) => set('usaFralda', e.target.checked)} /> Usa fralda</label>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Responsável principal</p>
          <div className="grid md:grid-cols-4 gap-3">
            <input placeholder="Nome do responsável" value={form.respNome} onChange={(e) => set('respNome', e.target.value)} className="border p-2.5 rounded-lg text-sm md:col-span-2" />
            <select value={form.respParentesco} onChange={(e) => set('respParentesco', e.target.value)} className="border p-2.5 rounded-lg text-sm">
              <option value="MAE">Mãe</option>
              <option value="PAI">Pai</option>
              <option value="AVO">Avô/Avó</option>
              <option value="TIO">Tio/Tia</option>
              <option value="OUTRO">Outro</option>
            </select>
            <input placeholder="Telefone" value={form.respTelefone} onChange={(e) => set('respTelefone', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
            <input placeholder="WhatsApp" value={form.respWhatsapp} onChange={(e) => set('respWhatsapp', e.target.value)} className="border p-2.5 rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Matricular na turma (opcional)</p>
          <select value={form.matricularTurmaId} onChange={(e) => set('matricularTurmaId', e.target.value)} className="border p-2.5 rounded-lg text-sm w-full md:w-80">
            <option value="">Somente cadastrar (sem turma)</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} · {t.turno} · {t.ocupacao || 0}/{t.capacidadeMax}
              </option>
            ))}
          </select>
        </div>

        <button disabled={loading} className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar cadastro'}
        </button>
      </form>

      <div className="bg-white rounded-2xl border">
        <div className="p-4 border-b flex gap-2">
          <input placeholder="Buscar aluno..." value={busca} onChange={(e) => setBusca(e.target.value)} className="border p-2 rounded-lg w-64 text-sm" />
          <button onClick={carregar} className="border px-4 rounded-lg text-sm flex items-center gap-1">
            <Search size={14} /> Buscar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Nascimento</th>
                <th className="p-3">Mãe</th>
                <th className="p-3">Zona</th>
                <th className="p-3">Turma</th>
                <th className="p-3">Responsáveis</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{a.nomeCompleto}</td>
                  <td className="p-3">{new Date(a.dataNascimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">{a.nomeMae}</td>
                  <td className="p-3">{a.zona}</td>
                  <td className="p-3">{a.matriculas?.[0]?.turma?.nome || '—'}</td>
                  <td className="p-3 text-xs text-gray-600">
                    {(a.responsaveis || []).map((r: any) => r.responsavel?.nome).filter(Boolean).join(', ') || '—'}
                  </td>
                </tr>
              ))}
              {alunos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    Nenhum aluno encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
