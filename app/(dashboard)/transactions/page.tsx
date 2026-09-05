import { TransactionService } from '@/lib/services/financial/TransactionService';
import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { AccountService } from '@/lib/services/financial/AccountService';
import { CategoryService } from '@/lib/services/financial/CategoryService';
import { TransactionsClient } from '@/components/TransactionsClient';

export default async function TransactionsPage() {
  const workspaces = await WorkspaceService.listWorkspaces();
  if (workspaces.length === 0) return null;

  const workspaceId = (workspaces[0] as any).id;
  const accounts = await AccountService.listAccounts(workspaceId);
  const categories = await CategoryService.listCategories(workspaceId);
  const transactions = await TransactionService.listTransactions(workspaceId);

  return (
    <TransactionsClient
      workspaceId={workspaceId}
      accounts={accounts}
      categories={categories}
      transactions={transactions}
    />
  );
}
