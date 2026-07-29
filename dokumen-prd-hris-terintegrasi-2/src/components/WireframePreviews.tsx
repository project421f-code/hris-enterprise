import React, { useState } from 'react';
import { Smartphone, Monitor, MapPin, Calendar, DollarSign, Award, Clock, CheckCircle2, User, ChevronRight, Shield, Bell } from 'lucide-react';

export const WireframePreviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ess-mobile' | 'payroll-dashboard' | 'leave-approval' | 'performance-card'>('ess-mobile');

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1a1a1a] pb-4 gap-4">
        <div>
          <h3 className="text-lg font-serif italic text-white">Wireframe & Feature Screen Mockups</h3>
          <p className="text-xs text-gray-500">Pratinjau Antarmuka Pengguna (UI Wireframe) untuk Aplikasi ESS Mobile & Dashboard Admin HR</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ess-mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'ess-mobile' ? 'bg-white text-black font-bold uppercase tracking-wider shadow-sm' : 'bg-[#141414] text-gray-400 hover:bg-[#1f1f1f] hover:text-white border border-[#222222]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> ESS Mobile App
          </button>
          <button
            onClick={() => setActiveTab('payroll-dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'payroll-dashboard' ? 'bg-white text-black font-bold uppercase tracking-wider shadow-sm' : 'bg-[#141414] text-gray-400 hover:bg-[#1f1f1f] hover:text-white border border-[#222222]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Payroll Dashboard Admin
          </button>
          <button
            onClick={() => setActiveTab('leave-approval')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'leave-approval' ? 'bg-white text-black font-bold uppercase tracking-wider shadow-sm' : 'bg-[#141414] text-gray-400 hover:bg-[#1f1f1f] hover:text-white border border-[#222222]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Alur Cuti & Manager
          </button>
          <button
            onClick={() => setActiveTab('performance-card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'performance-card' ? 'bg-white text-black font-bold uppercase tracking-wider shadow-sm' : 'bg-[#141414] text-gray-400 hover:bg-[#1f1f1f] hover:text-white border border-[#222222]'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Evaluasi Kinerja Karyawan
          </button>
        </div>
      </div>

      {/* Wireframe View Area */}
      <div className="bg-[#050505] rounded-2xl p-6 min-h-[480px] flex items-center justify-center border border-[#1f1f1f]">
        {activeTab === 'ess-mobile' && (
          <div className="w-[300px] h-[560px] bg-slate-950 rounded-[40px] p-4 border-4 border-slate-800 shadow-2xl relative flex flex-col justify-between overflow-hidden text-slate-100">
            {/* Notch */}
            <div className="w-28 h-4 bg-slate-900 mx-auto rounded-b-xl mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800"></div>
            </div>

            {/* App Header */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">AS</div>
                  <div>
                    <h5 className="font-bold text-xs text-white leading-tight">Andi Pratama</h5>
                    <p className="text-[10px] text-slate-400">Software Engineer</p>
                  </div>
                </div>
                <Bell className="w-4 h-4 text-slate-400" />
              </div>

              {/* Status Attendance Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between text-[11px] text-blue-100 font-medium">
                  <span>Shift Reguler (08:00 - 17:00)</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold">WFO Valid</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-blue-200 block">Jam Masuk Hari Ini</span>
                    <span className="text-xl font-black text-white">07:54 AM</span>
                  </div>
                  <button className="bg-white text-blue-900 text-xs font-bold px-3 py-2 rounded-xl shadow">
                    Clock-Out
                  </button>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px]">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Cuti</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Lembur</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Slip Gaji</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>KPI Saya</span>
                </div>
              </div>

              {/* Attendance Log List */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Absensi Terakhir</span>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between text-[11px]">
                  <span>Selasa, 28 Jul</span>
                  <span className="text-emerald-400 font-medium">07:58 - 17:05</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between text-[11px]">
                  <span>Senin, 27 Jul</span>
                  <span className="text-emerald-400 font-medium">07:51 - 17:12</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 pt-2 flex justify-around text-slate-500 text-[10px]">
              <span className="text-blue-400 font-bold">Home</span>
              <span>Absensi</span>
              <span>Pengajuan</span>
              <span>Profil</span>
            </div>
          </div>
        )}

        {activeTab === 'payroll-dashboard' && (
          <div className="w-full max-w-3xl bg-slate-950 rounded-2xl border border-slate-800 p-5 text-slate-100 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Payroll Run - Juli 2026 (Periode #2026-07)</h4>
                <p className="text-xs text-slate-400">Total 124 Karyawan Diproses | Status: Draft Ready to Disburse</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-slate-800 text-xs px-3 py-1.5 rounded-lg border border-slate-700">Export BCA Transfer</button>
                <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Kunci & Kirim Slip Gaji</button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Gross Payroll</span>
                <span className="text-base font-bold text-white">Rp 1.420.000.000</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Potongan PPh 21 TER</span>
                <span className="text-base font-bold text-amber-400">Rp 84.500.000</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Iuran BPJS Kesehatan/TK</span>
                <span className="text-base font-bold text-indigo-400">Rp 68.200.000</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Take-Home Pay</span>
                <span className="text-base font-bold text-emerald-400">Rp 1.267.300.000</span>
              </div>
            </div>

            {/* Table Sample */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Karyawan</th>
                    <th className="p-2">Gaji Pokok</th>
                    <th className="p-2">Lembur/Tunjangan</th>
                    <th className="p-2">PPh 21 TER</th>
                    <th className="p-2">BPJS Total</th>
                    <th className="p-2 text-right">Net THP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  <tr>
                    <td className="p-2 font-semibold">Budi Santoso (Engineering)</td>
                    <td className="p-2">Rp 18.000.000</td>
                    <td className="p-2 text-emerald-400">+Rp 3.500.000</td>
                    <td className="p-2 text-amber-400">-Rp 1.290.000</td>
                    <td className="p-2 text-indigo-400">-Rp 560.000</td>
                    <td className="p-2 text-right font-bold text-emerald-400">Rp 19.650.000</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Citra Dewi (Marketing)</td>
                    <td className="p-2">Rp 12.000.000</td>
                    <td className="p-2 text-emerald-400">+Rp 1.500.000</td>
                    <td className="p-2 text-amber-400">-Rp 810.000</td>
                    <td className="p-2 text-indigo-400">-Rp 460.000</td>
                    <td className="p-2 text-right font-bold text-emerald-400">Rp 12.230.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leave-approval' && (
          <div className="w-full max-w-2xl bg-slate-950 rounded-2xl border border-slate-800 p-5 text-slate-100 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-white">Inbox Approval Cuti & Izin Tim (Manager View)</h4>
            
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold">R</div>
                    <div>
                      <h5 className="font-bold text-white">Rina Wati</h5>
                      <p className="text-[10px] text-slate-400">UI/UX Designer • Cuti Tahunan (3 Hari)</p>
                    </div>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">Menunggu Approval</span>
                </div>
                <p className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded">"Pengajuan Cuti Tahunan untuk acara keluarga dari tanggal 12 Aug - 14 Aug 2026. Sisa saldo: 8 Hari."</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button className="bg-rose-900/60 text-rose-200 border border-rose-700 px-3 py-1 rounded-lg">Tolak</button>
                  <button className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold">Setujui Cuti</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance-card' && (
          <div className="w-full max-w-2xl bg-slate-950 rounded-2xl border border-slate-800 p-5 text-slate-100 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Kartu Evaluasi Kinerja (Q2 2026)</h4>
                <p className="text-xs text-slate-400">Individu: Andi Pratama | Department: Product & Tech</p>
              </div>
              <span className="bg-purple-600/30 text-purple-300 border border-purple-500 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                Rating A (Sangat Memuaskan)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>Pencapaian Key Results KPI (Bobot 70%)</span>
                <span className="font-bold text-emerald-400">94.5 / 100</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>Evaluasi Soft Skill & Kompetensi (Bobot 30%)</span>
                <span className="font-bold text-indigo-400">88.0 / 100</span>
              </div>
              <div className="bg-purple-950/40 border border-purple-800/80 p-3 rounded-xl flex justify-between items-center">
                <span>Kuadran 9-Box & Bonus Multiplier</span>
                <span className="font-bold text-purple-200">Star Player (Multiplier 150%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
