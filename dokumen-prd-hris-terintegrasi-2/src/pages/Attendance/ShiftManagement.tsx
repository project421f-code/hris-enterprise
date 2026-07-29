import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShifts, ShiftRecord } from '../../hooks/useShifts';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft, Plus, Clock, Pencil, Trash2, Loader2,
  Save, X, CheckCircle2, AlertCircle
} from 'lucide-react';

const defaultShiftForm = {
  name: '',
  start_time: '08:00',
  end_time: '17:00',
  grace_period_minutes: 15,
};

export const ShiftManagement: React.FC = () => {
  const { employeeCompanyId } = useAuth();
  const { shifts, loading, createShift, updateShift, deleteShift } = useShifts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultShiftForm);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(defaultShiftForm);
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCompanyId) return;
    setError(null);
    const result = await createShift(form, employeeCompanyId);
    if (result.error) setError(result.error);
    else resetForm();
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    const result = await updateShift(id, form);
    if (result.error) setError(result.error);
    else resetForm();
  };

  const handleEdit = (shift: ShiftRecord) => {
    setEditingId(shift.id);
    setForm({
      name: shift.name,
      start_time: shift.start_time.slice(0, 5),
      end_time: shift.end_time.slice(0, 5),
      grace_period_minutes: shift.grace_period_minutes,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus shift ini?')) return;
    setError(null);
    const result = await deleteShift(id);
    if (result.error) setError(result.error);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/attendance" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Manajemen Shift</h1>
            <p className="text-xs text-gray-500 mt-1">{shifts.length} shift aktif</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Tambah Shift
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={editingId ? (e) => { e.preventDefault(); editingId && handleUpdate(editingId); } : handleCreate}
          className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Nama Shift</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" required />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Jam Mulai</label>
              <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})}
                className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" required />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Jam Selesai</label>
              <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})}
                className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" required />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Toleransi (menit)</label>
              <input type="number" value={form.grace_period_minutes} onChange={e => setForm({...form, grace_period_minutes: Number(e.target.value)})}
                className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" min={0} />
            </div>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-3 py-1.5 bg-[#181818] text-gray-300 rounded-lg text-xs border border-[#2a2a2a]">Batal</button>
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      {/* Shift Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((shift) => (
          <div key={shift.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 hover:border-[#2a2a2a] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-950/60 text-blue-400 border border-blue-800/40 rounded-xl">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{shift.name}</h4>
                  <p className="text-[10px] text-gray-500">Toleransi {shift.grace_period_minutes} menit</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(shift)} className="p-1.5 hover:bg-[#181818] text-gray-400 hover:text-white rounded-lg">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(shift.id)} className="p-1.5 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 py-3 bg-[#080808] rounded-xl">
              <div className="text-center">
                <p className="text-[10px] text-gray-500">Mulai</p>
                <p className="text-sm font-bold text-emerald-400 font-mono">{shift.start_time.slice(0, 5)}</p>
              </div>
              <div className="text-gray-600 text-xl">→</div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500">Selesai</p>
                <p className="text-sm font-bold text-amber-400 font-mono">{shift.end_time.slice(0, 5)}</p>
              </div>
            </div>
          </div>
        ))}
        {shifts.length === 0 && (
          <div className="col-span-full p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Belum ada shift. Buat shift pertama Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
