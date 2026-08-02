'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Bot, Send } from 'lucide-react';

export default function IADuvidasPage() {
  const [pergunta, setPergunta] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    api.get('/ia-duvidas/historico').then((r) => setHistorico(r.data)).catch(() => {});
  }, []);

  const perguntar = async () => {
    if (!pergunta) return;
    setCarregando(true);
    try {
      const { data } = await api.post('/ia-duvidas', { pergunta, disciplina });
      setResposta(data.resposta);
      setHistorico((h) => [data, ...h]);
    } catch (e) {
      setResposta('Erro ao consultar IA. Configure GROQ_API_KEY no backend ou tente de novo.');
    }
    setCarregando(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bot /> IA Dúvidas - Escola Municipal Dimas Nasser
      </h1>
      <p className="text-sm text-gray-500">
        Pergunte planos de aula, BNCC, atividades para Pré ao 9º Ano. Funciona com Groq grátis ou modo offline.
      </p>
      <div className="bg-white p-5 rounded-xl border space-y-3">
        <select
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          className="border p-2 rounded text-sm"
        >
          <option value="">Disciplina / Área</option>
          <option value="CAMPO_EXPERIENCIA">Campo de Experiência (Infantil)</option>
          <option value="MATEMATICA">Matemática</option>
          <option value="PORTUGUES">Português</option>
          <option value="CIENCIAS">Ciências</option>
          <option value="HISTORIA">História</option>
          <option value="GEOGRAFIA">Geografia</option>
        </select>
        <textarea
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Ex: Plano de aula sobre animais da fazenda para Pré II BNCC EI03EO01"
          className="w-full border p-3 rounded h-28"
        />
        <button
          onClick={perguntar}
          disabled={carregando}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {carregando ? 'Pensando...' : 'Perguntar IA'}
        </button>
      </div>
      {resposta && (
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
          <h4 className="font-bold text-green-800">Resposta:</h4>
          <div className="text-sm whitespace-pre-wrap mt-2">{resposta}</div>
        </div>
      )}
      <div className="bg-white p-4 rounded-xl border">
        <h4 className="font-bold text-sm mb-2">Histórico recente</h4>
        {historico.length === 0 && <p className="text-xs text-gray-400">Nenhuma pergunta ainda.</p>}
        {historico.map((h: any) => (
          <div key={h.id} className="border-b py-2 text-xs">
            <p className="font-medium">{h.pergunta}</p>
            <p className="text-gray-500 line-clamp-2">{h.resposta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
