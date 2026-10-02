'use client';

import React from 'react';
import { User } from '@/lib/types';
import { Activity, LogOut, Shield, User as UserIcon, Calendar } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-orange-200 bg-[#ed8431] flex items-center justify-center p-1 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/linus-mark.png"
                alt="Logo Linus Pauling"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#20418f] font-sans">
                  LINUS PAULING
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wider">
                  Laboratório
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Laboratórios de Análises Clínicas
              </p>
            </div>
          </div>

          {/* User info & Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{todayFormatted}</span>
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 mt-0.5">
                  {user.role === 'ADM' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      <Shield className="w-3 h-3" />
                      Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      <UserIcon className="w-3 h-3" />
                      Funcionário ({user.department})
                    </span>
                  )}
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>

              <button
                onClick={onLogout}
                title="Sair do sistema"
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
