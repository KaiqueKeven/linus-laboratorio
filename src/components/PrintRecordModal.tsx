'use client';

import React from 'react';
import { Client } from '@/lib/types';
import { formatDateBr, formatDateTimeBr } from '@/lib/date-utils';
import { Printer, X, Activity, ShieldCheck } from 'lucide-react';

interface PrintRecordModalProps {
  client: Client;
  onClose: () => void;
}

export function PrintRecordModal({ client, onClose }: PrintRecordModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Modal Controls (Not printed) */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-white">
            <Printer className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-sm">Ficha de Atendimento Laboratorial</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Ficha
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div id="printable-record" className="p-8 space-y-6 text-slate-800 text-xs font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ed8431] overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/linus-mark.png"
                  alt="Laboratório Linus Pauling"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#20418f]">
                  LINUS PAULING
                </h1>
                <p className="text-[11px] text-slate-700 font-semibold">
                  Laboratórios de Análises Clínicas
                </p>
                <p className="text-[10px] text-slate-400">
                  CNPJ: 12.345.678/0001-90 • Resp. Técnico: Dr. Roberto Linus CRBM 1234
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-100 border border-slate-300 font-mono text-[11px] px-2.5 py-1 rounded font-bold text-slate-800">
                PROT: #{client.id.slice(-8).toUpperCase()}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                Data do Registro: {formatDateTimeBr(client.created_at)}
              </p>
            </div>
          </div>

          {/* Attendant info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
            <div>
              <span className="font-bold text-slate-700">Atendente / Responsável pelo Cadastro:</span>{' '}
              <span className="font-semibold text-cyan-800">{client.user_name || 'Funcionário LINUS'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Status Atual:</span>{' '}
              <span className="font-semibold text-slate-900 uppercase">{client.status}</span>
            </div>
          </div>

          {/* Patient Details */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              1. Identificação do Paciente
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 block">Nome Completo:</span>
                <span className="font-bold text-sm text-slate-900">{client.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CPF:</span>
                <span className="font-mono font-semibold">{client.cpf}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">RG:</span>
                <span>{client.rg || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Data de Nascimento:</span>
                <span>{formatDateBr(client.birth_date)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Sexo:</span>
                <span>{client.gender || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Telefone / WhatsApp:</span>
                <span className="font-semibold">{client.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">E-mail:</span>
                <span>{client.email || 'Não informado'}</span>
              </div>
            </div>

            {client.address && (
              <div className="mt-2 text-[11px] text-slate-600">
                <span className="font-semibold">Endereço:</span> {client.address} - {client.city}/{client.state} (CEP: {client.zip_code || '-'})
              </div>
            )}
          </div>

          {/* Insurance / Payment */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              2. Faturamento & Convênio
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">Modalidade:</span>
                <span className="font-bold text-slate-900">{client.payment_type}</span>
              </div>
              {client.payment_type === 'Convênio' && (
                <>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Operadora:</span>
                    <span className="font-semibold text-slate-800">{client.health_insurance_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nº da Carteira:</span>
                    <span className="font-mono text-slate-800">{client.insurance_card_number || '-'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Exams Requested */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              3. Pedido Médico & Exames Solicitados
            </h3>
            {client.doctor_request && (
              <p className="text-[11px] mb-2">
                <span className="font-semibold text-slate-700">Médico Solicitante:</span>{' '}
                <span className="text-slate-900">{client.doctor_request}</span>
              </p>
            )}

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Exames Cadastrados:
              </span>
              <p className="font-medium text-slate-900 text-xs leading-relaxed">
                {client.requested_exams}
              </p>
            </div>

            {client.clinical_notes && (
              <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <span className="font-bold">Observações Clínicas:</span> {client.clinical_notes}
              </div>
            )}
          </div>

          {/* Signatures & Instructions */}
          <div className="pt-6 border-t border-slate-200 space-y-8">
            <div className="grid grid-cols-2 gap-8 text-center text-[10px] text-slate-600">
              <div>
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
                <span>Assinatura do Paciente / Responsável</span>
              </div>
              <div>
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
                <span>{client.user_name || 'Funcionário Responsável'} - Atendimento LINUS</span>
              </div>
            </div>

            <div className="bg-slate-100 p-3 rounded-lg text-[9px] text-slate-500 flex items-center justify-between">
              <span>Para consultar seus laudos online, acesse o portal do Laboratório LINUS com o protocolo acima.</span>
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                Documento Autenticado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
