import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLeaveRequests, useLeavePolicies } from '../../hooks/useLeave';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const LeaveRequestForm: React.FC = () => {
  const { employeeId } = useAuth();
  const navigate = useNavigate();
  const { policies } = useLeavePolicies();
  const { createRequest } = useLeaveRequests();

  const [form, setForm] = useState({
    leave_policy_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedPolicy = policies.find(p => p.id === form.leave_policy_id);

  const calculateDays = () => {
    if (!form.start_date || !form.end_date) return 0;
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !form.leave_policy_id) return;
    setError(null);
    setLoading(true);

    const result = await createRequest({
      employee_id: employeeId,
      ...form,
      total_days: totalDays,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/leave'), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/leave" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Kembali</Link>

      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Pengajuan Cuti Baru</h2>
        <p className="text-xs text-gray-500 mb-6">Isi detail pengajuan cuti atau izin Anda</p>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Pengajuan Berhasil!</h3>
            <p className="text-xs text-gray-400">Pengajuan cuti Anda akan diproses oleh atasan.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Jenis Cuti <span className="text-rose-400">*</span></label>
              <select value={form.leave_policy_id} onChange={e => setForm({...form, leave_policy_id: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required>
                <option value="">Pilih jenis cuti</option>
                {policies.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.total_days} hari)</option>
                ))}
              </select>
              {selectedPolicy && (
                <p className="text-[10px] text-gray-500">{selectedPolicy.name}: maksimal {selectedPolicy.total_days} hari, tipe {selectedPolicy.accrual_type === 'MONTHLY_ACCRUAL' ? 'Akrual Bulanan' : 'Front-load Tahunan'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Tanggal Mulai <span className="text-rose-400">*</span></label>
                <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Tanggal Selesai <span className="text-rose-400">*</span></label>
                <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required />
              </div>
            </div>

            {form.start_date && form.end_date && (
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-blue-200">Total: <strong>{totalDays} hari</strong> kerja</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Alasan Cuti <span className="text-rose-400">*</span></label>
              <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3}
                placeholder="Tuliskan alasan pengajuan cuti..."
                className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs placeholder-gray-600" required />
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ajukan Cuti
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
