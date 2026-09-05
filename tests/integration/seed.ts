import { adminSupabase } from './setup';

export async function seedDatabase() {
  // 1. Create Users
  const suffix = Math.random().toString(36).substring(7);
  const email1 = `user1_${suffix}@test.com`;
  const email2 = `user2_${suffix}@test.com`;

  const { data: user1, error: u1Err } = await adminSupabase.auth.admin.createUser({
    email: email1,
    password: 'password123',
    email_confirm: true
  });
  if (u1Err) throw u1Err;

  const { data: user2, error: u2Err } = await adminSupabase.auth.admin.createUser({
    email: email2,
    password: 'password123',
    email_confirm: true
  });
  if (u2Err) throw u2Err;

  // 2. Create Workspaces
  const { data: ws1, error: w1Err } = await adminSupabase.from('workspaces').insert({
    name: 'Workspace 1',
    created_by: user1.user!.id
  }).select().single();
  if (w1Err) throw w1Err;

  const { data: ws2, error: w2Err } = await adminSupabase.from('workspaces').insert({
    name: 'Workspace 2',
    created_by: user2.user!.id
  }).select().single();
  if (w2Err) throw w2Err;

  // 3. Add Members
  await adminSupabase.from('workspace_members').insert([
    { workspace_id: ws1.id, user_id: user1.user!.id, role: 'owner' },
    { workspace_id: ws2.id, user_id: user2.user!.id, role: 'owner' }
  ]);

  // 4. Create Accounts (Asset, Liability, Equity) for WS1
  const { data: accounts, error: accErr } = await adminSupabase.from('accounts').insert([
    { workspace_id: ws1.id, name: 'Bank Asset', type: 'bank', currency: 'EUR' },
    { workspace_id: ws1.id, name: 'Loan Liability', type: 'loan', currency: 'EUR' },
    { workspace_id: ws1.id, name: 'Equity', type: 'equity', currency: 'EUR' }
  ]).select();
  if (accErr) throw accErr;

  // 5. Create Loan
  const loanAcc = accounts!.find(a => a.type === 'loan');
  await adminSupabase.from('account_loans').insert({
    account_id: loanAcc!.id,
    principal_amount: 10000,
    start_date: '2026-01-01'
  });

  return { user1, user2, ws1, ws2, accounts };
}
