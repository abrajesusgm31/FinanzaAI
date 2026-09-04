import { TransactionService } from '@/lib/services/financial/TransactionService';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';

const TYPE_ICONS: Record<string, any> = {
  income: { icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  expense: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50' },
  transfer: { icon: ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-50' },
  loan_payment: { icon: ArrowUpRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  adjustment: { icon: Filter, color: 'text-slate-600', bg: 'bg-slate-50' },
};

export default async function TransactionsPage() {
  const workspaces = await WorkspaceService.listWorkspaces();
  if (workspaces.length === 0) return null;

  const workspaceId = (workspaces[0] as any).id;
  const transactions = await TransactionService.listTransactions(workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transacciones</h1>
          <p className="text-sm text-slate-500">Historial completo de movimientos financieros.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Transacción
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por descripción, comercio o monto..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
               <Filter className="w-4 h-4" /> Filtros
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Cuenta</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {transactions.map((tx) => {
                const config = TYPE_ICONS[tx.type] || TYPE_ICONS.adjustment;
                const Icon = config.icon;
                
                // Para el listado rápido, mostramos la primera cuenta de activo/pasivo involucrada
                const mainEntry = tx.ledger_entries.find((e: any) => (e.accounts as any).type !== 'equity');
                const amount = mainEntry ? mainEntry.amount : 0;
                const isNegative = amount < 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(tx.transaction_date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      {tx.merchant && <div className="text-xs text-slate-400">{tx.merchant}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {mainEntry ? (mainEntry.accounts as any).name : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {tx.type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: mainEntry?.currency || 'USD' }).format(amount)}
                    </td>
                  </tr>
                );
              })}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No hay transacciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
