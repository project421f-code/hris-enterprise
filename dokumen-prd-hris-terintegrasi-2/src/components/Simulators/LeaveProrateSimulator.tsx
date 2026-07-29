import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const LeaveProrateSimulator: React.FC = () => {
  const [annualQuota, setAnnualQuota] = useState<number>(12);
  const [joinMonth, setJoinMonth] = useState<number>(4); // April
  const [joinYear, setJoinYear] = useState<number>(2025);
  const [carryOverAllowed, setCarryOverAllowed] = useState<number>(3);
  const [usedLeave, setUsedLeave] = useState<number>(4);

  const currentYear = 2026;
  const currentMonth = 7; // July

  // Calculate Prorate for new hire join year
  const monthsWorkedFirstYear = 12 - (joinMonth - 1);
  const prorateFirstYear = Math.round((monthsWorkedFirstYear / 12) * annualQuota);

  // Remaining leave in current year
  const accruedThisYear = Math.round((currentMonth / 12) * annualQuota);
  const totalAvailable = annualQuota + carryOverAllowed;
  const remainingLeave = Math.max(0, totalAvailable - usedLeave);

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#181818] text-emerald-400 border border-[#2a2a2a] rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Simulator Kebijakan Cuti & Prorata</h3>
            <p className="text-xs text-gray-500">Kalkulasi hak cuti tahunan, prorata karyawan baru, dan sisa saldo cuti</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-4 bg-[#0a0a0a] p-5 rounded-xl border border-[#1a1a1a]">
          <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Pengaturan Kuota Cuti</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Kuota Cuti Tahunan Standar</label>
              <input
                type="number"
                value={annualQuota}
                onChange={(e) => setAnnualQuota(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Batas Carry-Over Cuti Lalu</label>
              <input
                type="number"
                value={carryOverAllowed}
                onChange={(e) => setCarryOverAllowed(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Bulan Masuk (Join Month)</label>
              <select
                value={joinMonth}
                onChange={(e) => setJoinMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Tahun Masuk (Join Year)</label>
              <input
                type="number"
                value={joinYear}
                onChange={(e) => setJoinYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Cuti Sudah Diambil Tahun Ini</label>
            <input
              type="number"
              value={usedLeave}
              onChange={(e) => setUsedLeave(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0a0a0a] text-white rounded-xl border border-[#1a1a1a] shadow-sm space-y-3">
            <span className="text-xs uppercase font-mono text-gray-400 tracking-wider">Saldo Cuti Tersedia (Real-time)</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-mono font-bold text-emerald-400">{remainingLeave} <span className="text-lg font-sans font-medium text-gray-400">Hari</span></h2>
              <span className="text-xs font-mono bg-[#141414] border border-[#2a2a2a] px-2.5 py-1 rounded-full text-emerald-400">Tahun Berjalan {currentYear}</span>
            </div>
            <p className="text-xs text-gray-400">Rincian: Kuota Tahunan ({annualQuota} Hari) + Carry-Over ({carryOverAllowed} Hari) - Cuti Terpakai ({usedLeave} Hari)</p>
          </div>

          <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl space-y-3 text-xs">
            <h5 className="font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Hasil Kalkulasi Prorata Karyawan Baru
            </h5>
            <div className="grid grid-cols-2 gap-2 text-gray-400">
              <div>Lama Kerja Tahun Pertama:</div>
              <div className="font-mono font-semibold text-white">{monthsWorkedFirstYear} Bulan</div>
              <div>Hak Cuti Prorata Tahun Pertama:</div>
              <div className="font-mono font-semibold text-emerald-400">{prorateFirstYear} Hari Cuti</div>
              <div>Akrual Terkumpul Bulan Ini (Bulan ke-{currentMonth}):</div>
              <div className="font-mono font-semibold text-white">{accruedThisYear} Hari</div>
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Sisa cuti carry-over ({carryOverAllowed} hari) dari tahun {currentYear - 1} akan hangus otomatis jika tidak digunakan sebelum 31 Maret {currentYear}.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
