'use client';

import { useState } from 'react';
import { createTransactionAction } from '@/app/actions/transaction';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CreditCard } from 'lucide-react';

export function CreateTransactionModal({
  workspaceId,
  accounts,
  categories,
  isOpen,
  onClose,
}: {
  workspaceId: string;
  accounts: any[];
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<'income' | 'expense' | 'transfer' | 'loan_payment'>('expense');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('workspaceId', workspaceId);
    formData.append('type', type);

    try {
      await createTransactionAction(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al registrar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const assetAccounts = accounts.filter(a => a.type !== 'equity' && a.type !== 'loan');
  const loanAccounts = accounts.filter(a => a.type === 'loan');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">Nueva Transacción</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Switcher de tipo */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600'}`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${type === 'transfer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Traspaso
          </button>
          <button
            type="button"
            onClick={() => setType('loan_payment')}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${type === 'loan_payment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Préstamo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Descripción</label>
            <input
              type="text"
              name="description"
              required
              placeholder="Ej. Compra Supermercado / Recibo Cuota Préstamo"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Fecha</label>
              <input
                type="date"
                name="transactionDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Comercio / Entidad</label>
              <input
                type="text"
                name="merchant"
                placeholder="Ej. Mercadona"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          {(type === 'income' || type === 'expense') && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Cuenta</label>
                  <select
                    name="accountId"
                    required
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">Selecciona cuenta</option>
                    {accounts.filter(a => a.type !== 'equity').map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="50.00"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Categoría</label>
                <select
                  name="categoryId"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === 'transfer' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Desde Cuenta</label>
                  <select
                    name="fromAccountId"
                    required
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">Selecciona origen</option>
                    {assetAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Hacia Cuenta</label>
                  <select
                    name="toAccountId"
                    required
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">Selecciona destino</option>
                    {assetAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Monto a Transferir</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  required
                  placeholder="100.00"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none font-bold"
                />
              </div>
            </>
          )}

          {type === 'loan_payment' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-indigo-700 uppercase">Desglose de Cuota del Préstamo</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase">Cuenta Préstamo</label>
                  <select
                    name="loanAccountId"
                    required
                    className="w-full mt-1 px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="">Préstamo a pagar</option>
                    {loanAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase">Cuenta de Origen (Pago)</label>
                  <select
                    name="sourceAccountId"
                    required
                    className="w-full mt-1 px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="">Banco de donde sale el dinero</option>
                    {assetAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Principal (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="principalPaid"
                    placeholder="170.84"
                    required
                    className="w-full mt-1 px-2 py-1.5 border rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Intereses (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="interestPaid"
                    placeholder="88.51"
                    required
                    className="w-full mt-1 px-2 py-1.5 border rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Comisión (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="commissionPaid"
                    placeholder="0.00"
                    defaultValue="0"
                    className="w-full mt-1 px-2 py-1.5 border rounded-lg text-xs font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase">Categoría Intereses</label>
                <select
                  name="interestCategoryId"
                  className="w-full mt-1 px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                >
                  <option value="">Selecciona categoría para reporte de intereses</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
              {loading ? 'Registrando...' : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
