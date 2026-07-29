import React, { useState } from 'react';
import { Award, TrendingUp, Users, Target } from 'lucide-react';

export const PerformanceMatrixSimulator: React.FC = () => {
  const [performance, setPerformance] = useState<'low' | 'medium' | 'high'>('high');
  const [potential, setPotential] = useState<'low' | 'medium' | 'high'>('high');

  const matrixMap = {
    'high-high': { title: 'Star / High Flyer', quadrant: 'Q1', multiplier: 1.5, desc: 'Performa & potensi sangat tinggi. Calon pemimpin masa depan. Berhak atas bonus maksimal & promosi.', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' },
    'medium-high': { title: 'High Potential', quadrant: 'Q2', multiplier: 1.25, desc: 'Potensi tinggi dengan kinerja memuaskan. Siap diberikan tanggung jawab lebih besar.', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-900' },
    'low-high': { title: 'Enigma / Rough Diamond', quadrant: 'Q3', multiplier: 1.0, desc: 'Potensi tinggi namun kinerja belum optimal. Perlu bimbingan & pencocokan peran.', color: 'bg-[#141414] text-emerald-400 border-[#222222]' },

    'high-medium': { title: 'High Performer', quadrant: 'Q4', multiplier: 1.25, desc: 'Hasil kerja melampaui target konsisten dengan potensi sedang. Kunci produktivitas tim.', color: 'bg-blue-950/80 text-blue-300 border-blue-800' },
    'medium-medium': { title: 'Core Player', quadrant: 'Q5', multiplier: 1.0, desc: 'Kinerja dan potensi stabil sesuai harapan. Tulang punggung operasional harian.', color: 'bg-blue-950/40 text-blue-300 border-blue-900' },
    'low-medium': { title: 'Dilemma', quadrant: 'Q6', multiplier: 0.75, desc: 'Kinerja dan potensi di bawah rata-rata. Memerlukan pelatihan ulang dan pemantauan.', color: 'bg-amber-950/50 text-amber-300 border-amber-800' },

    'high-low': { title: 'Solid Professional / Workhorse', quadrant: 'Q7', multiplier: 1.0, desc: 'Sangat ahli di bidangnya saat ini meski potensi kepemimpinan terbatas.', color: 'bg-[#181818] text-gray-300 border-[#2a2a2a]' },
    'medium-low': { title: 'Effective Worker', quadrant: 'Q8', multiplier: 0.75, desc: 'Memenuhi ekspektasi standar pekerjaan rutin.', color: 'bg-[#141414] text-gray-400 border-[#222222]' },
    'low-low': { title: 'Underperformer / Risk', quadrant: 'Q9', multiplier: 0.0, desc: 'Kinerja & potensi rendah. Perlu masukan dalam Program PIP (Performance Improvement Plan).', color: 'bg-rose-950/80 text-rose-300 border-rose-800' },
  };

  const currentKey = `${performance}-${potential}` as keyof typeof matrixMap;
  const currentBox = matrixMap[currentKey];

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#181818] text-purple-400 border border-[#2a2a2a] rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Simulator Matriks 9-Box & Bonus Multiplier</h3>
            <p className="text-xs text-gray-500">Pemetaan Talenta (Performance vs Potential) & Integrasi Insentif Payroll</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-4 bg-[#0a0a0a] p-5 rounded-xl border border-[#1a1a1a]">
          <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Pilih Rating Evaluasi Karyawan</h4>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Tingkat Kinerja (Performance Score):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setPerformance(lvl)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize transition-all ${
                    performance === lvl ? 'bg-purple-600 text-white shadow-sm' : 'bg-[#141414] text-gray-400 border border-[#262626] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  {lvl === 'low' ? 'Rendah' : lvl === 'medium' ? 'Sedang' : 'Tinggi'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Tingkat Potensi Kepemimpinan (Potential Score):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setPotential(lvl)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg capitalize transition-all ${
                    potential === lvl ? 'bg-purple-600 text-white shadow-sm' : 'bg-[#141414] text-gray-400 border border-[#262626] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  {lvl === 'low' ? 'Rendah' : lvl === 'medium' ? 'Sedang' : 'Tinggi'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-xl space-y-2">
            <span className="text-xs uppercase font-mono text-purple-300 tracking-wider">Rekomendasi Payroll & Bonus</span>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-purple-200">Pengali Bonus Kinerja:</span>
              <span className="text-xl font-mono font-bold text-purple-300">{(currentBox.multiplier * 100)}%</span>
            </div>
            <p className="text-[11px] text-purple-300/80">Bonus Kinerja = Base Bonus × {currentBox.multiplier}</p>
          </div>
        </div>

        {/* 9-Box Grid Graphic */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest text-center">Matriks 9-Box Talent Grid</h4>
          
          <div className="grid grid-cols-3 gap-2 aspect-square max-w-md mx-auto p-2 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]">
            {/* Top row: High Potential */}
            {['low-high', 'medium-high', 'high-high'].map((key) => {
              const item = matrixMap[key as keyof typeof matrixMap];
              const isSelected = key === currentKey;
              return (
                <div
                  key={key}
                  onClick={() => {
                    const [p, pot] = key.split('-');
                    setPerformance(p as any);
                    setPotential(pot as any);
                  }}
                  className={`p-2.5 rounded-xl flex flex-col justify-between cursor-pointer text-left transition-all border ${
                    isSelected ? 'ring-2 ring-purple-500 border-purple-400 scale-[1.02] shadow-md z-10 font-bold' : 'opacity-70 hover:opacity-100'
                  } ${item.color}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">{item.quadrant}</span>
                  <span className="text-xs leading-tight font-semibold">{item.title}</span>
                  <span className="text-[10px] font-mono mt-1 opacity-90">{item.multiplier * 100}% Bonus</span>
                </div>
              );
            })}

            {/* Middle row: Medium Potential */}
            {['low-medium', 'medium-medium', 'high-medium'].map((key) => {
              const item = matrixMap[key as keyof typeof matrixMap];
              const isSelected = key === currentKey;
              return (
                <div
                  key={key}
                  onClick={() => {
                    const [p, pot] = key.split('-');
                    setPerformance(p as any);
                    setPotential(pot as any);
                  }}
                  className={`p-2.5 rounded-xl flex flex-col justify-between cursor-pointer text-left transition-all border ${
                    isSelected ? 'ring-2 ring-purple-500 border-purple-400 scale-[1.02] shadow-md z-10 font-bold' : 'opacity-70 hover:opacity-100'
                  } ${item.color}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">{item.quadrant}</span>
                  <span className="text-xs leading-tight font-semibold">{item.title}</span>
                  <span className="text-[10px] font-mono mt-1 opacity-90">{item.multiplier * 100}% Bonus</span>
                </div>
              );
            })}

            {/* Bottom row: Low Potential */}
            {['low-low', 'medium-low', 'high-low'].map((key) => {
              const item = matrixMap[key as keyof typeof matrixMap];
              const isSelected = key === currentKey;
              return (
                <div
                  key={key}
                  onClick={() => {
                    const [p, pot] = key.split('-');
                    setPerformance(p as any);
                    setPotential(pot as any);
                  }}
                  className={`p-2.5 rounded-xl flex flex-col justify-between cursor-pointer text-left transition-all border ${
                    isSelected ? 'ring-2 ring-purple-500 border-purple-400 scale-[1.02] shadow-md z-10 font-bold' : 'opacity-70 hover:opacity-100'
                  } ${item.color}`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">{item.quadrant}</span>
                  <span className="text-xs leading-tight font-semibold">{item.title}</span>
                  <span className="text-[10px] font-mono mt-1 opacity-90">{item.multiplier * 100}% Bonus</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs space-y-1">
            <span className="font-bold text-white">Hasil Kategori: {currentBox.title}</span>
            <p className="text-gray-400">{currentBox.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
