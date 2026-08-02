'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatPhone, onlyDigits } from '@/lib/validacao';
import { MessageCircle, Send, Settings2, AlertCircle, CheckCircle2 } from 'lucide-react';

type StatusWa = {
  configurado: boolean;
  phoneNumberId: string | null;
  templatePadrao: string;
  idioma: string;
  aviso: string;
};

export default function AvisosPage() {
  const [status, setStatus] = useState<StatusWa | null>(null);
  const [telefone, setTelefone] = useState('');
  const [templateName, setTemplateName] = useState('hello_world');
  const [languageCode, setLanguageCode] = useState('pt_BR');
  const [variaveis, setVariaveis] = useState('');
  const [lote, setLote] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/whatsapp/status')
      .then((r) => {
        setStatus(r.data);
        if (r.data?.templatePadrao) setTemplateName(r.data.templatePadrao);
        if (r.data?.idioma) setLanguageCode(r.data.idioma);
      })
      .catch(() =>
        setStatus({
          configurado: false,
          phoneNumberId: null,
          templatePadrao: 'hello_world',
          idioma: 'pt_BR',
          aviso: 'Não foi possível consultar o status da API WhatsApp.',
        }),
      );
  }, []);

  async function enviarTeste(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (onlyDigits(telefone).length < 10) {
      setErr('Informe um telefone válido com DDD.');
      return;
    }
    setLoading(true);
    try {
      const vars = variaveis
        .split('|')
        .map((v) => v.trim())
        .filter(Boolean);
      const { data } = await api.post('/whatsapp/teste', {
        telefone: onlyDigits(telefone),
        templateName: templateName.trim() || undefined,
        languageCode: languageCode.trim() || undefined,
        variaveis: vars.length ? vars : undefined,
      });
      setMsg(data.message || 'Enviado com sucesso.');
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha no envio de teste.');
    } finally {
      setLoading(false);
    }
  }

  async function enviarLote(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    const telefones = lote
      .split(/[\n,;]+/)
      .map((t) => onlyDigits(t))
      .filter((t) => t.length >= 10);
    if (!telefones.length) {
      setErr('Informe ao menos um telefone na lista (um por linha).');
      return;
    }
    if (telefones.length > 20) {
      setErr('Máximo de 20 números por lote neste rascunho.');
      return;
    }
    setLoading(true);
    try {
      const vars = variaveis
        .split('|')
        .map((v) => v.trim())
        .filter(Boolean);
      const { data } = await api.post('/whatsapp/lote', {
        telefones,
        templateName: templateName.trim() || undefined,
        languageCode: languageCode.trim() || undefined,
        variaveis: vars.length ? vars : undefined,
      });
      setMsg(`Lote: ${data.enviados} ok · ${data.falhas} falha(s).`);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Falha no envio em lote.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
          <MessageCircle size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Avisos WhatsApp</h1>
          <p className="text-sm text-slate-700 font-medium">
            Meta Cloud API · templates aprovados · LGPD / opt-in
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl border p-4 flex gap-3 ${
          status?.configurado
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        {status?.configurado ? (
          <CheckCircle2 className="text-emerald-700 shrink-0" size={20} />
        ) : (
          <AlertCircle className="text-amber-700 shrink-0" size={20} />
        )}
        <div className="text-sm text-slate-800 space-y-1">
          <p className="font-bold">
            {status?.configurado
              ? 'API configurada no servidor'
              : 'API ainda não configurada'}
          </p>
          <p className="text-slate-600">{status?.aviso}</p>
          <p className="text-xs text-slate-500">
            Template padrão: <strong>{status?.templatePadrao || '—'}</strong> · idioma:{' '}
            <strong>{status?.idioma || 'pt_BR'}</strong>
            {status?.phoneNumberId ? ` · Phone ID: ${status.phoneNumberId}` : ''}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <Settings2 size={16} /> Configuração (Vercel Env)
        </h2>
        <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
          <li>
            <code className="bg-slate-100 px-1 rounded">WHATSAPP_TOKEN</code> — token permanente
            Meta
          </li>
          <li>
            <code className="bg-slate-100 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code>
          </li>
          <li>
            <code className="bg-slate-100 px-1 rounded">WHATSAPP_TEMPLATE_NAME</code> (ex.:
            hello_world ou template aprovado)
          </li>
          <li>
            <code className="bg-slate-100 px-1 rounded">WHATSAPP_TEMPLATE_LANG</code> = pt_BR
          </li>
        </ul>
        <p className="text-xs text-slate-500">
          Fora da janela de 24h só é permitido template aprovado. Obtenha consentimento dos
          responsáveis (LGPD).
        </p>
      </div>

      <form onSubmit={enviarTeste} className="bg-white rounded-2xl border p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-2">
          <Send size={16} /> Envio de teste (1 número)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Telefone *
            <input
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              className="mt-1 w-full border rounded-xl px-3 py-2.5"
              placeholder="(66) 99628-6924"
              inputMode="tel"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Nome do template
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Idioma
            <input
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5"
              placeholder="pt_BR"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Variáveis do body (opcional, separadas por |)
            <input
              value={variaveis}
              onChange={(e) => setVariaveis(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5"
              placeholder="Nome do aluno|Turma A"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-700 text-white px-5 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar template de teste'}
        </button>
      </form>

      <form onSubmit={enviarLote} className="bg-white rounded-2xl border p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Lote (até 20 números)
        </h2>
        <label className="block text-sm font-semibold text-slate-800">
          Telefones (um por linha)
          <textarea
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            className="mt-1 w-full border rounded-xl px-3 py-2.5 min-h-[120px] font-mono text-sm"
            placeholder={'66996286924\n66936182776'}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {loading ? 'Processando...' : 'Enviar lote'}
        </button>
      </form>

      {err && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>
      )}
      {msg && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          {msg}
        </p>
      )}
    </div>
  );
}
