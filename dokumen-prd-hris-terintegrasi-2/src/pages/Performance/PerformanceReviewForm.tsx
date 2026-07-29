import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePerformanceReviews } from '../../hooks/usePerformance';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const PERIODS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4', '2026-ANNUAL'];

export const PerformanceReviewForm: React.FC = () => {
  const navigate = useNavigate();
  const { createReview, calculateNineBox } = usePerformanceReviews();
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [form, setForm] = useState({
    employee_id: '', period: '2026-Q2', kpi_score: 75, competency_score: 75, self_review: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nineBoxResult = form.employee_id ? calculateNineBox(form.kpi_score, form.competency_score) : null;

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('id, full_name').is('deleted_at', null).eq('status', 'active').order('full_name');
      setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id) return;
    setError(null);
    setLoading(true);
    const result = await createReview({
      employee_id: form.employee_id,
      period: form.period,
      kpi_score: form.kpi_score,
      competency_score: form.competency_score,
      self_review: form.self_review || undefined,
    });
    if (result.error) setError(result.error);
    else { setSuccess(true); setTimeout(() => navigate('/performance'), 1500); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/performance" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Kembali</Link>

      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Review Kinerja Baru</h2>
        <p className="text-xs text-gray-500 mb-6">Input KPI/OKR dan skor kompetensi untuk evaluasi karyawan</p>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Review Berhasil Dibuat!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Karyawan <span className="text-rose-400">*</span></label>
                <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required>
                  <option value="">Pilih karyawan</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Periode</label>
                <select value={form.period} onChange={e => setForm({...form, period: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs">
                  {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Skor KPI (0-100) <span className="text-rose-400">*</span></label>
                <input type="range" min={0} max={100} value={form.kpi_score} onChange={e => setForm({...form, kpi_score: Number(e.target.value)})}
                  className="w-full accent-blue-500 mt-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">0</span>
                  <span className="text-white font-bold">{form.kpi_score}</span>
                  <span className="text-gray-500">100</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Skor Kompetensi (0-100) <span className="text-rose-400">*</span></label>
                <input type="range" min={0} max={100} value={form.competency_score} onChange={e => setForm({...form, competency_score: Number(e.target.value)})}
                  className="w-full accent-purple-500 mt-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">0</span>
                  <span className="text-white font-bold">{form.competency_score}</span>
                  <span className="text-gray-500">100</span>
                </div>
              </div>
            </div>

            {/* 9-Box Preview */}
            {nineBoxResult && (
              <div className="p-4 bg-[#080808] rounded-xl space-y-1.5 text-xs">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Pratinjau 9-Box</p>
                <div className="flex justify-between"><span className="text-gray-400">Kuadran</span><span className="text-white font-bold">{nineBoxResult.quadrant}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Rating</span><span className="text-amber-400 font-bold">{nineBoxResult.rating}</span></div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Self Review (opsional)</label>
              <textarea value={form.self_review} onChange={e => setForm({...form, self_review: e.target.value})} rows={3}
                placeholder="Catatan evaluasi diri..." className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs placeholder-gray-600" />
            </div>

            {error && <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Buat Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
