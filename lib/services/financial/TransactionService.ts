import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export class TransactionService {
  static async listTransactions(workspaceId: string, limit = 50) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ledger_transactions')
      .select(`
        *,
        ledger_entries (
          *,
          accounts (name, type)
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}
