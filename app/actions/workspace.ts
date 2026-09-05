'use server';

import { WorkspaceService } from '@/lib/services/financial/WorkspaceService';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function createWorkspaceAction(formData: FormData) {
  const name = formData.get('name') as string;
  const type = (formData.get('type') as 'personal' | 'family' | 'team') || 'personal';

  if (!name || name.trim() === '') {
    throw new Error('El nombre del workspace es obligatorio.');
  }

  const workspace = await WorkspaceService.createWorkspace(name.trim(), type);
  
  // Establecer como activo
  const cookieStore = await cookies();
  cookieStore.set('activeWorkspaceId', workspace.id);

  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/transactions');
  return workspace;
}

export async function setActiveWorkspaceAction(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set('activeWorkspaceId', workspaceId);
  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  revalidatePath('/transactions');
}
