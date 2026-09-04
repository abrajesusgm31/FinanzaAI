import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard General</h1>
          <p className="text-sm text-slate-500">Resumen y métricas financieras de tu workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos (Mes)</span>
          <div className="text-2xl font-bold text-slate-900">$0.00</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos (Mes)</span>
          <div className="text-2xl font-bold text-slate-900">$0.00</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</span>
          <div className="text-2xl font-bold text-slate-900">$0.00</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patrimonio Neto</span>
          <div className="text-2xl font-bold text-indigo-600">$0.00</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900">Estado del Sistema</h3>
        <p className="text-sm text-slate-600">
          Fase 1 completada exitosamente. La infraestructura de base de datos con ledger centralizado, migraciones SQL, políticas RLS, funciones de seguridad y autenticación SSR se encuentra configurada y lista.
        </p>
      </div>
    </div>
  );
}
