import React, { useState } from 'react';
import { PayrollInput, PayrollResult } from '../../types';
import { Calculator, Info, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

export const PayrollSimulator: React.FC = () => {
  const [input, setInput] = useState<PayrollInput>({
    basicSalary: 10000000,
    fixedAllowance: 2000000,
    variableAllowance: 1000000,
    overtimeHours: 10,
    ptkpStatus: 'TK/0',
    includeBPJSKesehatan: true,
    includeBPJSKetenagakerjaan: true,
    unpaidLeaveDays: 0,
  });

  // Calculate payroll based on Indonesian regulations
  const calculatePayroll = (data: PayrollInput): PayrollResult => {
    const hourlyRate = (data.basicSalary + data.fixedAllowance) / 173;
    
    // Overtime calculation (Permenaker 102/2004)
    // 1st hour: 1.5x, subsequent hours: 2.0x
    let overtimePay = 0;
    if (data.overtimeHours > 0) {
      if (data.overtimeHours === 1) {
        overtimePay = 1.5 * hourlyRate;
      } else {
        overtimePay = (1.5 * hourlyRate) + ((data.overtimeHours - 1) * 2.0 * hourlyRate);
      }
    }

    // Unpaid leave deduction (21 working days per month standard)
    const dailyRate = (data.basicSalary + data.fixedAllowance) / 21;
    const unpaidDeduction = data.unpaidLeaveDays * dailyRate;

    const grossSalary = Math.max(0, data.basicSalary + data.fixedAllowance + data.variableAllowance + overtimePay - unpaidDeduction);

    // BPJS Calculations
    // BPJS Kesehatan: 4% company, 1% employee (Cap at Rp 12.000.000)
    const bpjsKesBase = Math.min(grossSalary, 12000000);
    const bpjsKesEmployee = data.includeBPJSKesehatan ? bpjsKesBase * 0.01 : 0;
    const bpjsKesCompany = data.includeBPJSKesehatan ? bpjsKesBase * 0.04 : 0;

    // BPJS Ketenagakerjaan:
    // JHT: 2% employee, 3.7% company
    // JP: 1% employee, 2% company (Cap at Rp 10.042.300)
    // JKK: 0.24% company (low risk standard)
    // JKM: 0.3% company
    const jpBase = Math.min(grossSalary, 10042300);
    
    const bpjsJhtEmployee = data.includeBPJSKetenagakerjaan ? grossSalary * 0.02 : 0;
    const bpjsJhtCompany = data.includeBPJSKetenagakerjaan ? grossSalary * 0.037 : 0;

    const bpjsJpEmployee = data.includeBPJSKetenagakerjaan ? jpBase * 0.01 : 0;
    const bpjsJpCompany = data.includeBPJSKetenagakerjaan ? jpBase * 0.02 : 0;

    const bpjsJkkCompany = data.includeBPJSKetenagakerjaan ? grossSalary * 0.0024 : 0;
    const bpjsJkmCompany = data.includeBPJSKetenagakerjaan ? grossSalary * 0.0030 : 0;

    // Determine PPh 21 TER Kategori (PMK 168/2023)
    let taxCategoryTER: 'A' | 'B' | 'C' = 'A';
    if (['TK/0', 'TK/1', 'K/0'].includes(data.ptkpStatus)) {
      taxCategoryTER = 'A';
    } else if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(data.ptkpStatus)) {
      taxCategoryTER = 'B';
    } else {
      taxCategoryTER = 'C';
    }

    // TER Rate Lookup Table (Simulated Approximation based on PMK 168/2023)
    let taxRateTERPercentage = 0;
    if (taxCategoryTER === 'A') {
      if (grossSalary <= 5400000) taxRateTERPercentage = 0;
      else if (grossSalary <= 5650000) taxRateTERPercentage = 0.25;
      else if (grossSalary <= 5950000) taxRateTERPercentage = 0.5;
      else if (grossSalary <= 6300000) taxRateTERPercentage = 0.75;
      else if (grossSalary <= 6750000) taxRateTERPercentage = 1.0;
      else if (grossSalary <= 7500000) taxRateTERPercentage = 1.25;
      else if (grossSalary <= 8500000) taxRateTERPercentage = 1.5;
      else if (grossSalary <= 9600000) taxRateTERPercentage = 1.75;
      else if (grossSalary <= 10000000) taxRateTERPercentage = 2.25;
      else if (grossSalary <= 11000000) taxRateTERPercentage = 3.0;
      else if (grossSalary <= 12500000) taxRateTERPercentage = 4.0;
      else if (grossSalary <= 15000000) taxRateTERPercentage = 6.0;
      else if (grossSalary <= 18000000) taxRateTERPercentage = 8.0;
      else if (grossSalary <= 25000000) taxRateTERPercentage = 10.0;
      else taxRateTERPercentage = 15.0;
    } else if (taxCategoryTER === 'B') {
      if (grossSalary <= 6200000) taxRateTERPercentage = 0;
      else if (grossSalary <= 6500000) taxRateTERPercentage = 0.25;
      else if (grossSalary <= 7000000) taxRateTERPercentage = 0.5;
      else if (grossSalary <= 8000000) taxRateTERPercentage = 1.0;
      else if (grossSalary <= 10000000) taxRateTERPercentage = 2.0;
      else if (grossSalary <= 13000000) taxRateTERPercentage = 3.5;
      else if (grossSalary <= 16000000) taxRateTERPercentage = 5.0;
      else if (grossSalary <= 20000000) taxRateTERPercentage = 7.0;
      else taxRateTERPercentage = 12.0;
    } else {
      // TER C
      if (grossSalary <= 6600000) taxRateTERPercentage = 0;
      else if (grossSalary <= 7300000) taxRateTERPercentage = 0.25;
      else if (grossSalary <= 9000000) taxRateTERPercentage = 1.0;
      else if (grossSalary <= 12000000) taxRateTERPercentage = 2.5;
      else if (grossSalary <= 15000000) taxRateTERPercentage = 4.5;
      else if (grossSalary <= 20000000) taxRateTERPercentage = 6.5;
      else taxRateTERPercentage = 11.0;
    }

    const pph21Monthly = grossSalary * (taxRateTERPercentage / 100);

    const totalEmployeeDeductions = bpjsKesEmployee + bpjsJhtEmployee + bpjsJpEmployee + pph21Monthly;
    const netTakeHomePay = grossSalary - totalEmployeeDeductions;
    const totalCompanyCost = grossSalary + bpjsKesCompany + bpjsJhtCompany + bpjsJpCompany + bpjsJkkCompany + bpjsJkmCompany;

    return {
      grossSalary,
      overtimePay,
      unpaidDeduction,
      bpjsKesEmployee,
      bpjsKesCompany,
      bpjsJhtEmployee,
      bpjsJhtCompany,
      bpjsJpEmployee,
      bpjsJpCompany,
      bpjsJkkCompany,
      bpjsJkmCompany,
      taxCategoryTER,
      taxRateTERPercentage,
      pph21Monthly,
      totalEmployeeDeductions,
      netTakeHomePay,
      totalCompanyCost
    };
  };

  const result = calculatePayroll(input);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#181818] text-emerald-400 border border-[#2a2a2a] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Simulator Payroll & PPh 21 TER (PMK 168/2023)</h3>
            <p className="text-xs text-gray-500">Uji kalkulasi riil penghasilan bruto, potongan BPJS, PPh 21 TER, dan Net Take-Home Pay</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 bg-emerald-950/80 text-emerald-400 rounded-full border border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5" /> Sesuai Regulasi RI 2026
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-5 space-y-4 bg-[#0a0a0a] p-5 rounded-xl border border-[#1a1a1a]">
          <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">Input Komponen Gaji</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Gaji Pokok (Bulanan)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-gray-500 font-medium">Rp</span>
              <input
                type="number"
                value={input.basicSalary}
                onChange={(e) => setInput({ ...input, basicSalary: Number(e.target.value) })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Tunjangan Tetap</label>
              <input
                type="number"
                value={input.fixedAllowance}
                onChange={(e) => setInput({ ...input, fixedAllowance: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Tunjangan Variabel</label>
              <input
                type="number"
                value={input.variableAllowance}
                onChange={(e) => setInput({ ...input, variableAllowance: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Jam Lembur (SPL)</label>
              <input
                type="number"
                value={input.overtimeHours}
                onChange={(e) => setInput({ ...input, overtimeHours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Cuti Unpaid (Hari)</label>
              <input
                type="number"
                value={input.unpaidLeaveDays}
                onChange={(e) => setInput({ ...input, unpaidLeaveDays: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Status PTKP (Pajak)</label>
            <select
              value={input.ptkpStatus}
              onChange={(e) => setInput({ ...input, ptkpStatus: e.target.value as any })}
              className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="TK/0">TK/0 - Tidak Kawin (Rp 54 JT) [TER A]</option>
              <option value="TK/1">TK/1 - Tanggungan 1 (Rp 58.5 JT) [TER A]</option>
              <option value="K/0">K/0 - Kawin 0 (Rp 58.5 JT) [TER A]</option>
              <option value="TK/2">TK/2 - Tanggungan 2 (Rp 63 JT) [TER B]</option>
              <option value="K/1">K/1 - Kawin 1 (Rp 63 JT) [TER B]</option>
              <option value="K/2">K/2 - Kawin 2 (Rp 67.5 JT) [TER B]</option>
              <option value="K/3">K/3 - Kawin 3 (Rp 72 JT) [TER C]</option>
            </select>
          </div>

          <div className="pt-2 space-y-2 border-t border-[#1a1a1a]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
              <input
                type="checkbox"
                checked={input.includeBPJSKesehatan}
                onChange={(e) => setInput({ ...input, includeBPJSKesehatan: e.target.checked })}
                className="rounded border-[#262626] text-blue-500 focus:ring-blue-500 bg-[#141414]"
              />
              Sertakan BPJS Kesehatan (1% Karyawan / 4% Perusahaan)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
              <input
                type="checkbox"
                checked={input.includeBPJSKetenagakerjaan}
                onChange={(e) => setInput({ ...input, includeBPJSKetenagakerjaan: e.target.checked })}
                className="rounded border-[#262626] text-blue-500 focus:ring-blue-500 bg-[#141414]"
              />
              Sertakan BPJS Ketenagakerjaan (JHT + JP + JKK + JKM)
            </label>
          </div>
        </div>

        {/* Results Output */}
        <div className="lg:col-span-7 space-y-5">
          {/* Net Take Home Pay Highlight Box */}
          <div className="p-5 bg-[#0a0a0a] text-white rounded-xl border border-[#1a1a1a] shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-mono tracking-wider text-gray-400">Net Take-Home Pay (Gaji Bersih Diterima)</p>
                <h2 className="text-3xl font-mono font-bold text-emerald-400 mt-1">{formatRupiah(result.netTakeHomePay)}</h2>
              </div>
              <div className="p-3 bg-[#141414] border border-[#2a2a2a] rounded-xl">
                <DollarSign className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1a1a1a] grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-mono">Total Penghasilan Bruto:</span>
                <span className="font-bold font-mono text-white text-sm">{formatRupiah(result.grossSalary)}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono">Total Potongan Karyawan:</span>
                <span className="font-bold font-mono text-rose-400 text-sm">-{formatRupiah(result.totalEmployeeDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Earnings Breakdown */}
            <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] space-y-2">
              <div className="font-bold text-white border-b border-[#1a1a1a] pb-2 flex justify-between">
                <span>Penerimaan (Earnings)</span>
                <span className="text-blue-400 font-mono">{formatRupiah(result.grossSalary)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Gaji Pokok:</span>
                <span className="font-mono text-white">{formatRupiah(input.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tunjangan Tetap & Variabel:</span>
                <span className="font-mono text-white">{formatRupiah(input.fixedAllowance + input.variableAllowance)}</span>
              </div>
              {input.overtimeHours > 0 && (
                <div className="flex justify-between text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded">
                  <span>Upah Lembur ({input.overtimeHours} jam):</span>
                  <span className="font-mono font-semibold">+{formatRupiah(result.overtimePay)}</span>
                </div>
              )}
              {input.unpaidLeaveDays > 0 && (
                <div className="flex justify-between text-rose-300 bg-rose-950/60 border border-rose-800/50 px-2 py-1 rounded">
                  <span>Potongan Cuti Unpaid ({input.unpaidLeaveDays} hari):</span>
                  <span className="font-mono font-semibold">-{formatRupiah(result.unpaidDeduction)}</span>
                </div>
              )}
            </div>

            {/* Deductions Breakdown */}
            <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] space-y-2">
              <div className="font-bold text-white border-b border-[#1a1a1a] pb-2 flex justify-between">
                <span>Potongan (Deductions)</span>
                <span className="text-rose-400 font-mono">-{formatRupiah(result.totalEmployeeDeductions)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>BPJS Kesehatan (1%):</span>
                <span className="font-mono text-white">{formatRupiah(result.bpjsKesEmployee)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>BPJS JHT (2%):</span>
                <span className="font-mono text-white">{formatRupiah(result.bpjsJhtEmployee)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>BPJS JP (1% cap):</span>
                <span className="font-mono text-white">{formatRupiah(result.bpjsJpEmployee)}</span>
              </div>
              <div className="flex justify-between text-amber-200 font-semibold bg-amber-950/60 p-1.5 rounded border border-amber-800/50">
                <span>PPh 21 TER Kat {result.taxCategoryTER} ({result.taxRateTERPercentage}%):</span>
                <span className="font-mono text-amber-300">{formatRupiah(result.pph21Monthly)}</span>
              </div>
            </div>
          </div>

          {/* Employer Cost Callout */}
          <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-gray-400">Total Beban Anggaran Perusahaan (Total Cost to Company):</span>
            </div>
            <span className="font-bold font-mono text-blue-400 text-sm">{formatRupiah(result.totalCompanyCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
