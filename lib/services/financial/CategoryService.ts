import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];

export class CategoryService {
  static async listCategories(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createCategory(category: CategoryInsert) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async seedDefaultCategories(workspaceId: string) {
    const defaultCategories = [
      { name: 'Alimentación', icon: 'shopping-cart', color: '#f59e0b', is_system: true, workspace_id: workspaceId },
      { name: 'Vivienda', icon: 'home', color: '#3b82f6', is_system: true, workspace_id: workspaceId },
      { name: 'Transporte', icon: 'car', color: '#10b981', is_system: true, workspace_id: workspaceId },
      { name: 'Ocio', icon: 'film', color: '#ec4899', is_system: true, workspace_id: workspaceId },
      { name: 'Salud', icon: 'heart', color: '#ef4444', is_system: true, workspace_id: workspaceId },
      { name: 'Salario', icon: 'briefcase', color: '#10b981', is_system: true, workspace_id: workspaceId },
      { name: 'Intereses y Comisiones', icon: 'percent', color: '#8b5cf6', is_system: true, workspace_id: workspaceId },
      { name: 'Otros', icon: 'more-horizontal', color: '#6b7280', is_system: true, workspace_id: workspaceId },
    ];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select();

    if (error) throw error;
    return data;
  }
}
