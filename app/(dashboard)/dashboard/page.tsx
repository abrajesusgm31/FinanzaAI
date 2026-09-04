import { FinancialService } from '@/lib/services/financial/FinancialService';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { TransactionService } from '@/lib/services/financial/TransactionService';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const workspaces = await WorkspaceService.listWorkspaces();
  
  if (workspaces.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Bienvenido a FinanzasAI</h2>
        <p className="text-slate-500">Para comenzar, necesitamos que crees tu primer workspace.</p>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium">
          Crear Workspace Personal
        </button>
      </div>
    );
  }

  const workspaceId = (workspaces[0] as any).id;
  const netWorth = await FinancialService.getWorkspaceNetWorth(workspaceId);
  const recentTransactions = await TransactionService.listTransactions(workspaceId, 5);

  // Calcular ingresos y gastos del mes actual (Demo simplificada para la Fase 2)
  // En producción esto iría a una función RPC optimizada
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  // Por ahora mostramos 0 hasta que implementemos el filtrado por fecha en el service
  const monthlyIncome = 0;
  const monthlyExpenses = 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen financiero de { (workspaces[0] as any).name }</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ingresos (Mes)</span>
            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(monthlyIncome)}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gastos (Mes)</span>
            <div className="h-8 w-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(monthlyExpenses)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Balance</span>
            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(monthlyIncome - monthlyExpenses)}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Patrimonio Neto</span>
            <div className="h-8 w-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(netWorth)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transacciones Recientes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Transacciones Recientes</h3>
            <Link href="/transactions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {recentTransactions.map((tx) => {
                 const mainEntry = tx.ledger_entries.find((e: any) => (e.accounts as any).type !== 'equity');
                 const amount = mainEntry ? mainEntry.amount : 0;
                 return (
                   <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${amount < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {amount < 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                       </div>
                       <div>
                         <div className="text-sm font-bold text-slate-900">{tx.description}</div>
                         <div className="text-xs text-slate-500">{new Date(tx.transaction_date).toLocaleDateString('es-ES')}</div>
                       </div>
                     </div>
                     <div className={`text-sm font-bold ${amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                       {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)}
                     </div>
                   </div>
                 );
              })}
              {recentTransactions.length === 0 && (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No hay movimientos recientes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar de Estado */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Estado del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-600 font-medium">Base de Datos: Definida</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-600 font-medium">FinancialService: Activo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-600 font-medium">Ledger splits: Implementado</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-50 leading-relaxed">
              La Fase 2 ha implementado la capa de servicios financieros y la visualización básica del ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
