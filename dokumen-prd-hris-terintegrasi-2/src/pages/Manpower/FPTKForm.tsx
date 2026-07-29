import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJobRequisitions, useMPPPlans, calculateProjectedCost, checkBudgetAvailability } from '../../hooks/useManpower';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

export const FPTKForm: React.FC = () => {
  const navigate = useNavigate();
  const { plans, loading: plansLoading } = useMPPPlans();
  const { createRequisition, requisitions } = useJobRequisitions();
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    mpp_plan_id: '', title: '', department_id: '',
    target_quarter: 'Q1', estimated_salary: 0, headcount_requested: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedPlan = plans.find(p => p.id === form.mpp_plan_id);
  const existingReqsForPlan = requisitions.filter(r => r.mpp_plan_id === form.mpp_plan_id);

  const budgetCheck = selectedPlan && form.estimated_salary > 0
    ? checkBudgetAvailability(selectedPlan, existingReqsForPlan, form.estimated_salary, form.target_quarter, form.headcount_requested)
    : null;

  const projectedCost = form.estimated_salary > 0
    ? calculateProjectedCost(form.estimated_salary, form.target_quarter, form.headcount_requested)
    : null;

  useEffect(() => {
    const fetchDepts = async () => {
      const { data } = await supabase.from('departments').select('id, name').order('name');
      setDepartments(data || []);
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mpp_plan_id || !form.title || !form.department_id || form.estimated_salary <= 0) {
      setError('Mohon lengkapi semua field');
      return;
    }
    if (budgetCheck && !budgetCheck.withinBudget) {
      setError(`FPTK melebihi anggaran MPP sebesar ${formatRp(Math.abs(budgetCheck.budgetRemaining))}. Status akan tetap diajukan.`);
      // Allow submission even if over budget (Special Exemption)
    }
    setError(null);
    setLoading(true);
    const result = await createRequisition({
      mpp_plan_id: form.mpp_plan_id,
      title: form.title,
      department_id: form.department_id,
      target_quarter: form.target_quarter,
      estimated_salary: form.estimated_salary,
      headcount_requested: form.headcount_requested,
    });
    if (result.error) setError(result.error);
    else { setSuccess(true); setTimeout(() => navigate('/manpower/fptk'), 1500); }
    setLoading(false);
  };

  if (plansLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/manpower/fptk" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Kembali</Link>

      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6">
        <h2 className="text-lg font-bold text-white mb-1">Formulir FPTK Baru</h2>
        <p className="text-xs text-gray-500 mb-6">Formulir Pengajuan Tenaga Kerja (FPTK) / Job Requisition</p>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">FPTK Berhasil Diajukan!</h3>
            <p className="text-xs text-gray-500">Menunggu persetujuan atasan / HR</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Rencana MPP <span className="text-rose-400">*</span></label>
              <select value={form.mpp_plan_id} onChange={e => {
                const plan = plans.find(p => p.id === e.target.value);
                setForm({...form, mpp_plan_id: e.target.value, department_id: plan?.department_id || form.department_id});
              }}
                className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required>
                <option value="">Pilih rencana MPP</option>
                {plans.filter(p => p.status === 'APPROVED').map(p => (
                  <option key={p.id} value={p.id}>{p.departments?.name || 'Unknown'} ({p.year})</option>
                ))}
              </select>
            </div>

            {selectedPlan && (
              <div className="p-3 bg-[#080808] rounded-xl text-xs space-y-1">
                <div className="flex justify-between"><span className="text-gray-400">Sisa Kuota MPP</span><span className="text-white font-bold">{selectedPlan.target_addition} orang</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Plafon Anggaran</span><span className="text-white font-bold">{formatRp(Number(selectedPlan.allocated_budget))}</span></div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Judul Posisi <span className="text-rose-400">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Contoh: Senior Backend Engineer"
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs placeholder-gray-600" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Departemen</label>
                <select value={form.department_id} onChange={e => setForm({...form, department_id: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs">
                  <option value="">Pilih departemen</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Kuartal Target <span className="text-rose-400">*</span></label>
                <select value={form.target_quarter} onChange={e => setForm({...form, target_quarter: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs">
                  {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Estimasi Gaji/bln <span className="text-rose-400">*</span></label>
                <input type="number" min={0} step={1000000} value={form.estimated_salary || ''} onChange={e => setForm({...form, estimated_salary: Number(e.target.value)})}
                  placeholder="Rp 0" className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Jumlah Dibutuhkan</label>
                <input type="number" min={1} max={50} value={form.headcount_requested} onChange={e => setForm({...form, headcount_requested: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs" />
              </div>
            </div>

            {/* Budget Check Result */}
            {budgetCheck && (
              <div className={`p-3 rounded-xl text-xs border flex items-start gap-2 ${
                budgetCheck.withinBudget
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
              }`}>
                {budgetCheck.withinBudget ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">{budgetCheck.message}</p>
                  {projectedCost && (
                    <p className="text-[10px] opacity-75 mt-0.5">
                      Proyeksi biaya: {formatRp(projectedCost.totalCost)} ({projectedCost.proratedCost} gaji + {formatRp(projectedCost.overheadBPJS)} overhead 20%)
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs"><AlertCircle className="w-4 h-4 inline mr-1" />{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ajukan FPTK
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
