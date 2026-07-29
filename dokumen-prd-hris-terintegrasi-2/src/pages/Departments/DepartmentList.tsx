import React, { useState } from 'react';
import { useDepartments } from '../../hooks/useDepartments';
import { useAuth } from '../../contexts/AuthContext';
import {
  Building2, Plus, Pencil, Trash2, Loader2, Users,
  CheckCircle2, X, Save, AlertCircle
} from 'lucide-react';

export const DepartmentList: React.FC = () => {
  const { employeeCompanyId } = useAuth();
  const { departments, loading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [newDeptName, setNewDeptName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setError(null);
    if (!employeeCompanyId) {
      setError('Company ID tidak ditemukan. Silakan login ulang.');
      return;
    }
    const result = await createDepartment(newDeptName.trim(), employeeCompanyId);
    if (result.error) {
      setError(result.error);
    } else {
      setNewDeptName('');
      setShowForm(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setError(null);
    const result = await updateDepartment(id, editName.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus departemen ini? Karyawan di departemen ini tidak akan terhapus.')) return;
    setError(null);
    const result = await deleteDepartment(id);
    if (result.error) {
      setError(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Manajemen Departemen</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total {departments.length} departemen
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Departemen
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Nama departemen baru..."
              className="flex-1 px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newDeptName.trim()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewDeptName(''); }}
              className="px-3 py-2 bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 rounded-xl text-xs transition-all border border-rose-800/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Department Cards */}
      {departments.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Belum Ada Departemen</h3>
          <p className="text-xs text-gray-500 mt-1">Buat departemen pertama untuk mulai mengorganisir karyawan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm hover:border-[#2a2a2a] transition-all group"
            >
              {editingId === dept.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-[#121212] border border-blue-500 rounded-lg text-white text-xs focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(dept.id)}
                    className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-gray-500 hover:bg-[#1a1a1a] rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-950/60 text-purple-400 border border-purple-800/40 rounded-xl">
                        <Building2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{dept.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3 h-3 text-gray-500" />
                          <span className="text-[11px] text-gray-500">{dept.employee_count} karyawan</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(dept.id); setEditName(dept.name); }}
                        className="p-1.5 hover:bg-[#181818] text-gray-400 hover:text-white rounded-lg transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
