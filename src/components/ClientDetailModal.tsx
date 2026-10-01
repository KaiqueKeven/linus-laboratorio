'use client';

import React, { useState } from 'react';
import { Client, User } from '@/lib/types';
import { formatDateBr, formatDateTimeBr } from '@/lib/date-utils';
import {
  X,
  Printer,
  Trash2,
  Edit,
  Save,
  User as UserIcon,
  Stethoscope,
  Calendar,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface ClientDetailModalProps {
  client: Client;
  currentUser: User;
  onClose: () => void;
  onUpdate: (updated: Client) => void;
  onDelete: (id: string) => void;
  onPrint: (client: Client) => void;
}

export function ClientDetailModal({
  client,
  currentUser,
  onClose,
  onUpdate,
  onDelete,
  onPrint,
}: ClientDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(client.name);
  const [doctorRequest, setDoctorRequest] = useState(client.doctor_request || '');

  const canEdit = currentUser.role === 'ADM' || client.user_id === currentUser.id;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('O nome do cliente não pode ficar em branco.');
      return;
    }
    if (!doctorRequest.trim()) {
      setError('O nome do doutor responsável não pode ficar em branco.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          doctor_request: doctorRequest.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar dados do cliente.');
      }

      onUpdate(data.client);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Deseja excluir a ficha de ${client.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir cadastro.');
      }
      onDelete(client.id);
      onClose();
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Ficha do Cliente</h3>
              <p className="text-xs text-slate-400">
                Registrado em {formatDateBr(client.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPrint(client)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Imprimir protocolo"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Client Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nome Completo do Cliente
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              ) : (
                <p className="text-base font-black text-slate-900 mt-0.5">{client.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  CPF (Verificado)
                </span>
                <span className="font-mono text-sm font-bold text-slate-800 block mt-0.5">
                  {client.cpf}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Data do Cadastro
                </span>
                <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                  {formatDateTimeBr(client.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Responsible */}
          <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 space-y-1">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
              Doutor Responsável pelo Encaminhamento
            </span>
            {isEditing ? (
              <input
                type="text"
                value={doctorRequest}
                onChange={(e) => setDoctorRequest(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white border border-cyan-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
              />
            ) : (
              <p className="text-sm font-bold text-slate-900 pt-0.5">
                {client.doctor_request || 'Não informado'}
              </p>
            )}
          </div>

          {/* Attendant Info (Automatic) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Atendente Responsável:
                </span>
                <span className="font-bold text-slate-800">
                  {client.user_name || 'Funcionário'}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-semibold">
              Automático
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Excluir cadastro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Editar
              </button>
            )}

            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onPrint(client)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
