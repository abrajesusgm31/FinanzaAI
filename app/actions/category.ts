'use server';

import { CategoryService } from '@/lib/services/financial/CategoryService';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(formData: FormData) {
  const workspaceId = formData.get('workspaceId') as string;
  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string;
  const color = formData.get('color') as string;

  if (!workspaceId || !name) {
    throw new Error('Workspace y nombre son obligatorios.');
  }

  const category = await CategoryService.createCategory({
    workspace_id: workspaceId,
    name: name.trim(),
    icon: icon || 'tag',
    color: color || '#6366f1',
    is_system: false,
  });

  revalidatePath('/transactions');
  revalidatePath('/accounts');
  return category;
}
