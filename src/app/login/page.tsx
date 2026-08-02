'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lock, Mail, School } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@dimasnasser.edu.br');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      localStorage.setItem('sisgesc_token', data.token);
      localStorage.setItem('sisgesc_user', JSON.stringify(data.user));
      router.push('/');
    } catch {
      setErro('Email ou senha inválidos. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-slate-900 to-cyan-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-green-500 shadow-lg shadow-cyan-500/30 mb-4">
            <School className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">SISGESC</h1>
          <p className="text-cyan-300/80 text-sm mt-1">Escola Municipal Dimas Nasser</p>
          <p className="text-gray-500 text-xs mt-1">Pré-Escola ao 9º Ano · Gestão 2025/2028</p>
        </div>

        <form onSubmit={entrar} className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-5 border border-white/20">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-700/20 disabled:opacity-60 transition"
          >
            {loading ? 'Entrando...' : 'Entrar no sistema'}
          </button>

          <p className="text-[11px] text-center text-gray-400 pt-2">
            Volnin Tech Hacker · (66) 93618-2776
          </p>
        </form>
      </div>
    </div>
  );
}
