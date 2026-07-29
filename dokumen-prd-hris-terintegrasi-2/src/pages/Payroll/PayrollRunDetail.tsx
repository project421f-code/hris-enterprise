import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePayrollDetails, usePayrollRuns } from '../../hooks/usePayroll';
import { ArrowLeft, Loader2, DollarSign, TrendingUp, Users } from 'lucide-react';

export const PayrollRunDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { runs } = usePayrollRuns();
  const { details, loading } = usePayrollDetails(id);

  const run = runs.find(r => r.id === id);
  const monthName = (m: number) => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m - 1] || m;

  const totalGross = details.reduce((s, d) => s + Number(d.gross_salary), 0);
  const totalNet = details.reduce((s, d) => s + Number(d.net_salary), 0);
  const totalPPh = details.reduce((s, d) => s + Number(d.pph21_tax), 0);
  const totalBPJS = details.reduce((s, d) => s + Number(d.bpjs_health_employee) + Number(d.bpjs_ketenagakerjaan_employee), 0);

  const formatRp = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/payroll/runs" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-white">{run ? `${monthName(run.month)} ${run.year}` : 'Detail Payroll'}</h1>
          <p className="text-xs text-gray-500 mt-1">{details.length} karyawan • Status: {run?.status || '—'}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Gaji Bruto', value: formatRp(totalGross), icon: TrendingUp, bg: 'bg-blue-950/30 border-blue-800/30 clr: text-blue-400' },
          { label: 'Total PPh 21', value: formatRp(totalPPh), icon: DollarSign, bg: 'bg-amber-950/30 border-amber-800/30' },
          { label: 'Total Potongan BPJS', value: formatRp(totalBPJS), icon: Users, bg: 'bg-indigo-950/30 border-indigo-800/30' },
          { label: 'Total Take Home Pay', value: formatRp(totalNet), icon: DollarSign, bg: 'bg-emerald-950/30 border-emerald-800/30' },
        ].map((c, i) => (
          <div key={i} className={`p-3.5 rounded-2xl border ${c.bg}`}>
            <p className="text-[10px] text-gray-400">{c.label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Employee Pay Slips */}
      {details.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <p className="text-xs text-gray-500">Belum ada data payroll untuk periode ini. Jalankan kalkulasi payroll.</p>
        </div>
      ) : (
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-gray-400 uppercase text-[10px] border-b border-[#1a1a1a]">
                <tr>
                  <th className="p-3">Karyawan</th>
                  <th className="p-3">NIK</th>
                  <th className="p-3">Gaji Pokok</th>
                  <th className="p-3">Tunjangan</th>
                  <th className="p-3">Bruto</th>
                  <th className="p-3">TER</th>
                  <th className="p-3">PPh 21</th>
                  <th className="p-3">BPJS</th>
                  <th className="p-3 text-right">Net THP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {details.map(d => (
                  <tr key={d.id} className="hover:bg-[#141414]">
                    <td className="p-3 font-semibold text-white">{d.employees?.full_name || '—'}</td>
                    <td className="p-3 font-mono text-gray-400 text-[11px]">{d.employees?.nik || '—'}</td>
                    <td className="p-3">{formatRp(Number(d.basic_salary))}</td>
                    <td className="p-3 text-emerald-400">+{formatRp((d.allowances?.transport || 0) + (d.allowances?.meal || 0) + Number(d.overtime_pay))}</td>
                    <td className="p-3 font-bold">{formatRp(Number(d.gross_salary))}</td>
                    <td className="p-3 text-blue-400">{d.pph21_category}</td>
                    <td className="p-3 text-amber-400">-{formatRp(Number(d.pph21_tax))}</td>
                    <td className="p-3 text-indigo-400">-{formatRp(Number(d.bpjs_health_employee) + Number(d.bpjs_ketenagakerjaan_employee))}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">{formatRp(Number(d.net_salary))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
