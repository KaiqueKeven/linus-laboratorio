'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Client, DashboardMetrics } from '@/lib/types';
import { Header } from '@/components/Header';
import { LoginForm } from '@/components/LoginForm';
import { ClientForm } from '@/components/ClientForm';
import { ClientList } from '@/components/ClientList';
import { ClientDetailModal } from '@/components/ClientDetailModal';
import { PrintRecordModal } from '@/components/PrintRecordModal';
import { AdminMetricsView } from '@/components/AdminMetricsView';
import { EmployeeMetricsView } from '@/components/EmployeeMetricsView';
import { EmployeesManagement } from '@/components/EmployeesManagement';
import { InstallAppBanner } from '@/components/InstallAppBanner';
import {
  Activity,
  Users,
  UserPlus,
  ClipboardList,
  BarChart3,
  Layers,
  Calendar,
  Sparkles,
  Plus
} from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Tab State
  // For ADM: 'metrics' | 'clients' | 'employees' | 'new-client'
  // For FUNCIONARIO: 'my-clients' | 'new-client' | 'my-metrics'
  const [activeTab, setActiveTab] = useState<string>('my-clients');

  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Modals
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [printingClient, setPrintingClient] = useState<Client | null>(null);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          setActiveTab(data.user.role === 'ADM' ? 'metrics' : 'my-clients');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingData(true);

    try {
      let clientsUrl = '/api/clients';
      if (currentUser.role === 'ADM' && selectedEmployeeFilter) {
        clientsUrl += `?userId=${selectedEmployeeFilter}`;
      }
      const clientsRes = await fetch(clientsUrl);
      if (clientsRes.ok) {
        const cData = await clientsRes.json();
        setClients(cData.clients || []);
      }

      const metricsRes = await fetch('/api/metrics');
      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData.metrics);
      }

      if (currentUser.role === 'ADM') {
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const eData = await empRes.json();
          setEmployees(eData.employees || []);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser, selectedEmployeeFilter]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setClients([]);
      setMetrics(null);
      setEmployees([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#ed8431] overflow-hidden p-2 mb-4 shadow-2xl shadow-orange-500/30 flex items-center justify-center animate-pulse">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/linus-mark.png" alt="Linus Pauling" className="w-full h-full object-contain" />
        </div>
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span className="text-xs text-orange-200/80 font-medium">Carregando Linus Pauling...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginForm
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setActiveTab(user.role === 'ADM' ? 'metrics' : 'my-clients');
          }}
        />
        <InstallAppBanner />
      </>
    );
  }

  const isAdm = currentUser.role === 'ADM';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none sm:select-auto">
      {/* Top Header */}
      <Header user={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg sm:max-w-2xl lg:max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-28">
        {/* Desktop Tabs Bar (Hidden on Mobile) */}
        <div className="hidden sm:flex bg-white p-2 rounded-2xl shadow-xs border border-slate-200 items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {isAdm ? (
              <>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'metrics'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Métricas (Semana & Mês)</span>
                </button>

                <button
                  onClick={() => setActiveTab('clients')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'clients'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Todos os Clientes ({clients.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('employees')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'employees'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Funcionários ({employees.length})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('my-clients')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'my-clients'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Meus Clientes ({clients.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('my-metrics')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'my-metrics'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Minhas Métricas (Semana / Mês)</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setActiveTab('new-client')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'new-client'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Cliente</span>
          </button>
        </div>

        {/* Tab View Content */}
        {activeTab === 'metrics' && isAdm && metrics && (
          <AdminMetricsView
            metrics={metrics}
            onFilterEmployee={(name) => {
              const emp = employees.find((e) => e.name === name);
              if (emp) {
                setSelectedEmployeeFilter(emp.id);
                setActiveTab('clients');
              }
            }}
          />
        )}

        {activeTab === 'my-metrics' && !isAdm && metrics && (
          <EmployeeMetricsView metrics={metrics} currentUser={currentUser} />
        )}

        {(activeTab === 'clients' || activeTab === 'my-clients') && (
          <ClientList
            clients={clients}
            currentUser={currentUser}
            onSelectClient={(c) => setSelectedClient(c)}
            onPrintClient={(c) => setPrintingClient(c)}
            onNewClientClick={() => setActiveTab('new-client')}
            onRefresh={fetchData}
            selectedEmployeeFilter={selectedEmployeeFilter}
            employeesList={employees}
            onEmployeeFilterChange={(empId) => {
              setSelectedEmployeeFilter(empId);
            }}
          />
        )}

        {activeTab === 'employees' && isAdm && (
          <EmployeesManagement
            employees={employees}
            onViewEmployeeClients={(employeeId) => {
              setSelectedEmployeeFilter(employeeId);
              setActiveTab('clients');
            }}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'new-client' && (
          <ClientForm
            currentUser={currentUser}
            employeesList={employees}
            onSuccess={(newClient) => {
              fetchData();
              setActiveTab(isAdm ? 'clients' : 'my-clients');
              setSelectedClient(newClient);
            }}
            onCancel={() => {
              setActiveTab(isAdm ? 'clients' : 'my-clients');
            }}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {isAdm ? (
            <>
              {/* ADM: Métricas */}
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'text-cyan-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'metrics' ? 'bg-cyan-50' : ''}`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">Métricas</span>
              </button>

              {/* ADM: Clientes */}
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'clients'
                    ? 'text-cyan-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'clients' ? 'bg-cyan-50' : ''}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">Clientes</span>
              </button>

              {/* Middle Action: Novo Cadastro */}
              <button
                onClick={() => setActiveTab('new-client')}
                className="flex flex-col items-center -mt-5 transition-transform active:scale-90 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border-2 border-white">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-cyan-800 mt-1">Cadastrar</span>
              </button>

              {/* ADM: Funcionários */}
              <button
                onClick={() => setActiveTab('employees')}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'employees'
                    ? 'text-cyan-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'employees' ? 'bg-cyan-50' : ''}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">Equipe</span>
              </button>
            </>
          ) : (
            <>
              {/* Funcionário: Meus Clientes */}
              <button
                onClick={() => setActiveTab('my-clients')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'my-clients'
                    ? 'text-cyan-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'my-clients' ? 'bg-cyan-50' : ''}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">Meus Clientes</span>
              </button>

              {/* Middle Action: Novo Cadastro */}
              <button
                onClick={() => setActiveTab('new-client')}
                className="flex flex-col items-center -mt-5 transition-transform active:scale-90 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border-2 border-white">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-cyan-800 mt-1">Cadastrar</span>
              </button>

              {/* Funcionário: Minhas Métricas */}
              <button
                onClick={() => setActiveTab('my-metrics')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'my-metrics'
                    ? 'text-cyan-700 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-1 rounded-xl ${activeTab === 'my-metrics' ? 'bg-cyan-50' : ''}`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none">Métricas</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Modals */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          currentUser={currentUser}
          onClose={() => setSelectedClient(null)}
          onUpdate={(updated) => {
            setSelectedClient(updated);
            fetchData();
          }}
          onDelete={(id) => {
            setSelectedClient(null);
            fetchData();
          }}
          onPrint={(c) => setPrintingClient(c)}
        />
      )}

      {printingClient && (
        <PrintRecordModal
          client={printingClient}
          onClose={() => setPrintingClient(null)}
        />
      )}

      {/* Mobile PWA Install Banner */}
      <InstallAppBanner />
    </div>
  );
}
