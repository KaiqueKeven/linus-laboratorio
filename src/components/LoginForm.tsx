'use client';

import React, { useState } from 'react';
import { Activity, Lock, User as UserIcon, ArrowRight, ShieldCheck, UserCheck, Database } from 'lucide-react';
import { User } from '@/lib/types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, informe seu usuário e senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuick = (quickUser: string, quickPass: string) => {
    setUsername(quickUser);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-white shadow-xl shadow-cyan-500/20 mb-4">
          <Activity className="w-9 h-9 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Laboratório LINUS
        </h2>
        <p className="mt-1 text-sm text-cyan-200/80">
          Acesso Simplificado: Usuário & Senha
        </p>

        {/* Database notice badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-cyan-300 font-medium">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Banco de Dados: Supabase / PostgreSQL</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome de Usuário
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Ex: admin ou mariana"
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all lowercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 text-center uppercase tracking-wider mb-2.5">
              Clique para Entrar Rápido (Demonstração):
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillQuick('admin', '1234')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold">Dr. Roberto (ADM)</span>
                    <span className="text-[11px] text-purple-600 block">Usuário: <strong>admin</strong> | Senha: <strong>1234</strong></span>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-200/80 px-2 py-0.5 rounded font-mono font-bold">ADM</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuick('mariana', '1234')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold">Mariana Souza (Recepção)</span>
                    <span className="text-[11px] text-teal-600 block">Usuário: <strong>mariana</strong> | Senha: <strong>1234</strong></span>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-200/80 px-2 py-0.5 rounded font-mono font-bold">Recepção</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuick('carlos', '1234')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <span className="font-bold">Carlos Eduardo (Atendimento)</span>
                    <span className="text-[11px] text-slate-600 block">Usuário: <strong>carlos</strong> | Senha: <strong>1234</strong></span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-300 px-2 py-0.5 rounded font-mono font-bold">Atendimento</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
