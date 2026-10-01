'use client';

import React from 'react';
import { DashboardMetrics, User } from '@/lib/types';
import {
  CalendarDays,
  CalendarRange,
  Users,
  TrendingUp,
  Activity,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface AdminMetricsViewProps {
  metrics: DashboardMetrics;
  onFilterEmployee?: (employeeName: string) => void;
}

export function AdminMetricsView({ metrics, onFilterEmployee }: AdminMetricsViewProps) {
  const maxDayCount = Math.max(...metrics.clientsPerDay.map((d) => d.count), 1);
  const maxEmployeeWeek = Math.max(...metrics.clientsPerEmployee.map((e) => e.weekCount), 1);

  return (
    <div className="space-y-6">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Semana (Requested by user) */}
        <div className="bg-gradient-to-br from-cyan-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-cyan-600/15 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-10 text-white pointer-events-none">
            <CalendarDays className="w-28 h-28" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-100 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-cyan-200" />
              Cadastros na Semana
            </span>
            <span className="text-[10px] bg-white/20 backdrop-blur-xs font-semibold px-2 py-0.5 rounded-full">
              Últimos 7 dias
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {metrics.weekClients}
            </span>
            <span className="text-xs text-cyan-100">pacientes cadastrados</span>
          </div>
          <p className="text-xs text-cyan-100/90 mt-2 font-medium">
            Média de {(metrics.weekClients / 7).toFixed(1)} cadastros/dia
          </p>
        </div>

        {/* Metric 2: Mês (Requested by user) */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-2xl p-5 text-white shadow-lg shadow-indigo-700/15 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-10 text-white pointer-events-none">
            <CalendarRange className="w-28 h-28" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-indigo-200" />
              Cadastros no Mês
            </span>
            <span className="text-[10px] bg-white/20 backdrop-blur-xs font-semibold px-2 py-0.5 rounded-full">
              Mês Atual
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {metrics.monthClients}
            </span>
            <span className="text-xs text-indigo-100">pacientes no mês</span>
          </div>
          <p className="text-xs text-indigo-100/90 mt-2 font-medium">
            Consolidado mensal de atendimentos
          </p>
        </div>

        {/* Metric 3: Hoje */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-600">
              <Clock className="w-4 h-4 text-amber-500" />
              Cadastros Hoje
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
              Tempo Real
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.todayClients}
            </span>
            <span className="text-xs text-slate-500">novas fichas</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Atendimentos iniciados no dia de hoje
          </p>
        </div>

        {/* Metric 4: Total Geral */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-cyan-600" />
              Total da Base
            </span>
            <span className="text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 font-semibold px-2 py-0.5 rounded-full">
              Histórico
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.totalClients}
            </span>
            <span className="text-xs text-slate-500">pacientes totais</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Registrados por toda a equipe do LINUS
          </p>
        </div>
      </div>

      {/* Grid: Weekly Bar Chart & Employee Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Registrations Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Cadastros por Dia da Semana
              </h3>
              <p className="text-xs text-slate-500">
                Evolução diária de novos pacientes no laboratório
              </p>
            </div>
            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg">
              Semana Atual
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 items-end h-44 border-b border-slate-200 pb-2">
              {metrics.clientsPerDay.map((day) => {
                const heightPercent = Math.max(Math.round((day.count / maxDayCount) * 100), 8);
                const isToday = day.label.includes('Hoje') || day === metrics.clientsPerDay[metrics.clientsPerDay.length - 1];

                return (
                  <div key={day.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[11px] font-bold text-slate-700 opacity-90 group-hover:opacity-100 transition-opacity">
                      {day.count}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg relative flex items-end h-32 overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-t from-cyan-600 to-teal-400 shadow-md shadow-cyan-500/30'
                            : 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-cyan-500 group-hover:to-cyan-400'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 truncate text-center w-full">
                      {day.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span>Dias anteriores</span>
              <span>Hoje</span>
            </div>
          </div>
        </div>

        {/* Employee Performance (Semana & Mês) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Métrica por Funcionário (Semana & Mês)
              </h3>
              <p className="text-xs text-slate-500">
                Volume de pacientes cadastrados por cada colaborador
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {metrics.clientsPerEmployee.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum funcionário cadastrado.</p>
            ) : (
              metrics.clientsPerEmployee.map((emp, index) => {
                const percent = Math.min(Math.round((emp.weekCount / maxEmployeeWeek) * 100), 100);

                return (
                  <div
                    key={emp.username}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {index + 1}º
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800">{emp.name}</span>
                          <span className="text-[11px] font-mono text-cyan-700 block">@{emp.username}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Na Semana</span>
                            <span className="font-extrabold text-cyan-700 text-sm">{emp.weekCount}</span>
                          </div>
                          <div className="border-l border-slate-200 pl-3">
                            <span className="text-[10px] text-slate-400 block uppercase">No Mês</span>
                            <span className="font-extrabold text-indigo-700 text-sm">{emp.monthCount}</span>
                          </div>
                          <div className="border-l border-slate-200 pl-3">
                            <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                            <span className="font-bold text-slate-700 text-sm">{emp.count}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
                      <div
                        style={{ width: `${percent}%` }}
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Insights: Payment type and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Type */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-600" />
            Distribuição por Modalidade de Atendimento
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {metrics.paymentDistribution.map((item) => (
              <div key={item.type} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">{item.type}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-800">{item.count}</span>
                  <span className="text-[11px] text-slate-400">
                    ({metrics.totalClients ? Math.round((item.count / metrics.totalClients) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-600" />
            Situação Atual dos Pacientes no Laboratório
          </h4>
          <div className="flex flex-wrap gap-2">
            {metrics.statusDistribution.map((item) => (
              <div
                key={item.status}
                className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex-1 min-w-[130px]"
              >
                <span className="text-[11px] text-slate-500 block truncate">{item.status}</span>
                <span className="text-lg font-bold text-slate-800 mt-0.5 block">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
