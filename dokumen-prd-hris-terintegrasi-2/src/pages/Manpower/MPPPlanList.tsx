import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMPPPlans } from '../../hooks/useManpower';
import { Search, Loader2, TrendingUp, ArrowLeft, Plus } from 'lucide-react';

const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export const MPPPlanList: React.FC = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { plans, loading, updateStatus } = useMPPPlans();

  const filtered = plans.filter(p => {
    const name = p.departments?.name?.toLowerCase() || '';
    const matchSearch = name.includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'DRAFT', 'APPROVED', 'REJECTED'];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-950/60 text-slate-400 border-slate-800/50',
      APPROVED: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      REJECTED: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
    };
    return map[s] || 'bg-gray-900 text-gray-400 border-gray-700';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/manpower" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-white">Rencana MPP</h1>
            <p className="text-xs text-gray-500 mt-1">{filtered.length} rencana</p>
          </div>
        </div>
        <Link to="/manpower/plans/new" className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> MPP Baru
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Cari departemen..." className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white placeholder-gray-600 text-xs" />
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
          <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-xs text-gray-500">Belum ada rencana MPP</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 hover:border-[#2a2a2a] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{p.departments?.name || 'Unknown'} <span className="text-gray-500 font-normal">• {p.year}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">Headcount: {p.current_headcount} eksisting → {p.current_headcount + p.target_addition} total target</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(p.status)}`}>{p.status}</span>
                  {p.status === 'DRAFT' && (
                    <>
                      <button onClick={async () => { await updateStatus(p.id, 'APPROVED'); }}
                        className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 rounded-lg text-[10px] text-emerald-300">Setujui</button>
                      <button onClick={async () => { await updateStatus(p.id, 'REJECTED'); }}
                        className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 rounded-lg text-[10px] text-rose-300">Tolak</button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-[#080808] rounded-lg">
                  <p className="text-[10px] text-gray-500">Anggaran Dialokasikan</p>
                  <p className="text-sm font-bold text-white mt-0.5">{formatRp(Number(p.allocated_budget))}</p>
                </div>
                <div className="p-2.5 bg-[#080808] rounded-lg">
                  <p className="text-[10px] text-gray-500">Target Penambahan</p>
                  <p className="text-sm font-bold text-white mt-0.5">+{p.target_addition} orang</p>
                </div>
                <div className="p-2.5 bg-[#080808] rounded-lg">
                  <p className="text-[10px] text-gray-500">Anggaran per Head</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {p.target_addition > 0 ? formatRp(Math.round(Number(p.allocated_budget) / p.target_addition)) : '-'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
