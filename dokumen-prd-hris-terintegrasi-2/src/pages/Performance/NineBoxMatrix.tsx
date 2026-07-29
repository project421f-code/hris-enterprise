import React from 'react';
import { Link } from 'react-router-dom';
import { usePerformanceReviews } from '../../hooks/usePerformance';
import { ArrowLeft, Loader2, Star } from 'lucide-react';

const BOX_LABELS = ['Rendah', 'Sedang', 'Tinggi'];

const BOX_DATA: Record<string, { label: string; color: string; textColor: string; desc: string; multiplier: string }> = {
  '3-3': { label: 'Star / High Flyer', color: 'bg-emerald-600/30 border-emerald-500', textColor: 'text-emerald-300', desc: 'Kinerja & Potensi Tinggi', multiplier: 'Bonus 150%' },
  '3-2': { label: 'Future Star', color: 'bg-emerald-600/20 border-emerald-500/60', textColor: 'text-emerald-300', desc: 'Kinerja Tinggi, Potensi Sedang', multiplier: 'Bonus 150%' },
  '3-1': { label: 'Rising Talent', color: 'bg-blue-600/20 border-blue-500/60', textColor: 'text-blue-300', desc: 'Kinerja Tinggi, Potensi Rendah', multiplier: 'Bonus 125%' },
  '2-3': { label: 'Core Performer', color: 'bg-indigo-600/20 border-indigo-500/60', textColor: 'text-indigo-300', desc: 'Kinerja Sedang, Potensi Tinggi', multiplier: 'Bonus 100%' },
  '2-2': { label: 'Core Player', color: 'bg-slate-600/20 border-slate-500/60', textColor: 'text-slate-300', desc: 'Kinerja & Potensi Sedang', multiplier: 'Bonus 100%' },
  '2-1': { label: 'Average Performer', color: 'bg-amber-600/20 border-amber-500/60', textColor: 'text-amber-300', desc: 'Kinerja Sedang, Potensi Rendah', multiplier: 'Bonus 75%' },
  '1-3': { label: 'Enigma', color: 'bg-purple-600/20 border-purple-500/60', textColor: 'text-purple-300', desc: 'Potensi Tinggi, Kinerja Rendah', multiplier: 'PIP Program' },
  '1-2': { label: 'Underperformer', color: 'bg-rose-600/20 border-rose-500/60', textColor: 'text-rose-300', desc: 'Potensi Sedang, Kinerja Rendah', multiplier: 'PIP Program' },
  '1-1': { label: 'Low Performer', color: 'bg-red-600/20 border-red-500/60', textColor: 'text-red-300', desc: 'Kinerja & Potensi Rendah', multiplier: 'PIP + Review' },
};

export const NineBoxMatrix: React.FC = () => {
  const { reviews, loading } = usePerformanceReviews();

  const getCount = (perf: number, pot: number) => reviews.filter(r => {
    const avg = (r.kpi_score + r.competency_score) / 2;
    const p = avg >= 85 ? 3 : avg >= 70 ? 2 : 1;
    const po = r.competency_score >= 80 ? 3 : r.competency_score >= 65 ? 2 : 1;
    return p === perf && po === pot;
  }).length;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/performance" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-white">Matriks 9-Box</h1>
          <p className="text-xs text-gray-500 mt-1">Potential vs Performance • Talent Mapping</p>
        </div>
      </div>

      {/* 9-Box Grid */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
        <div className="grid grid-cols-4 gap-1 text-xs mb-2">
          <div></div>
          {BOX_LABELS.map(l => <div key={l} className="text-center text-[10px] text-gray-500 font-medium uppercase tracking-wider">{l}</div>)}
        </div>
        <div className="grid grid-cols-4 gap-1 text-xs mb-2">
          <div className="text-[10px] text-gray-500 font-medium flex items-center pr-2">Potensi →</div>
          {[3, 2, 1].map(pot => (
            <div key={pot} className="text-center text-[10px] text-gray-600">{BOX_LABELS[pot - 1]}</div>
          ))}
        </div>
        <div className="space-y-1">
          {[3, 2, 1].map(perf => (
            <div key={perf} className="grid grid-cols-4 gap-1">
              <div className="text-[10px] text-gray-500 flex items-center">
                <span className="rotate-180 writing-mode-vertical">{BOX_LABELS[perf - 1]}</span>
              </div>
              {[3, 2, 1].map(pot => {
                const key = `${perf}-${pot}`;
                const box = BOX_DATA[key];
                const count = getCount(perf, pot);
                return (
                  <div key={key} className={`p-3 rounded-xl border ${box?.color || 'bg-[#080808] border-[#1a1a1a]'} min-h-[90px] relative group cursor-default hover:scale-[1.02] transition-all`}>
                    <div className="space-y-1">
                      <div className={`text-[10px] font-bold ${box?.textColor || 'text-gray-400'}`}>{box?.label || key}</div>
                      <div className={`text-lg font-black ${count > 0 ? 'text-white' : 'text-gray-600'}`}>{count}</div>
                      <div className="text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{box?.multiplier}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-1">
          <div></div>
          {[1, 2, 3].map(() => <div key={Math.random()} className="text-[9px] text-gray-600 text-center">↑ Kinerja</div>)}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4">
        <h3 className="text-xs font-bold text-white mb-2">Keterangan Bonus Multiplier</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
            <p className="font-bold text-emerald-300">Rating A (Sangat Memuaskan)</p>
            <p className="text-[10px] text-gray-400">Multiplier 150% + Rekomendasi Kenaikan Gaji 10-15%</p>
          </div>
          <div className="p-2 bg-slate-950/30 border border-slate-800/40 rounded-lg">
            <p className="font-bold text-slate-300">Rating B (Memuaskan)</p>
            <p className="text-[10px] text-gray-400">Multiplier 100% + Kenaikan Gaji 5-8%</p>
          </div>
          <div className="p-2 bg-rose-950/30 border border-rose-800/40 rounded-lg">
            <p className="font-bold text-rose-300">Rating C/D (Perlu Perbaikan)</p>
            <p className="text-[10px] text-gray-400">Multiplier 0% + Performance Improvement Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};
