import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePerformanceReviews } from '../../hooks/usePerformance';
import { Search, Loader2, Award, ArrowLeft, Plus } from 'lucide-react';

export const PerformanceReviewList: React.FC = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { reviews, loading, updateStatus } = usePerformanceReviews();

  const filtered = reviews.filter(r => {
    const name = r.employees?.full_name?.toLowerCase() || '';
    const matchSearch = name.includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'SIGNED_OFF'];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-950/60 text-slate-400 border-slate-800/50',
      SELF_ASSESSMENT: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
      MANAGER_REVIEW: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      CALIBRATION: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
      SIGNED_OFF: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    };
    return map[s] || 'bg-gray-900 text-gray-400 border-gray-700';
  };

  const nextStatus = (current: string): string | null => {
    const flow = ['DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'SIGNED_OFF'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/performance" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-white">Review Kinerja</h1>
            <p className="text-xs text-gray-500 mt-1">{filtered.length} review</p>
          </div>
        </div>
        <Link to="/performance/new" className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Review Baru
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Cari karyawan..." className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white placeholder-gray-600 text-xs" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-white text-black font-bold' : 'bg-[#121212] text-gray-400 border border-[#262626] hover:bg-[#181818]'
              }`}>{s === 'all' ? 'Semua' : s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <Award className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-xs text-gray-500">Belum ada review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const next = nextStatus(r.status);
            return (
              <div key={r.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 hover:border-[#2a2a2a] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {r.employees?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.employees?.full_name} <span className="text-gray-500 font-normal">• {r.period}</span></p>
                      <p className="text-[10px] text-gray-400">KPI: {r.kpi_score} | Kompetensi: {r.competency_score} | Rating: {r.final_rating}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(r.status)}`}>{r.status.replace('_', ' ')}</span>
                    {next && (
                      <button onClick={async () => { await updateStatus(r.id, next); }}
                        className="px-2 py-1 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] rounded-lg text-[10px] text-gray-300">
                        → {next.replace('_', ' ')}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">{r.nine_box_quadrant} • Bonus Multiplier: {r.bonus_multiplier}x</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
