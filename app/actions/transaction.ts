'use server';

import { FinancialService } from '@/lib/services/financial/FinancialService';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTransactionAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;
  const type = formData.get('type') as 'income' | 'expense' | 'transfer' | 'loan_payment';
  const description = formData.get('description') as string;
  const transactionDate = (formData.get('transactionDate') as string) || new Date().toISOString().split('T')[0];
  const merchant = formData.get('merchant') as string;

  if (!workspaceId || !description || !type) {
    throw new Error('Datos obligatorios faltantes.');
  }

  const supabase = await createClient();

  // Obtener cuenta de Equity del workspace
  const { data: equityAcc } = await supabase
    .from('accounts')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('type', 'equity')
    .single();

  if (!equityAcc) throw new Error('Cuenta de Equity del workspace no encontrada.');

  if (type === 'income') {
    const accountId = formData.get('accountId') as string;
    const categoryId = formData.get('categoryId') as string;
    const amount = Math.abs(parseFloat(formData.get('amount') as string));

    if (!accountId || isNaN(amount) || amount <= 0) throw new Error('Monto y cuenta válidos requeridos.');

    await FinancialService.createTransaction({
      workspaceId,
      type: 'income',
      description,
      transactionDate,
      merchant,
      entries: [
        { account_id: accountId, amount: amount },
        { account_id: equityAcc.id, category_id: categoryId || null, amount: -amount },
      ],
    });
  } else if (type === 'expense') {
    const accountId = formData.get('accountId') as string;
    const categoryId = formData.get('categoryId') as string;
    const amount = Math.abs(parseFloat(formData.get('amount') as string));

    if (!accountId || isNaN(amount) || amount <= 0) throw new Error('Monto y cuenta válidos requeridos.');

    await FinancialService.createTransaction({
      workspaceId,
      type: 'expense',
      description,
      transactionDate,
      merchant,
      entries: [
        { account_id: accountId, amount: -amount },
        { account_id: equityAcc.id, category_id: categoryId || null, amount: amount },
      ],
    });
  } else if (type === 'transfer') {
    const fromAccountId = formData.get('fromAccountId') as string;
    const toAccountId = formData.get('toAccountId') as string;
    const amount = Math.abs(parseFloat(formData.get('amount') as string));

    if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || isNaN(amount) || amount <= 0) {
      throw new Error('Cuentas origen y destino distintas y monto válido requeridos.');
    }

    await FinancialService.createTransaction({
      workspaceId,
      type: 'transfer',
      description,
      transactionDate,
      merchant,
      entries: [
        { account_id: fromAccountId, amount: -amount },
        { account_id: toAccountId, amount: amount },
      ],
    });
  } else if (type === 'loan_payment') {
    const loanAccountId = formData.get('loanAccountId') as string;
    const sourceAccountId = formData.get('sourceAccountId') as string;
    const principalPaid = Math.abs(parseFloat(formData.get('principalPaid') as string || '0'));
    const interestPaid = Math.abs(parseFloat(formData.get('interestPaid') as string || '0'));
    const commissionPaid = Math.abs(parseFloat(formData.get('commissionPaid') as string || '0'));
    const interestCategoryId = formData.get('interestCategoryId') as string;
    const commissionCategoryId = formData.get('commissionCategoryId') as string;

    if (!loanAccountId || !sourceAccountId) throw new Error('Cuentas de préstamo y origen requeridas.');

    await FinancialService.registerLoanPayment({
      workspaceId,
      loanAccountId,
      sourceAccountId,
      equityAccountId: equityAcc.id,
      principalPaid,
      interestPaid,
      commissionPaid,
      interestCategoryId: interestCategoryId || null as any,
      commissionCategoryId: commissionCategoryId || null,
      transactionDate,
      description,
    });
  }

  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
}
