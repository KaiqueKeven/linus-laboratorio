'use client';

import React from 'react';
import { DashboardMetrics, User } from '@/lib/types';
import { CalendarDays, CalendarRange, Clock, Users, TrendingUp } from 'lucide-react';

interface EmployeeMetricsViewProps {
  metrics: DashboardMetrics;
  currentUser: User;
}

export function EmployeeMetricsView({ metrics, currentUser }: EmployeeMetricsViewProps) {
  const maxDayCount = Math.max(...metrics.clientsPerDay.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Minhas Métricas de Atendimento</h2>
          <p className="text-xs text-teal-100 mt-1">
            Acompanhe o seu desempenho de cadastros de pacientes no Laboratório LINUS.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white">
            {currentUser.department}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Week */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-700">
              <CalendarDays className="w-4 h-4 text-cyan-600" />
              Minha Semana
            </span>
            <span className="text-[10px] bg-cyan-50 text-cyan-700 font-semibold px-2 py-0.5 rounded-full border border-cyan-200">
              Últimos 7 dias
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.weekClients}</span>
            <span className="text-xs text-slate-500">pacientes cadastrados</span>
          </div>
        </div>

        {/* Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
              <CalendarRange className="w-4 h-4 text-indigo-600" />
              Meu Mês
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
              Mês Vigente
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.monthClients}</span>
            <span className="text-xs text-slate-500">pacientes no mês</span>
          </div>
        </div>

        {/* Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
              <Clock className="w-4 h-4 text-amber-500" />
              Meus Cadastros Hoje
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              Hoje
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.todayClients}</span>
            <span className="text-xs text-slate-500">pacientes hoje</span>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
              <Users className="w-4 h-4 text-slate-600" />
              Total na Minha Ficha
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              Histórico
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.totalClients}</span>
            <span className="text-xs text-slate-500">pacientes no total</span>
          </div>
        </div>
      </div>

      {/* Daily registrations bar chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-cyan-600" />
          Seu Ritmo de Cadastros nos Últimos 7 Dias
        </h3>

        <div className="grid grid-cols-7 gap-2 items-end h-40 border-b border-slate-200 pb-2">
          {metrics.clientsPerDay.map((day) => {
            const heightPercent = Math.max(Math.round((day.count / maxDayCount) * 100), 8);
            return (
              <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[11px] font-bold text-slate-700">{day.count}</span>
                <div className="w-full max-w-[32px] bg-slate-100 rounded-t-lg relative flex items-end h-28 overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-md bg-gradient-to-t from-teal-600 to-cyan-400 group-hover:brightness-110 transition-all duration-300"
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 truncate text-center w-full">
                  {day.label.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
