'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Wallet, CreditCard, Landmark, PiggyBank, TrendingUp, HelpCircle, ArrowDownCircle } from 'lucide-react';
import { CreateAccountModal } from './CreateAccountModal';

const TYPE_ICONS: Record<string, any> = {
  bank: Landmark,
  cash: Wallet,
  credit_card: CreditCard,
  loan: ArrowDownCircle,
  savings: PiggyBank,
  investment: TrendingUp,
  other: HelpCircle,
};

export function AccountsClient({
  workspaceId,
  accountsWithBalance,
}: {
  workspaceId: string;
  accountsWithBalance: any[];
}) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuentas Financieras</h1>
          <p className="text-sm text-slate-500">Gestiona tus bancos, efectivo, tarjetas y préstamos.</p>
        </div>
        <button
          onClick={() => setIsAccountModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva Cuenta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accountsWithBalance.filter(a => a.type !== 'equity').map((account) => {
          const Icon = TYPE_ICONS[account.type] || HelpCircle;
          const isNegative = account.balance < 0;

          return (
            <div key={account.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  {account.type}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 truncate">{account.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{account.institution || 'Sin institución'}</p>
                <div className={`text-xl font-bold ${isNegative ? 'text-red-600' : 'text-slate-900'}`}>
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: account.currency }).format(account.balance)}
                </div>
              </div>
            </div>
          );
        })}

        {accountsWithBalance.filter(a => a.type !== 'equity').length === 0 && (
          <div className="md:col-span-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500 mb-4">No has creado ninguna cuenta todavía.</p>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Crear tu primera cuenta
            </button>
          </div>
        )}
      </div>

      <CreateAccountModal
        workspaceId={workspaceId}
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
}
