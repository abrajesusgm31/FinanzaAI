'use client';

import { useState } from 'react';
import { createWorkspaceAction } from '@/app/actions/workspace';
import { Plus, X } from 'lucide-react';

export function CreateWorkspaceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createWorkspaceAction(formData);
      onClose();
      // Reload is implicitly handled by the Server Action's revalidatePath
    } catch (err: any) {
      alert(err.message || 'Error al crear workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <h3 className="font-bold text-lg text-slate-900">Crear tu primer Workspace</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Nombre</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej. Finanzas Familiares"
              className="w-full mt-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Tipo</label>
            <select
              name="type"
              className="w-full mt-1 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="personal">Personal</option>
              <option value="family">Familiar</option>
              <option value="team">Equipo</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
