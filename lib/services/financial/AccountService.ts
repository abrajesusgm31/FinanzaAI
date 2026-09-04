import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export class AccountService {
  static async listAccounts(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_credit_cards (*),
        account_loans (*)
      `)
      .eq('workspace_id', workspaceId)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async getAccount(accountId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_credit_cards (*),
        account_loans (*)
      `)
      .eq('id', accountId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createAccount(account: AccountInsert) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAccount(id: string, account: AccountUpdate) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('accounts')
      .update(account)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
