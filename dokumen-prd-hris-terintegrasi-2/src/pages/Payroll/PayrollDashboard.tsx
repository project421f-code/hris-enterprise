import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePayrollRuns, calculatePayroll, PayrollSimulationInput } from '../../hooks/usePayroll';
import { Loader2, DollarSign, TrendingUp, Users, Receipt, ArrowRight, Calculator, Plus } from 'lucide-react';

export const PayrollDashboard: React.FC = () => {
  const { runs, loading } = usePayrollRuns();
  const activeRun = runs.find(r => r.status === 'DRAFT' || r.status === 'PROCESSING');
  
  // Simulator state
  const [simInput, setSimInput] = useState<PayrollSimulationInput>({
    basicSalary: 12000000, allowance: 1000000, overtimePay: 500000, bonus: 0, ptkpStatus: 'TK/0',
  });
  const simResult = calculatePayroll(simInput);

  const totalPaid = runs.filter(r => r.status === 'PAID').length;
  const monthName = (m: number) => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m - 1] || m;

  const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Payroll Engine</h1>
          <p className="text-xs text-gray-500 mt-1">PPh 21 TER PMK 168/2023 • BPJS Capping Engine</p>
        </div>
        <Link to="/payroll/runs/new" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all">
          <Plus className="w-4 h-4" /> Periode Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Periode', value: runs.length, icon: Receipt, color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/30' },
          { label: 'Periode Aktif', value: activeRun ? `${monthName(activeRun.month)} ${activeRun.year}` : '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/30' },
          { label: 'Sudah Dibayar', value: totalPaid, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-950/30 border-purple-800/30' },
          { label: 'Status', value: activeRun ? 'Draft Aktif' : 'Tidak Ada', icon: Users, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/30' },
        ].map(c => (
          <div key={c.label} className={`p-3.5 rounded-2xl border ${c.bg}`}>
            <div className="flex items-center justify-between">
              <div><p className="text-[10px] text-gray-400">{c.label}</p><p className="text-sm font-bold text-white mt-0.5">{c.value}</p></div>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Active Period */}
      {activeRun && (
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Periode Aktif: {monthName(activeRun.month)} {activeRun.year}</h3>
                <p className="text-xs text-gray-500">Status: {activeRun.status}</p>
              </div>
            </div>
            <Link to={`/payroll/runs/${activeRun.id}`} className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] rounded-xl text-xs text-gray-300 flex items-center gap-1.5">
              Detail <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/payroll/runs" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-blue-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Receipt className="w-4 h-4 text-blue-400" /><span className="text-xs text-gray-300">Semua Periode Payroll</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/payroll/runs/new" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-emerald-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Plus className="w-4 h-4 text-emerald-400" /><span className="text-xs text-gray-300">Buat Periode Baru</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
        <Link to="/payroll/simulator" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-amber-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3"><Calculator className="w-4 h-4 text-amber-400" /><span className="text-xs text-gray-300">Simulator PPh 21 TER</span></div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
        </Link>
      </div>

      {/* Inline Payroll Simulator */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-amber-400" /> Simulasi PPh 21 TER & BPJS
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400">Gaji Pokok</label>
                <input type="number" value={simInput.basicSalary} onChange={e => setSimInput({...simInput, basicSalary: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Tunjangan</label>
                <input type="number" value={simInput.allowance} onChange={e => setSimInput({...simInput, allowance: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Upah Lembur</label>
                <input type="number" value={simInput.overtimePay} onChange={e => setSimInput({...simInput, overtimePay: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Status PTKP</label>
                <select value={simInput.ptkpStatus} onChange={e => setSimInput({...simInput, ptkpStatus: e.target.value})}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1">
                  {['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          {/* Result */}
          <div className="bg-[#080808] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Gaji Bruto</span><span className="text-white font-bold">{formatRp(simResult.grossSalary)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Kategori TER</span><span className="text-blue-400 font-bold">{simResult.terCategory}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Tarif TER</span><span className="text-amber-400 font-bold">{simResult.terRate}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">PPh 21</span><span className="text-amber-400 font-bold">{formatRp(simResult.pph21Tax)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">BPJS Kes (Karyawan)</span><span className="text-indigo-400">{formatRp(simResult.bpjsHealthEmp)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">BPJS TK (Karyawan)</span><span className="text-indigo-400">{formatRp(simResult.bpjsJhtEmp + simResult.bpjsJpEmp)}</span></div>
            <div className="border-t border-[#1a1a1a] pt-2 flex justify-between"><span className="text-gray-400 font-bold">Take Home Pay</span><span className="text-emerald-400 font-bold text-sm">{formatRp(simResult.netSalary)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
