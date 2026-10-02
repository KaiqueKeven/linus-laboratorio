'use client';

import React, { useState, useMemo } from 'react';
import { Client, User } from '@/lib/types';
import { formatDateBr, formatDateTimeBr } from '@/lib/date-utils';
import {
  Search,
  Filter,
  User as UserIcon,
  Stethoscope,
  Calendar,
  Plus,
  RefreshCw,
  UserX,
  CreditCard,
  ChevronRight,
  Printer,
  ShieldCheck
} from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  currentUser: User;
  onSelectClient: (client: Client) => void;
  onPrintClient: (client: Client) => void;
  onNewClientClick: () => void;
  onRefresh: () => void;
  selectedEmployeeFilter?: string | null;
  employeesList?: User[];
  onEmployeeFilterChange?: (employeeId: string | null) => void;
}

export function ClientList({
  clients,
  currentUser,
  onSelectClient,
  onPrintClient,
  onNewClientClick,
  onRefresh,
  selectedEmployeeFilter,
  employeesList = [],
  onEmployeeFilterChange,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(search) ||
        c.cpf.toLowerCase().includes(search) ||
        (c.doctor_request && c.doctor_request.toLowerCase().includes(search)) ||
        (c.user_name && c.user_name.toLowerCase().includes(search));

      const now = new Date();
      const created = new Date(c.created_at);
      let matchesPeriod = true;

      if (periodFilter === 'today') {
        matchesPeriod =
          created.getDate() === now.getDate() &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear();
      } else if (periodFilter === 'week') {
        const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
        matchesPeriod = diffDays <= 7;
      } else if (periodFilter === 'month') {
        matchesPeriod =
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesPeriod;
    });
  }, [clients, searchTerm, periodFilter]);

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4 pb-24">
      {/* Top Search & Actions */}
      <div className="bg-white p-3.5 rounded-3xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, CPF ou doutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={onRefresh}
            title="Atualizar lista"
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filters Row for Mobile */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'today'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'week'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                periodFilter === 'month'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Este Mês
            </button>
          </div>

          {/* ADM Employee Filter */}
          {currentUser.role === 'ADM' && employeesList.length > 0 && onEmployeeFilterChange && (
            <div className="shrink-0">
              <select
                value={selectedEmployeeFilter || ''}
                onChange={(e) => onEmployeeFilterChange(e.target.value || null)}
                className="bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl px-2.5 py-1.5 font-bold focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Todos os Funcionários</option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card Feed */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <UserX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Nenhum cliente encontrado
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            {searchTerm || periodFilter !== 'all'
              ? 'Tente alterar os termos da busca.'
              : 'Nenhum cliente cadastrado nesta ficha ainda.'}
          </p>
          <button
            onClick={onNewClientClick}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 shadow-md shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Cliente Agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs hover:border-cyan-300 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {/* Top Row: Name & Date */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {client.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {client.cpf}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          client.payment_type === 'Convênio'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {client.payment_type || 'Particular'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    {formatDateBr(client.created_at)}
                  </span>
                </div>
              </div>

              {/* Middle Row: Doctor Responsible */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 min-w-0">
                  <Stethoscope className="w-4 h-4 text-cyan-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Encaminhado por:
                    </span>
                    <span className="font-bold text-slate-900 truncate block">
                      {client.doctor_request || 'Não informado'}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>

              {/* Footer: Responsible Employee (Important when ADM views or multiple accounts) */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Atendente: <strong className="text-slate-800">{client.user_name || 'Funcionário'}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrintClient(client);
                  }}
                  title="Imprimir protocolo"
                  className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
