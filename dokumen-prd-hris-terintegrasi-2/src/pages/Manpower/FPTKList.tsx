import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobRequisitions, useMPPPlans, calculateProjectedCost, checkBudgetAvailability } from '../../hooks/useManpower';
import { Search, Loader2, FileText, ArrowLeft, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';

const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export const FPTKList: React.FC = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { requisitions, loading, updateApprovalStatus } = useJobRequisitions();
  const { plans } = useMPPPlans();

  const filtered = requisitions.filter(r => {
    const title = r.title?.toLowerCase() || '';
    const matchSearch = title.includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'PENDING', 'APPROVED', 'SOURCING', 'ONBOARDED', 'REJECTED'];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-950/60 text-slate-400 border-slate-800/50',
      PENDING: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      APPROVED: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      SOURCING: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
      ONBOARDED: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
      REJECTED: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
    };
    return map[s] || 'bg-gray-900 text-gray-400 border-gray-700';
  };

  const getBudgetInfo = (r: typeof requisitions[0]) => {
    const plan = plans.find(p => p.id === r.mpp_plan_id);
    if (!plan) return null;
    const otherReqs = requisitions.filter(ri => ri.mpp_plan_id === r.mpp_plan_id && ri.id !== r.id);
    const check = checkBudgetAvailability(plan, otherReqs, Number(r.estimated_salary), r.target_quarter, r.headcount_requested);
    return check;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/manpower" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-white">FPTK / Job Requisition</h1>
            <p className="text-xs text-gray-500 mt-1">{filtered.length} pengajuan</p>
          </div>
        </div>
        <Link to="/manpower/fptk/new" className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> FPTK Baru
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Cari posisi..." className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white placeholder-gray-600 text-xs" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-white text-black font-bold' : 'bg-[#121212] text-gray-400 border border-[#262626] hover:bg-[#181818]'
              }`}>{s === 'all' ? 'Semua' : s}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-xs text-gray-500">Belum ada pengajuan FPTK</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const budget = getBudgetInfo(r);
            const cost = calculateProjectedCost(Number(r.estimated_salary), r.target_quarter, r.headcount_requested);
            const nextStatus = r.approval_status === 'PENDING' ? 'APPROVED' :
              r.approval_status === 'APPROVED' ? 'SOURCING' :
              r.approval_status === 'SOURCING' ? 'ONBOARDED' : null;

            return (
              <div key={r.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 hover:border-[#2a2a2a] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                      {r.title.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.departments?.name || 'Unknown'} • {r.target_quarter} • {r.headcount_requested} {r.headcount_requested > 1 ? 'orang' : 'orang'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Estimasi Gaji: {formatRp(Number(r.estimated_salary))} • Biaya Proyeksi: {formatRp(cost.totalCost)} ({cost.proratedCost} + {formatRp(cost.overheadBPJS)} overhead)
                      </p>
                      {budget && (
                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${budget.withinBudget ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {budget.withinBudget ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {budget.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(r.approval_status)}`}>
                      {r.approval_status}
                    </span>
                    {nextStatus && (
                      <button onClick={async () => { await updateApprovalStatus(r.id, nextStatus); }}
                        className="px-2 py-1 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] rounded-lg text-[10px] text-gray-300">
                        → {nextStatus}
                      </button>
                    )}
                  </div>
                </div>
                {r.approval_status === 'PENDING' && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-[#1a1a1a]">
                    <button onClick={async () => { await updateApprovalStatus(r.id, 'APPROVED'); }}
                      className="px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 rounded-lg text-[10px] text-emerald-300 font-medium">
                      Setujui
                    </button>
                    <button onClick={async () => { await updateApprovalStatus(r.id, 'REJECTED'); }}
                      className="px-3 py-1 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 rounded-lg text-[10px] text-rose-300 font-medium">
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
