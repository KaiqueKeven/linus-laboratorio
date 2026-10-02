'use client';

import React, { useState, useMemo } from 'react';
import { User, Client, PaymentType } from '@/lib/types';
import { formatCPF, cleanCPF, validateCPF } from '@/lib/cpf-utils';
import {
  User as UserIcon,
  Stethoscope,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  XCircle,
  CreditCard
} from 'lucide-react';

interface ClientFormProps {
  currentUser: User;
  employeesList?: User[];
  onSuccess: (newClient: Client) => void;
  onCancel?: () => void;
}

export function ClientForm({ currentUser, employeesList = [], onSuccess, onCancel }: ClientFormProps) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [doctorRequest, setDoctorRequest] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Particular');
  const [targetUserId, setTargetUserId] = useState(currentUser.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Real-time CPF analysis
  const cpfDigits = cleanCPF(cpf);
  const cpfValidation = useMemo(() => {
    if (cpfDigits.length === 0) return null;
    return validateCPF(cpfDigits);
  }, [cpfDigits]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCPF(raw);
    setCpf(formatted);
    setError(null);
  };

  // Today formatted
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const selectedEmployeeName = useMemo(() => {
    if (targetUserId === currentUser.id) return currentUser.name;
    const found = employeesList.find((e) => e.id === targetUserId);
    return found ? found.name : currentUser.name;
  }, [targetUserId, currentUser, employeesList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Por favor, informe o nome completo do cliente.');
      return;
    }

    if (cpfDigits.length !== 11) {
      setError(`O CPF precisa ter exatamente 11 dígitos. Você digitou ${cpfDigits.length}/11.`);
      return;
    }

    if (!cpfValidation?.isValid) {
      setError(`CPF inválido: ${cpfValidation?.message || 'Verifique os números digitados'}.`);
      return;
    }

    if (!doctorRequest.trim()) {
      setError('Por favor, informe o nome do doutor responsável pelo encaminhamento.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          cpf: cpf.trim(),
          doctor_request: doctorRequest.trim(),
          payment_type: paymentType,
          user_id: targetUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar cliente.');
      }

      setSuccessMsg('Cliente cadastrado com sucesso!');
      setTimeout(() => {
        onSuccess(data.client);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full pb-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Mobile Header Banner */}
        <div className="bg-gradient-to-br from-cyan-600 to-teal-700 p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Cadastro Rápido
            </span>
            <span className="text-xs text-cyan-100 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {todayFormatted}
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Novo Cadastro de Cliente
          </h2>
          <p className="text-xs text-cyan-100/90 mt-1">
            Preencha os dados do cliente para registrar na sua ficha.
          </p>
        </div>

        {/* Automatic Info Card */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-cyan-600" />
              Funcionário Responsável:
            </span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {selectedEmployeeName} <span className="text-[10px] text-teal-600 font-semibold">(Automático)</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              Data do Cadastro:
            </span>
            <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Hoje <span className="text-[10px] text-slate-400">({todayFormatted})</span>
            </span>
          </div>

          {/* ADM Option to change employee */}
          {currentUser.role === 'ADM' && employeesList.length > 0 && (
            <div className="pt-2 border-t border-slate-200 mt-2">
              <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                Colaborador titular da ficha:
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-white border border-purple-300 text-purple-900 text-xs rounded-xl p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value={currentUser.id}>Minha própria ficha ({currentUser.name})</option>
                {employeesList
                  .filter((emp) => emp.id !== currentUser.id)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (@{emp.username})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* 1. Nome Completo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Nome Completo do Cliente *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Ana Maria dos Santos"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 2. CPF com formatação rigorosa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. CPF do Cliente *
              </label>
              {/* Digit counter & indicator */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  cpfDigits.length === 11
                    ? cpfValidation?.isValid
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {cpfDigits.length === 11 ? (
                  cpfValidation?.isValid ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>11 dígitos (Válido)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span>CPF Inválido</span>
                    </>
                  )
                ) : (
                  <span>{cpfDigits.length}/11 dígitos</span>
                )}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={14}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 border font-mono text-base text-slate-900 focus:bg-white focus:ring-2 focus:outline-none transition-all placeholder:text-slate-400 ${
                  cpfDigits.length === 11
                    ? cpfValidation?.isValid
                      ? 'border-emerald-400 ring-1 ring-emerald-400/30'
                      : 'border-red-400 ring-1 ring-red-400/30'
                    : 'border-slate-200 focus:ring-cyan-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              * Formatação automática: digite apenas os 11 números sem ponto ou traço.
            </p>
          </div>

          {/* 3. Doutor Responsável */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
              3. Doutor Responsável pelo Encaminhamento *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ex: Dr. Lucas Silveira ou Dra. Vanessa Martins"
                value={doctorRequest}
                onChange={(e) => {
                  setDoctorRequest(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 4. Tipo de Atendimento (Particular ou Convênio) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                4. Tipo de Atendimento *
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                (Apenas 2 opções)
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaymentType('Particular')}
                className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  paymentType === 'Particular'
                    ? 'border-[#ed8431] bg-orange-50 text-orange-950 shadow-sm shadow-orange-500/10 ring-2 ring-[#ed8431]/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentType === 'Particular' ? 'border-[#ed8431] bg-[#ed8431]' : 'border-slate-400'
                  }`}
                >
                  {paymentType === 'Particular' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span>Particular</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('Convênio')}
                className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  paymentType === 'Convênio'
                    ? 'border-[#20418f] bg-blue-50 text-blue-950 shadow-sm shadow-blue-500/10 ring-2 ring-[#20418f]/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentType === 'Convênio' ? 'border-[#20418f] bg-[#20418f]' : 'border-slate-400'
                  }`}
                >
                  {paymentType === 'Convênio' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span>Convênio</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={loading || (cpfDigits.length === 11 && !cpfValidation?.isValid)}
              className="w-full py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#ed8431] to-[#d96a19] hover:from-[#f08c3d] hover:to-[#c85e10] active:scale-[0.99] shadow-lg shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Salvar na Minha Ficha</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Voltar para a Lista de Clientes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
