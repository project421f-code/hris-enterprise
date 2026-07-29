import React from 'react';
import { Link } from 'react-router-dom';
import { useMPPPlans, useJobRequisitions, calculateProjectedCost } from '../../hooks/useManpower';
import { TrendingUp, Users, DollarSign, FileText, Plus, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export const ManpowerDashboard: React.FC = () => {
  const { plans, loading: plansLoading } = useMPPPlans();
  const { requisitions, loading: reqsLoading } = useJobRequisitions();

  const totalApproved = plans.filter(p => p.status === 'APPROVED').length;
  const totalTargetAddition = plans.reduce((s, p) => s + (p.status === 'APPROVED' ? p.target_addition : 0), 0);
  const totalBudget = plans.reduce((s, p) => s + Number(p.allocated_budget), 0);
  const totalHeadcount = plans.reduce((s, p) => s + p.current_headcount, 0);

  // Calculate total projected cost from approved FPTKs
  const totalProjectedCost = requisitions
    .filter(r => r.approval_status === 'APPROVED')
    .reduce((sum, r) => {
      const cost = calculateProjectedCost(Number(r.estimated_salary), r.target_quarter, r.headcount_requested);
      return sum + cost.totalCost;
    }, 0);

  const budgetVariance = totalBudget - totalProjectedCost;

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-950/60 text-slate-400 border-slate-800/50',
      APPROVED: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      REJECTED: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
      PENDING: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      SOURCING: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
      ONBOARDED: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
    };
    return map[s] || 'bg-gray-900 text-gray-400 border-gray-700';
  };

  if (plansLoading || reqsLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Manpower Planning (MPP)</h1>
          <p className="text-xs text-gray-500 mt-1">Perencanaan Tenaga Kerja • FPTK • Anggaran Tahunan</p>
        </div>
        <div className="flex gap-2">
          <Link to="/manpower/plans/new" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all">
            <Plus className="w-4 h-4" /> MPP Baru
          </Link>
          <Link to="/manpower/fptk/new" className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:from-emerald-500 hover:to-teal-500 transition-all">
            <FileText className="w-4 h-4" /> FPTK Baru
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Rencana MPP', value: plans.length, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/30' },
          { label: 'Disetujui', value: totalApproved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/30' },
          { label: 'Target Headcount', value: totalTargetAddition, icon: Users, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/30' },
          { label: 'Headcount Eksisting', value: totalHeadcount, icon: Users, color: 'text-purple-400', bg: 'bg-purple-950/30 border-purple-800/30' },
        ].map(c => (
          <div key={c.label} className={`p-3.5 rounded-2xl border ${c.bg}`}>
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] text-gray-400">{c.label}</p><p className="text-lg font-bold text-white mt-0.5">{c.value}</p></div>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Budget Overview */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
        <h3 className="text-sm font-bold text-white mb-3">Ringkasan Anggaran</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-[#080808] rounded-xl space-y-1">
            <p className="text-[10px] text-gray-500">Total Plafon Anggaran</p>
            <p className="text-lg font-bold text-white">{formatRp(totalBudget)}</p>
          </div>
          <div className="p-3 bg-[#080808] rounded-xl space-y-1">
            <p className="text-[10px] text-gray-500">Proyeksi Biaya FPTK</p>
            <p className="text-lg font-bold text-amber-400">{formatRp(totalProjectedCost)}</p>
          </div>
          <div className={`p-3 bg-[#080808] rounded-xl space-y-1 ${budgetVariance < 0 ? 'border border-rose-800/40' : ''}`}>
            <p className="text-[10px] text-gray-500">Sisa Anggaran</p>
            <p className={`text-lg font-bold ${budgetVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatRp(budgetVariance)}
            </p>
          </div>
        </div>

        {/* Budget Bar */}
        {totalBudget > 0 && (
          <div className="w-full bg-[#121212] rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${totalProjectedCost > totalBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((totalProjectedCost / totalBudget) * 100, 100)}%` }}
            />
          </div>
        )}
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Terpakai: {totalBudget > 0 ? Math.round((totalProjectedCost / totalBudget) * 100) : 0}%</span>
          <span>{plans.length} rencana MPP</span>
        </div>
      </div>

      {/* MPP Plans Table */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Rencana MPP per Departemen</h3>
          <Link to="/manpower/plans" className="text-[10px] text-blue-400 hover:underline">Lihat Semua</Link>
        </div>
        {plans.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Belum ada rencana MPP. Buat rencana baru untuk mulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a] text-xs">
            {plans.map(p => {
              const totalFPTKCost = requisitions
                .filter(r => r.mpp_plan_id === p.id && r.approval_status === 'APPROVED')
                .reduce((s, r) => s + calculateProjectedCost(Number(r.estimated_salary), r.target_quarter, r.headcount_requested).totalCost, 0);
              const usagePct = Number(p.allocated_budget) > 0 ? Math.round((totalFPTKCost / Number(p.allocated_budget)) * 100) : 0;
              return (
                <div key={p.id} className="p-3.5 hover:bg-[#141414] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{p.departments?.name || 'Unknown'} <span className="text-gray-500 font-normal">• {p.year}</span></p>
                      <p className="text-[10px] text-gray-400">
                        {p.current_headcount} eksisting → {p.current_headcount + p.target_addition} target (+{p.target_addition})
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span>Anggaran: {formatRp(Number(p.allocated_budget))}</span>
                    <span className="flex items-center gap-1">
                      Pemakaian:
                      <div className="w-16 bg-[#1a1a1a] rounded-full h-1.5 inline-block">
                        <div className={`h-1.5 rounded-full ${usagePct > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${usagePct}%` }} />
                      </div>
                      {usagePct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent FPTK */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">FPTK Terbaru</h3>
          <Link to="/manpower/fptk" className="text-[10px] text-blue-400 hover:underline">Lihat Semua</Link>
        </div>
        {requisitions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Belum ada pengajuan FPTK</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a] text-xs">
            {requisitions.slice(0, 5).map(r => (
              <div key={r.id} className="p-3.5 hover:bg-[#141414] transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {r.title.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{r.title} <span className="text-gray-500 font-normal">• {r.target_quarter}</span></p>
                    <p className="text-[10px] text-gray-400">
                      {r.departments?.name || 'Unknown'} • {r.headcount_requested} org • {formatRp(Number(r.estimated_salary))}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(r.approval_status)}`}>
                  {r.approval_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Link to="/manpower/plans" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-blue-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><TrendingUp className="w-4 h-4 text-blue-400" /><span className="text-xs text-gray-300">Semua Rencana MPP</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/manpower/plans/new" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-emerald-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Plus className="w-4 h-4 text-emerald-400" /><span className="text-xs text-gray-300">Rencana MPP Baru</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/manpower/fptk" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-amber-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-amber-400" /><span className="text-xs text-gray-300">Semua FPTK</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/manpower/fptk/new" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-purple-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><FileText className="w-4 h-4 text-purple-400" /><span className="text-xs text-gray-300">FPTK Baru</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
      </div>
    </div>
  );
};
