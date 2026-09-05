import { AccountService } from '@/lib/services/financial/AccountService';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { FinancialService } from '@/lib/services/financial/FinancialService';
import { AccountsClient } from '@/components/AccountsClient';

export default async function AccountsPage() {
  const workspaces = await WorkspaceService.listWorkspaces();
  
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">No tienes workspaces</h2>
        <p className="text-slate-500 mb-6">Crea uno para empezar a gestionar tus finanzas.</p>
      </div>
    );
  }

  const workspaceId = (workspaces[0] as any).id;
  const accounts = await AccountService.listAccounts(workspaceId);

  const accountsWithBalance = await Promise.all(
    accounts.map(async (acc) => ({
      ...acc,
      balance: await FinancialService.getAccountBalance(acc.id)
    }))
  );

  return <AccountsClient workspaceId={workspaceId} accountsWithBalance={accountsWithBalance} />;
}
