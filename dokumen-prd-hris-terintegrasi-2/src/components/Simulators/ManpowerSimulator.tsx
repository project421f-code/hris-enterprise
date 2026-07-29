import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, AlertCircle, CheckCircle2, UserPlus, Briefcase, FileSpreadsheet, Building2 } from 'lucide-react';

export const ManpowerSimulator: React.FC = () => {
  const [department, setDepartment] = useState<string>('Engineering');
  const [currentHeadcount, setCurrentHeadcount] = useState<number>(15);
  const [targetAddHeadcount, setTargetAddHeadcount] = useState<number>(4);
  const [avgSalary, setAvgSalary] = useState<number>(12500000);
  const [overheadPercent, setOverheadPercent] = useState<number>(20); // BPJS + Tunjangan %
  const [recruitmentCostPerHead, setRecruitmentCostPerHead] = useState<number>(5000000);
  const [attritionRatePercent, setAttritionRatePercent] = useState<number>(5);
  const [hireQuarter, setHireQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q2');
  const [budgetLimit, setBudgetLimit] = useState<number>(600000000);

  // Calculations
  const expectedAttritionCount = Math.round((currentHeadcount * attritionRatePercent) / 100);
  const netHeadcountChange = targetAddHeadcount - expectedAttritionCount;
  const projectedFinalHeadcount = currentHeadcount + netHeadcountChange;

  const monthlyGrossCostPerHead = avgSalary * (1 + overheadPercent / 100);

  // Quarter multiplier for prorated salary cost in annual budget (Q1 = 12 mos, Q2 = 9 mos, Q3 = 6 mos, Q4 = 3 mos)
  const quarterMonthsMap = { Q1: 12, Q2: 9, Q3: 6, Q4: 3 };
  const monthsActiveThisYear = quarterMonthsMap[hireQuarter];

  const totalRecruitmentCost = targetAddHeadcount * recruitmentCostPerHead;
  const totalSalaryOverheadImpactThisYear = targetAddHeadcount * monthlyGrossCostPerHead * monthsActiveThisYear;
  const totalAnnualBudgetImpact = totalSalaryOverheadImpactThisYear + totalRecruitmentCost;

  const fullNextYearAnnualImpact = targetAddHeadcount * monthlyGrossCostPerHead * 12;

  const budgetVariance = budgetLimit - totalAnnualBudgetImpact;
  const isOverBudget = budgetVariance < 0;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#181818] text-blue-400 border border-[#2a2a2a] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Simulator Manpower Planning & Budgeting (MPP)</h3>
            <p className="text-xs text-gray-500">Kalkulasi Proyeksi Headcount, FPTK Job Requisition, Overhead Gaji, & Alokasi Anggaran</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded-md text-xs font-mono">
          Strategic Planning
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters Controls */}
        <div className="lg:col-span-5 space-y-4 bg-[#0a0a0a] p-5 rounded-xl border border-[#1a1a1a]">
          <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" /> Parameter MPP Departemen
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Departemen Target</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Engineering">Engineering / IT</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Operations">Operations & Logistics</option>
                <option value="HR & Legal">HR & Legal</option>
                <option value="Finance">Finance & Accounting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Target Kuartal Hire</label>
              <select
                value={hireQuarter}
                onChange={(e) => setHireQuarter(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              >
                <option value="Q1">Q1 (Jan - Mar / 12 bln)</option>
                <option value="Q2">Q2 (Apr - Jun / 9 bln)</option>
                <option value="Q3">Q3 (Jul - Sep / 6 bln)</option>
                <option value="Q4">Q4 (Okt - Des / 3 bln)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Headcount Eksisting</label>
              <input
                type="number"
                value={currentHeadcount}
                onChange={(e) => setCurrentHeadcount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Usulan Rekrutmen (New Hire)</label>
              <input
                type="number"
                value={targetAddHeadcount}
                onChange={(e) => setTargetAddHeadcount(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Rata-Rata Gaji Pokok per Orang (Rp/Bulan)</label>
            <input
              type="number"
              step="500000"
              value={avgSalary}
              onChange={(e) => setAvgSalary(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Overhead BPJS & Tunjangan (%)</label>
              <input
                type="number"
                value={overheadPercent}
                onChange={(e) => setOverheadPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Estimasi Attrition / Resign (%)</label>
              <input
                type="number"
                value={attritionRatePercent}
                onChange={(e) => setAttritionRatePercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Recruitment Cost / Head (Rp)</label>
              <input
                type="number"
                value={recruitmentCostPerHead}
                onChange={(e) => setRecruitmentCostPerHead(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Pagu Plafon Budget (Rp)</label>
              <input
                type="number"
                step="50000000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#262626] rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Calculated Results & Budget Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Budget Metric Card */}
          <div className={`p-5 rounded-xl border shadow-sm space-y-3 transition-all ${
            isOverBudget ? 'bg-rose-950/30 border-rose-800/60' : 'bg-[#0a0a0a] border-[#1a1a1a]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono text-gray-400 tracking-wider">
                Total Dampak Anggaran MPP ({hireQuarter} - Prorata {monthsActiveThisYear} Bulan)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                isOverBudget 
                  ? 'bg-rose-950 text-rose-400 border-rose-800' 
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {isOverBudget ? 'OVER BUDGET' : 'WITHIN BUDGET'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <h2 className={`text-3xl font-mono font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatIDR(totalAnnualBudgetImpact)}
              </h2>
              <div className="text-right">
                <span className="text-[11px] text-gray-400 block font-mono">Batas Plafon: {formatIDR(budgetLimit)}</span>
                <span className={`text-xs font-mono font-semibold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                  Variance: {formatIDR(budgetVariance)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 pt-1 border-t border-[#1f1f1f]">
              Departemen {department} • Rekrutmen +{targetAddHeadcount} Karyawan (Pengaruh Efektif Masa Kerja {monthsActiveThisYear} Bulan)
            </p>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-500 block">Proyeksi Net Headcount</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-white">{projectedFinalHeadcount}</span>
                <span className="text-gray-400">Orang</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Eksisting: {currentHeadcount} | Hire: +{targetAddHeadcount} | Est. Resign: -{expectedAttritionCount}
              </p>
            </div>

            <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-500 block">Cost / Head Gross (Inc. BPJS)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-bold text-blue-400">{formatIDR(monthlyGrossCostPerHead)}</span>
                <span className="text-gray-400">/bln</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Gaji Pokok {formatIDR(avgSalary)} + {overheadPercent}% BPJS & Tunjangan
              </p>
            </div>

            <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-500 block">Total Biaya Rekrutmen & Onboarding</span>
              <div className="text-lg font-mono font-bold text-amber-400">{formatIDR(totalRecruitmentCost)}</div>
              <p className="text-[11px] text-gray-400">
                Iklan Lowongan, Headhunter, & Onboarding Pack ({formatIDR(recruitmentCostPerHead)}/head)
              </p>
            </div>

            <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-500 block">Proyeksi Full-Year Tahun Depan</span>
              <div className="text-lg font-mono font-bold text-purple-400">{formatIDR(fullNextYearAnnualImpact)}</div>
              <p className="text-[11px] text-gray-400">
                Beban Anggaran Penuh 12 Bulan Tahun Berikutnya
              </p>
            </div>
          </div>

          {/* Workflow Alert */}
          {isOverBudget ? (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Peringatan Defisit Anggaran SDM:</span>
                Pengajuan MPP melebihi plafon anggaran sebesar {formatIDR(Math.abs(budgetVariance))}. Pengajuan FPTK akan secara otomatis memerlukan persetujuan khusus (Special Exemption Approval) dari Chief Financial Officer (CFO) dan Direktur Utama.
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Persetujuan Otomatis Sesuai Plafon:</span>
                Pengajuan Manpower Planning berada dalam sisa anggaran sebesar {formatIDR(budgetVariance)}. Requisisi pekerjaan (FPTK) siap diterbitkan untuk proses seleksi tim Recruitment.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
