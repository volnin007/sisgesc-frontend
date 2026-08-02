'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@dimasnasser.edu.br');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const entrar = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      localStorage.setItem('sisgesc_token', data.token);
      router.push('/');
    } catch {
      setErro('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={entrar} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">SISGESC</h1>
        <p className="text-center text-sm text-gray-500">Escola Municipal Dimas Nasser</p>
        {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-3 rounded-lg" required />
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" className="w-full border p-3 rounded-lg" required />
        <button className="w-full bg-green-700 text-white py-3 rounded-lg font-bold">Entrar</button>
        <p className="text-xs text-center text-gray-400">Volnin Tech Hacker • (66) 93618-2776</p>
      </form>
    </div>
  );
}
