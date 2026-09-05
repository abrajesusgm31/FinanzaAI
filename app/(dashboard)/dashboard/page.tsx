import { FinancialService } from '@/lib/services/financial/FinancialService';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { TransactionService } from '@/lib/services/financial/TransactionService';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const workspaces = await WorkspaceService.listWorkspaces();
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get('activeWorkspaceId')?.value || (workspaces.length > 0 ? (workspaces[0] as any).id : '');
  
  let netWorth = 0;
  let recentTransactions = [];

  if (activeWorkspaceId) {
      netWorth = await FinancialService.getWorkspaceNetWorth(activeWorkspaceId);
      recentTransactions = await TransactionService.listTransactions(activeWorkspaceId, 5);
  }

  return (
    <DashboardClient
      initialWorkspaces={workspaces}
      netWorth={netWorth}
      recentTransactions={recentTransactions}
    />
  );
}
