import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMPPPlans } from '../../hooks/useManpower';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const MPPPlanForm: React.FC = () => {
  const navigate = useNavigate();
  const { createPlan } = useMPPPlans();
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    department_id: '', year: new Date().getFullYear(), current_headcount: 0,
    target_addition: 1, allocated_budget: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalTarget = form.current_headcount + form.target_addition;
  const avgCostPerHead = form.target_addition > 0 ? Math.round(form.allocated_budget / form.target_addition) : 0;

  useEffect(() => {
    const fetchDepts = async () => {
      const { data } = await supabase.from('departments').select('id, name').order('name');
      setDepartments(data || []);
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.department_id || form.allocated_budget <= 0) {
      setError('Mohon lengkapi semua field');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await createPlan({
      department_id: form.department_id,
      year: form.year,
      current_headcount: form.current_headcount,
      target_addition: form.target_addition,
      allocated_budget: form.allocated_budget,
    });
    if (result.error) setError(result.error);
    else { setSuccess(true); setTimeout(() => navigate('/manpower/plans'), 1500); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/manpower/plans" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Kembali</Link>

      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Rencana MPP Baru</h2>
        <p className="text-xs text-gray-500 mb-6">Buat perencanaan kebutuhan tenaga kerja & anggaran tahunan per departemen</p>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Rencana MPP Berhasil Dibuat!</h3>
            <p className="text-xs text-gray-500">Menunggu persetujuan HR/CFO</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Departemen <span className="text-rose-400">*</span></label>
                <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required>
                  <option value="">Pilih departemen</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Tahun Anggaran</label>
                <select value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs">
                  {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Headcount Eksisting</label>
                <input type="number" min={0} value={form.current_headcount} onChange={e => setForm({...form, current_headcount: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Target Penambahan <span className="text-rose-400">*</span></label>
                <input type="number" min={1} value={form.target_addition} onChange={e => setForm({...form, target_addition: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Plafon Anggaran (Total) <span className="text-rose-400">*</span></label>
              <input type="number" min={0} step={1000000} value={form.allocated_budget || ''} onChange={e => setForm({...form, allocated_budget: Number(e.target.value)})}
                placeholder="Rp 0" className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required />
            </div>

            {/* Preview Card */}
            <div className="p-4 bg-[#080808] rounded-xl space-y-2 text-xs">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ringkasan</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-gray-400">Total Headcount Target</p>
                  <p className="text-white font-bold text-sm">{totalTarget} org</p>
                </div>
                <div>
                  <p className="text-gray-400">Anggaran per Head</p>
                  <p className="text-white font-bold text-sm">{avgCostPerHead > 0 ? `Rp ${avgCostPerHead.toLocaleString('id-ID')}` : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Penambahan Bersih</p>
                  <p className="text-emerald-400 font-bold text-sm">+{form.target_addition} org</p>
                </div>
              </div>
            </div>

            {error && <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Buat Rencana MPP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
