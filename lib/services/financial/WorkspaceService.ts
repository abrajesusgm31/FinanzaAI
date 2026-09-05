import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { CategoryService } from './CategoryService';

export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert'];

export class WorkspaceService {
  static async listWorkspaces() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspaces (*)')
      .eq('user_id', user.id);

    if (error) throw error;
    
    return data.map(item => item.workspaces).filter(Boolean);
  }

  static async createWorkspace(name: string, type: 'personal' | 'family' | 'team') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    // 1. Crear workspace (ya no enviamos created_by, la BD lo pone con auth.uid())
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name,
        type
      })
      .select()
      .single();

    if (wsError) throw wsError;

    // 2. Añadir creador como owner
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) throw memberError;

    // 3. Crear cuenta de Equity de sistema para este workspace
    const { error: equityError } = await supabase
      .from('accounts')
      .insert({
        workspace_id: workspace.id,
        name: 'Patrimonio del Workspace',
        type: 'equity',
        currency: 'USD',
        is_active: true
      });

    if (equityError) throw equityError;

    // 4. Sembrar categorías iniciales por defecto
    await CategoryService.seedDefaultCategories(workspace.id);

    return workspace;
  }
}
