'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import {
  Users,
  UserPlus,
  CalendarDays,
  CalendarRange,
  X,
  Eye,
  User as UserIcon,
  Lock,
  Building
} from 'lucide-react';

interface EmployeeWithMetrics extends User {
  total_clients: number;
  week_clients: number;
  month_clients: number;
}

interface EmployeesManagementProps {
  employees: EmployeeWithMetrics[];
  onViewEmployeeClients: (employeeId: string) => void;
  onRefresh: () => void;
}

export function EmployeesManagement({
  employees,
  onViewEmployeeClients,
  onRefresh,
}: EmployeesManagementProps) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Recepção e Coleta');
  const [role, setRole] = useState<'FUNCIONARIO' | 'ADM'>('FUNCIONARIO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !password) {
      setError('Preencha o usuário, nome e senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, password, department, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar funcionário.');
      }

      setShowNewModal(false);
      setUsername('');
      setName('');
      setPassword('');
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (employee: EmployeeWithMetrics) => {
    const newStatus = employee.active === 1 ? 0 : 1;
    const action = newStatus === 1 ? 'ativar' : 'desativar';

    if (!confirm(`Deseja realmente ${action} o acesso de @${employee.username}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: employee.id, active: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao alterar status.');
      }

      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Gestão de Funcionários & Métricas Individuais
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe a produtividade semanal e mensal da equipe do Laboratório LINUS.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Novo Colaborador (Usuário & Senha)</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const isAdm = emp.role === 'ADM';

          return (
            <div
              key={emp.id}
              className={`bg-white rounded-2xl border ${
                emp.active === 1 ? 'border-slate-200' : 'border-red-200 bg-red-50/20'
              } p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md`}
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] font-mono text-cyan-700 font-semibold flex items-center gap-1 mt-0.5">
                        @{emp.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isAdm
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}
                  >
                    {isAdm ? 'ADM' : 'FUNCIONÁRIO'}
                  </span>
                </div>

                {/* Department */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium">Departamento:</span>
                  <span className="font-semibold text-slate-800">{emp.department}</span>
                </div>

                {/* Metrics Breakdown (Semana e Mês) */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-gradient-to-b from-slate-50 to-white p-3 rounded-xl border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Semana
                    </span>
                    <span className="text-xl font-extrabold text-cyan-700">
                      {emp.week_clients}
                    </span>
                    <span className="text-[9px] text-slate-400 block">pacientes</span>
                  </div>

                  <div className="border-x border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Mês
                    </span>
                    <span className="text-xl font-extrabold text-indigo-700">
                      {emp.month_clients}
                    </span>
                    <span className="text-[9px] text-slate-400 block">pacientes</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Total
                    </span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {emp.total_clients}
                    </span>
                    <span className="text-[9px] text-slate-400 block">histórico</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onViewEmployeeClients(emp.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha de Pacientes</span>
                </button>

                {!isAdm && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(emp)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      emp.active === 1
                        ? 'text-slate-500 hover:text-red-700 hover:bg-red-50'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {emp.active === 1 ? 'Desativar' : 'Reativar'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Employee Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm">Cadastrar Novo Colaborador</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nome de Usuário (Login) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm font-mono">@</span>
                  <input
                    type="text"
                    required
                    placeholder="ex: juliana ou lucas"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="w-full pl-8 pr-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono lowercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Juliana Mendes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ex: 1234"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Departamento
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Recepção e Coleta">Recepção e Coleta</option>
                    <option value="Atendimento ao Paciente">Atendimento ao Paciente</option>
                    <option value="Triagem e Exames">Triagem e Exames</option>
                    <option value="Laboratório / Bioquímica">Laboratório / Bioquímica</option>
                    <option value="Administração">Administração</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nível de Acesso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="FUNCIONARIO">Funcionário</option>
                    <option value="ADM">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Cadastrar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
