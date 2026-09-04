import { AccountService } from '@/lib/services/financial/AccountService';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { FinancialService } from '@/lib/services/financial/FinancialService';
import Link from 'next/link';
import { Plus, Wallet, CreditCard, Landmark, PiggyBank, TrendingUp, HelpCircle, ArrowDownCircle } from 'lucide-react';

const TYPE_ICONS: Record<string, any> = {
  bank: Landmark,
  cash: Wallet,
  credit_card: CreditCard,
  loan: ArrowDownCircle,
  savings: PiggyBank,
  investment: TrendingUp,
  other: HelpCircle,
};

export default async function AccountsPage() {
  const workspaces = await WorkspaceService.listWorkspaces();
  
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">No tienes workspaces</h2>
        <p className="text-slate-500 mb-6">Crea uno para empezar a gestionar tus finanzas.</p>
        <Link href="/dashboard" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Por ahora tomamos el primer workspace
  const workspaceId = (workspaces[0] as any).id;
  const accounts = await AccountService.listAccounts(workspaceId);

  // Obtener saldos reales en paralelo
  const accountsWithBalance = await Promise.all(
    accounts.map(async (acc) => ({
      ...acc,
      balance: await FinancialService.getAccountBalance(acc.id)
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuentas Financieras</h1>
          <p className="text-sm text-slate-500">Gestiona tus bancos, efectivo, tarjetas y préstamos.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
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
              <div className="mt-4 pt-4 border-t border-slate-50">
                <Link href={`/accounts/${account.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Ver movimientos &rarr;
                </Link>
              </div>
            </div>
          );
        })}

        {accountsWithBalance.length === 0 && (
          <div className="md:col-span-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500">No has creado ninguna cuenta todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
