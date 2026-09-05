'use client';

import { useState } from 'react';
import { createAccountAction } from '@/app/actions/account';
import { Plus, X } from 'lucide-react';

export function CreateAccountModal({
  workspaceId,
  isOpen,
  onClose,
}: {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState('bank');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('workspaceId', workspaceId);

    try {
      await createAccountAction(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">Nueva Cuenta Financiera</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Nombre de la cuenta</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej. Cuenta Corriente BBVA"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Tipo</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="bank">Banco</option>
                <option value="cash">Efectivo</option>
                <option value="savings">Ahorros</option>
                <option value="credit_card">Tarjeta Crédito</option>
                <option value="loan">Préstamo / Hipoteca</option>
                <option value="investment">Inversión</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Moneda</label>
              <select
                name="currency"
                defaultValue="EUR"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="MXN">MXN ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Institución / Entidad</label>
            <input
              type="text"
              name="institution"
              placeholder="Ej. Santander"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          {type !== 'loan' && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Saldo Inicial</label>
              <input
                type="number"
                step="0.01"
                name="initialBalance"
                defaultValue="0"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          )}

          {type === 'loan' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase">Detalles del Préstamo</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase">Capital Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    name="principalAmount"
                    required
                    placeholder="15000"
                    className="w-full mt-1 px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase">Tasa Interés Anual %</label>
                  <input
                    type="number"
                    step="0.01"
                    name="interestRate"
                    placeholder="3.5"
                    className="w-full mt-1 px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Cuota Mensual Estimada</label>
                <input
                  type="number"
                  step="0.01"
                  name="monthlyInstallment"
                  placeholder="250"
                  className="w-full mt-1 px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
