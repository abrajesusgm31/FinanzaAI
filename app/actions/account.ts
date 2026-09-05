'use server';

import { AccountService } from '@/lib/services/financial/AccountService';
import { FinancialService } from '@/lib/services/financial/FinancialService';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAccountAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;
  const name = formData.get('name') as string;
  const type = formData.get('type') as any;
  const institution = formData.get('institution') as string;
  const currency = (formData.get('currency') as string) || 'USD';
  const initialBalance = parseFloat((formData.get('initialBalance') as string) || '0');

  // Campos opcionales para Préstamo
  const principalAmount = parseFloat((formData.get('principalAmount') as string) || '0');
  const interestRate = parseFloat((formData.get('interestRate') as string) || '0');
  const monthlyInstallment = parseFloat((formData.get('monthlyInstallment') as string) || '0');
  const startDate = (formData.get('startDate') as string) || new Date().toISOString().split('T')[0];

  if (!workspaceId || !name || !type) {
    throw new Error('Datos obligatorios faltantes.');
  }

  // 1. Crear cuenta base
  const account = await AccountService.createAccount({
    workspace_id: workspaceId,
    name: name.trim(),
    type,
    institution: institution?.trim() || null,
    currency,
    is_active: true,
  });

  // 2. Si es tipo Loan, insertar detalles en account_loans
  if (type === 'loan') {
    const supabase = await createClient();
    const { error: loanError } = await supabase
      .from('account_loans')
      .insert({
        account_id: account.id,
        principal_amount: principalAmount > 0 ? principalAmount : 1000,
        interest_rate: interestRate,
        monthly_installment: monthlyInstallment,
        start_date: startDate,
      });

    if (loanError) console.error('Error in account_loans insert:', loanError);
  }

  // 3. Si tiene saldo inicial y no es equity, registrar en el ledger contra la cuenta de Equity
  if (initialBalance !== 0 && type !== 'equity') {
    const supabase = await createClient();
    
    // Obtener cuenta de Equity del workspace
    const { data: equityAcc } = await supabase
      .from('accounts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('type', 'equity')
      .single();

    if (equityAcc) {
      await FinancialService.createTransaction({
        workspaceId,
        type: 'adjustment',
        description: `Saldo inicial para ${account.name}`,
        transactionDate: new Date().toISOString().split('T')[0],
        entries: [
          { account_id: account.id, amount: initialBalance, currency },
          { account_id: equityAcc.id, amount: -initialBalance, currency },
        ],
      });
    }
  }

  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  return account;
}
