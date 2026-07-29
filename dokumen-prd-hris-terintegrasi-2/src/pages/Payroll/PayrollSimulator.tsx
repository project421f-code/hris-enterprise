import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { calculatePayroll, PayrollSimulationInput } from '../../hooks/usePayroll';
import { ArrowLeft, Calculator, DollarSign, Info } from 'lucide-react';

const PTKP_OPTIONS = [
  { value: 'TK/0', label: 'TK/0 (Rp 54 jt/thn)', cat: 'A' },
  { value: 'TK/1', label: 'TK/1 (Rp 58.5 jt/thn)', cat: 'A' },
  { value: 'K/0', label: 'K/0 (Rp 58.5 jt/thn)', cat: 'A' },
  { value: 'TK/2', label: 'TK/2 (Rp 63 jt/thn)', cat: 'B' },
  { value: 'K/1', label: 'K/1 (Rp 63 jt/thn)', cat: 'B' },
  { value: 'TK/3', label: 'TK/3 (Rp 67.5 jt/thn)', cat: 'B' },
  { value: 'K/2', label: 'K/2 (Rp 67.5 jt/thn)', cat: 'B' },
  { value: 'K/3', label: 'K/3 (Rp 72 jt/thn)', cat: 'C' },
];

export const PayrollSimulator: React.FC = () => {
  const [input, setInput] = useState<PayrollSimulationInput>({
    basicSalary: 15000000, allowance: 2000000, overtimePay: 750000, bonus: 0, ptkpStatus: 'TK/0',
  });

  const result = calculatePayroll(input);
  const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link to="/payroll" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Kembali ke Payroll</Link>

      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-amber-400" /> Simulator PPh 21 TER & BPJS
        </h2>
        <p className="text-xs text-gray-500 mb-6">PMK 168/2023 • Kategori TER A / B / C</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#1a1a1a] pb-2">Data Gaji</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Gaji Pokok</label>
                <input type="number" value={input.basicSalary} onChange={e => setInput({...input, basicSalary: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Tunjangan Tetap</label>
                <input type="number" value={input.allowance} onChange={e => setInput({...input, allowance: Number(e.target.value)})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Upah Lembur</label>
                  <input type="number" value={input.overtimePay} onChange={e => setInput({...input, overtimePay: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Bonus</label>
                  <input type="number" value={input.bonus} onChange={e => setInput({...input, bonus: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400">Status PTKP</label>
                <select value={input.ptkpStatus} onChange={e => setInput({...input, ptkpStatus: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs mt-1">
                  {PTKP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} (TER {o.cat})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#1a1a1a] pb-2">Hasil Kalkulasi</h3>
            <div className="bg-[#080808] rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1"><span className="text-gray-400">Gaji Bruto</span><span className="text-white font-bold">{formatRp(result.grossSalary)}</span></div>
              <div className="border-t border-[#1a1a1a] pt-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">Pajak PPh 21 TER</p>
                <div className="flex justify-between"><span className="text-gray-400">Kategori</span><span className="text-blue-400 font-bold">{result.terCategory}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tarif Efektif</span><span className="text-amber-400 font-bold">{result.terRate}%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">PPh 21 Bulanan</span><span className="text-rose-400 font-bold">- {formatRp(result.pph21Tax)}</span></div>
              </div>
              <div className="border-t border-[#1a1a1a] pt-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">BPJS (Batas Gaji Rp 12jt / Rp 10jt)</p>
                <div className="flex justify-between"><span className="text-gray-400">BPJS Kesehatan (1%)</span><span className="text-indigo-400">- {formatRp(result.bpjsHealthEmp)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">JHT (2%)</span><span className="text-indigo-400">- {formatRp(result.bpjsJhtEmp)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">JP (1%)</span><span className="text-indigo-400">- {formatRp(result.bpjsJpEmp)}</span></div>
              </div>
              <div className="border-t border-[#1a1a1a] pt-2 space-y-1">
                <div className="flex justify-between"><span className="text-gray-400">Total Potongan</span><span className="text-rose-400">- {formatRp(result.totalDeductions)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-300 font-bold">Take Home Pay</span><span className="text-emerald-400 font-bold">{formatRp(result.netSalary)}</span></div>
              </div>
              <div className="border-t border-[#1a1a1a] pt-2">
                <div className="flex justify-between"><span className="text-gray-400 text-[10px]">Biaya Perusahaan (termasuk BPJS)</span><span className="text-purple-400 text-[10px]">{formatRp(result.totalCompanyCost)}</span></div>
              </div>
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-start gap-2 text-xs">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-blue-200 text-[11px]">
                Kalkulasi menggunakan Tarif Efektif Rata-rata (TER) PMK 168/2023 untuk Januari-November. 
                Untuk Desember, lakukan rekonsiliasi menggunakan tarif Pasal 17.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
