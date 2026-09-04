import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type WorkspaceRole = Database['public']['Enums']['workspace_role'];

export type Action = 
  | 'workspace:delete'
  | 'workspace:manage_members'
  | 'ai:configure_key'
  | 'account:create'
  | 'account:edit'
  | 'transaction:create'
  | 'transaction:edit'
  | 'transaction:read'
  | 'import:approve';

const PERMISSION_MAP: Record<Action, WorkspaceRole[]> = {
  'workspace:delete': ['owner'],
  'workspace:manage_members': ['owner', 'admin'],
  'ai:configure_key': ['owner', 'admin'],
  'account:create': ['owner', 'admin', 'editor'],
  'account:edit': ['owner', 'admin', 'editor'],
  'transaction:create': ['owner', 'admin', 'editor'],
  'transaction:edit': ['owner', 'admin', 'editor'],
  'transaction:read': ['owner', 'admin', 'editor', 'viewer'],
  'import:approve': ['owner', 'admin', 'editor'],
};

export class PermissionService {
  /**
   * Obtiene el rol del usuario actual en un workspace
   */
  static async getUserRole(workspaceId: string): Promise<WorkspaceRole | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return data.role as WorkspaceRole;
  }

  /**
   * Verifica si el usuario puede realizar una acción en un workspace
   */
  static async can(workspaceId: string, action: Action): Promise<boolean> {
    const role = await this.getUserRole(workspaceId);
    if (!role) return false;

    return PERMISSION_MAP[action]?.includes(role) ?? false;
  }

  /**
   * Asegura que el usuario tenga permiso o lanza un error (Server Side)
   */
  static async protect(workspaceId: string, action: Action) {
    const authorized = await this.can(workspaceId, action);
    if (!authorized) {
      throw new Error(`Unauthorized: No tienes permiso para realizar ${action} en este workspace.`);
    }
  }
}
