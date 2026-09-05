'use client';

import { useState } from 'react';
import { createWorkspaceAction, setActiveWorkspaceAction } from '@/app/actions/workspace';
import { Plus, Building2, Check, ChevronDown } from 'lucide-react';

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
}: {
  workspaces: any[];
  currentWorkspaceId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createWorkspaceAction(formData);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error al crear workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: string) => {
    await setActiveWorkspaceAction(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
      >
        <Building2 className="w-4 h-4 text-indigo-600" />
        <span>{currentWorkspace ? currentWorkspace.name : 'Seleccionar Workspace'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tus Workspaces
          </div>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium truncate">{ws.name}</span>
              {ws.id === currentWorkspaceId && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          ))}
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={() => {
                setShowModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuevo Workspace
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Crear Workspace</h3>
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
                  onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
}
