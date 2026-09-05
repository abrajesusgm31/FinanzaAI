'use client';

import { useState } from 'react';
import { createCategoryAction } from '@/app/actions/category';
import { X, Tag } from 'lucide-react';

export function CreateCategoryModal({
  workspaceId,
  isOpen,
  onClose,
}: {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('workspaceId', workspaceId);

    try {
      await createCategoryAction(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">Nueva Categoría</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Nombre</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej. Suscripciones / Reparaciones"
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Icono</label>
              <select
                name="icon"
                defaultValue="tag"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="tag">Etiqueta</option>
                <option value="shopping-cart">Compras</option>
                <option value="home">Hogar</option>
                <option value="car">Vehículo</option>
                <option value="film">Entretenimiento</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Color</label>
              <input
                type="color"
                name="color"
                defaultValue="#6366f1"
                className="w-full h-9 mt-1 p-1 border border-slate-200 rounded-xl cursor-pointer"
              />
            </div>
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
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
