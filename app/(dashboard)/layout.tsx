import { createClient } from '@/lib/supabase/server';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wallet, ArrowLeftRight, CreditCard, PieChart, Repeat, LogOut } from 'lucide-react';
import { WorkspaceHeaderClient } from '@/components/WorkspaceHeaderClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const workspaces = await WorkspaceService.listWorkspaces();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar fijo */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed inset-y-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">FinanzasAI</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-600" /> Dashboard
          </Link>
          <Link
            href="/accounts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Wallet className="w-5 h-5 text-slate-500" /> Cuentas
          </Link>
          <Link
            href="/transactions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5 text-slate-500" /> Transacciones
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <WorkspaceHeaderClient userEmail={user.email || ''} initialWorkspaces={workspaces} />

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
