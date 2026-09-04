import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type TransactionType = Database['public']['Enums']['transaction_type'];
export type EntryInsert = {
  account_id: string;
  category_id?: string | null;
  amount: number;
  currency?: string;
};

export class FinancialService {
  /**
   * Crea una transacción genérica en el ledger (Double Entry)
   */
  static async createTransaction(params: {
    workspaceId: string;
    type: TransactionType;
    description: string;
    transactionDate: string;
    merchant?: string | null;
    entries: EntryInsert[];
  }) {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('fn_create_financial_transaction', {
      p_workspace_id: params.workspaceId,
      p_type: params.type,
      p_description: params.description,
      p_transaction_date: params.transactionDate,
      p_merchant: params.merchant || null,
      p_entries: params.entries as any,
    });

    if (error) {
      console.error('Error in FinancialService.createTransaction:', error);
      throw error;
    }

    return data;
  }

  /**
   * Registro especializado de pago de préstamo (Banco -> Préstamo + Equity para intereses/comisiones)
   */
  static async registerLoanPayment(params: {
    workspaceId: string;
    loanAccountId: string;
    sourceAccountId: string;
    equityAccountId: string;
    principalPaid: number;
    interestPaid: number;
    commissionPaid: number;
    interestCategoryId: string;
    commissionCategoryId?: string | null;
    transactionDate: string;
    description: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('fn_register_loan_payment', {
      p_workspace_id: params.workspaceId,
      p_loan_account_id: params.loanAccountId,
      p_source_account_id: params.sourceAccountId,
      p_equity_account_id: params.equityAccountId,
      p_principal_paid: params.principalPaid,
      p_interest_paid: params.interestPaid,
      p_commission_paid: params.commissionPaid,
      p_interest_category_id: params.interestCategoryId,
      p_commission_category_id: params.commissionCategoryId || null,
      p_transaction_date: params.transactionDate,
      p_description: params.description,
    });

    if (error) {
      console.error('Error in FinancialService.registerLoanPayment:', error);
      throw error;
    }

    return data;
  }

  /**
   * Obtiene el saldo actual de una cuenta sumando sus movimientos
   */
  static async getAccountBalance(accountId: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('amount')
      .eq('account_id', accountId);

    if (error) throw error;

    return data.reduce((sum, entry) => sum + Number(entry.amount), 0);
  }

  /**
   * Obtiene el patrimonio neto del workspace (Suma de Activos y Pasivos reales)
   */
  static async getWorkspaceNetWorth(workspaceId: string) {
    const supabase = await createClient();
    
    // Obtenemos cuentas que NO sean de tipo 'equity'
    const { data: accounts, error: accError } = await supabase
      .from('accounts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .not('type', 'eq', 'equity');

    if (accError) throw accError;
    if (!accounts || accounts.length === 0) return 0;

    const accountIds = accounts.map(a => a.id);

    const { data: entries, error: entError } = await supabase
      .from('ledger_entries')
      .select('amount')
      .in('account_id', accountIds);

    if (entError) throw entError;

    return entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  }
}
