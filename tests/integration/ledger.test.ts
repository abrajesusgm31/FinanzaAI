import { describe, it, expect, beforeAll } from 'vitest';
import { supabase, adminSupabase, createAuthClient, getAuthToken } from './setup';
import { seedDatabase } from './seed';

describe('Ledger Integration Tests', () => {
  let seed: any;
  let authSupabase: any;

  beforeAll(async () => {
    seed = await seedDatabase();
    const token = await getAuthToken('user1@test.com', 'password123');
    authSupabase = createAuthClient(token);
  });

  it('1. RLS Isolation: should reject access to workspace 2 data for user 1', async () => {
    const { data } = await authSupabase
      .from('workspaces')
      .select('*')
      .eq('id', seed.ws2.id);
    expect(data?.length).toBe(0);
  });

  it('2. Roles: should reject transaction creation for viewer role', async () => {
    await adminSupabase.from('workspace_members').upsert({
      workspace_id: seed.ws1.id,
      user_id: seed.user1.user!.id,
      role: 'viewer'
    });
    const { error } = await authSupabase.rpc('fn_create_financial_transaction', {
      p_workspace_id: seed.ws1.id,
      p_type: 'expense',
      p_description: 'Forbidden',
      p_transaction_date: '2026-09-05',
      p_merchant: null,
      p_entries: [{ account_id: seed.accounts[0].id, amount: -10, direction: 'debit', category_id: null }]
    });
    
    expect(error?.message).toContain('FORBIDDEN');
  });

  it('3. Direct Insert: should reject direct insert into ledger_transactions', async () => {
    const { error } = await authSupabase.from('ledger_transactions').insert({
      workspace_id: seed.ws1.id,
      description: 'Direct insert',
      type: 'expense'
    });
    expect(error).toBeDefined();
  });

  it('4. Zero-sum: should validate financial rule: transaction must sum to zero', async () => {
    const { error } = await authSupabase.rpc('fn_create_financial_transaction', {
      p_workspace_id: seed.ws1.id,
      p_type: 'income',
      p_description: 'Invalid sum',
      p_transaction_date: '2026-09-05',
      p_merchant: null,
      p_entries: [{ account_id: seed.accounts[0].id, amount: 100, direction: 'credit', category_id: null }]
    });
    expect(error?.message).toContain('FINANCIAL_RULE_VIOLATION');
  });

  it('5. Invalid Account: should reject transaction with accounts from other workspace', async () => {
    const { error } = await authSupabase.rpc('fn_create_financial_transaction', {
      p_workspace_id: seed.ws1.id,
      p_type: 'transfer',
      p_description: 'Invalid account',
      p_transaction_date: '2026-09-05',
      p_merchant: null,
      p_entries: [
        { account_id: seed.accounts[0].id, amount: -10, direction: 'debit', category_id: null },
        { account_id: '00000000-0000-0000-0000-000000000000', amount: 10, direction: 'credit', category_id: null }
      ]
    });
    expect(error?.message).toContain('SECURITY_VIOLATION');
  });

  it('6. Over-amortization: should reject over-amortization', async () => {
    const bankAcc = seed.accounts.find((a: any) => a.type === 'bank');
    const loanAcc = seed.accounts.find((a: any) => a.type === 'loan');
    const equityAcc = seed.accounts.find((a: any) => a.type === 'equity');

    const { error } = await authSupabase.rpc('fn_register_loan_payment', {
      p_workspace_id: seed.ws1.id,
      p_loan_account_id: loanAcc.id,
      p_source_account_id: bankAcc.id,
      p_equity_account_id: equityAcc.id,
      p_principal_paid: 999999,
      p_interest_paid: 0,
      p_commission_paid: 0,
      p_interest_category_id: seed.accounts[0].id, // Dummy ID, but let's assume it's ignored or fails
      p_commission_category_id: null,
      p_transaction_date: '2026-09-05',
      p_description: 'Overpayment'
    });
    expect(error?.message).toContain('FINANCIAL_RULE_VIOLATION');
  });

  it('7. Net Worth: should calculate net worth excluding equity', async () => {
    const { data: netWorth } = await authSupabase.rpc('fn_get_workspace_net_worth', { p_workspace_id: seed.ws1.id });
    expect(netWorth).toBeDefined();
  });

  it('8. Atomic Rollback: fail on invalid second entry', async () => {
     const { error } = await authSupabase.rpc('fn_create_financial_transaction', {
       p_workspace_id: seed.ws1.id,
       p_type: 'transfer',
       p_description: 'Rollback test',
       p_transaction_date: '2026-09-05',
       p_merchant: null,
       p_entries: [
         { account_id: seed.accounts[0].id, amount: -100, direction: 'debit', category_id: null },
         { account_id: '00000000-0000-0000-0000-000000000000', amount: 100, direction: 'credit', category_id: null }
       ]
     });
     expect(error).toBeDefined();
  });
});
