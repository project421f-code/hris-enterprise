import React from 'react';
import { Link } from 'react-router-dom';
import { usePerformanceReviews } from '../../hooks/usePerformance';
import { Award, Users, Star, TrendingUp, Plus, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { reviews, loading } = usePerformanceReviews();

  const signedOff = reviews.filter(r => r.status === 'SIGNED_OFF').length;
  const inProgress = reviews.filter(r => r.status !== 'SIGNED_OFF' && r.status !== 'DRAFT').length;
  const draft = reviews.filter(r => r.status === 'DRAFT').length;
  const avgKPI = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.kpi_score, 0) / reviews.length) : 0;

  // 9-Box Distribution
  const quadrants = ['Star / High Flyer', 'Future Star', 'Rising Talent', 'Core Performer', 'Core Player', 'Average Performer', 'Enigma / Potential', 'Underperformer', 'Low Performer - PIP'];
  const distribution = quadrants.map(q => ({
    name: q, count: reviews.filter(r => r.nine_box_quadrant === q).length,
  }));

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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Evaluasi Kinerja</h1>
          <p className="text-xs text-gray-500 mt-1">KPI/OKR • 360 Feedback • Matriks 9-Box</p>
        </div>
        <Link to="/performance/new" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all">
          <Plus className="w-4 h-4" /> Review Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Review', value: reviews.length, icon: Award, color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/30' },
          { label: 'Signed Off', value: signedOff, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/30' },
          { label: 'Dalam Proses', value: inProgress, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/30' },
          { label: 'Rata-rata KPI', value: `${avgKPI}`, icon: Star, color: 'text-purple-400', bg: 'bg-purple-950/30 border-purple-800/30' },
        ].map(c => (
          <div key={c.label} className={`p-3.5 rounded-2xl border ${c.bg}`}>
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] text-gray-400">{c.label}</p><p className="text-lg font-bold text-white mt-0.5">{c.value}</p></div>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 9-Box Distribution */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
        <h3 className="text-sm font-bold text-white mb-3">Distribusi 9-Box Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {distribution.map(d => (
            <div key={d.name} className="flex items-center justify-between p-2.5 bg-[#080808] rounded-lg text-xs">
              <span className="text-gray-300">{d.name}</span>
              <span className={`font-bold px-2 py-0.5 rounded ${d.count > 0 ? 'bg-blue-950/60 text-blue-400' : 'text-gray-600'}`}>{d.count} org</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Review Terbaru</h3>
          <Link to="/performance/reviews" className="text-[10px] text-blue-400 hover:underline">Lihat Semua</Link>
        </div>
        {reviews.length === 0 ? (
          <div className="p-8 text-center"><Award className="w-8 h-8 text-gray-600 mx-auto mb-2" /><p className="text-xs text-gray-500">Belum ada review kinerja</p></div>
        ) : (
          <div className="divide-y divide-[#1a1a1a] text-xs">
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="p-3.5 flex items-center justify-between hover:bg-[#141414]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    {r.employees?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{r.employees?.full_name} <span className="text-gray-500 font-normal">• {r.period}</span></p>
                    <p className="text-[10px] text-gray-400">KPI: {r.kpi_score} • Rating: {r.final_rating} • {r.nine_box_quadrant}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(r.status)}`}>{r.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/performance/reviews" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-blue-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Award className="w-4 h-4 text-blue-400" /><span className="text-xs text-gray-300">Semua Review</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/performance/matrix" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-purple-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Star className="w-4 h-4 text-purple-400" /><span className="text-xs text-gray-300">Matriks 9-Box</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/performance/new" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-emerald-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Plus className="w-4 h-4 text-emerald-400" /><span className="text-xs text-gray-300">Review Baru</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
      </div>
    </div>
  );
};
