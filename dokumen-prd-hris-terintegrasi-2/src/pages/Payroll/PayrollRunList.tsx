import React from 'react';
import { Link } from 'react-router-dom';
import { usePayrollRuns } from '../../hooks/usePayroll';
import { ArrowLeft, Plus, Loader2, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react';

const monthName = (m: number) => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m - 1] || m;

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; style: string }> = {
    DRAFT: { label: 'Draft', style: 'bg-slate-950/60 text-slate-400 border-slate-800/50' },
    PROCESSING: { label: 'Processing', style: 'bg-blue-950/60 text-blue-400 border-blue-800/50' },
    LOCKED: { label: 'Terkunci', style: 'bg-amber-950/60 text-amber-400 border-amber-800/50' },
    PAID: { label: 'Dibayar', style: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' },
  };
  return map[s] || { label: s, style: 'bg-gray-900 text-gray-400 border-gray-700' };
};

export const PayrollRunList: React.FC = () => {
  const { runs, loading } = usePayrollRuns();

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/payroll" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-white">Periode Payroll</h1>
            <p className="text-xs text-gray-500 mt-1">{runs.length} periode</p>
          </div>
        </div>
        <Link to="/payroll/runs/new" className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Periode Baru
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <DollarSign className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Belum ada periode payroll. Buat periode baru untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map(run => {
            const badge = statusBadge(run.status);
            return (
              <Link key={run.id} to={`/payroll/runs/${run.id}`}
                className="block bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 hover:border-[#2a2a2a] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded-xl">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{monthName(run.month)} {run.year}</h4>
                      <p className="text-[10px] text-gray-500">Periode #{run.month}-{run.year}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${badge.style}`}>{badge.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
