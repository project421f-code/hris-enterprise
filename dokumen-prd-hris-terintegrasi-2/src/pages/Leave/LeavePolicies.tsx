import React from 'react';
import { Link } from 'react-router-dom';
import { useLeavePolicies } from '../../hooks/useLeave';
import { ArrowLeft, FileText, Loader2, Calendar } from 'lucide-react';

export const LeavePolicies: React.FC = () => {
  const { policies, loading } = useLeavePolicies();

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/leave" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-white">Kebijakan Cuti</h1>
          <p className="text-xs text-gray-500 mt-1">{policies.length} kebijakan aktif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map(p => (
          <div key={p.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xl">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{p.name}</h4>
                <p className="text-[10px] text-gray-500">
                  {p.accrual_type === 'MONTHLY_ACCRUAL' ? 'Akrual Bulanan' : 'Front-load Tahunan'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 py-3 bg-[#080808] rounded-xl">
              <div className="text-center">
                <p className="text-[10px] text-gray-500">Jatah</p>
                <p className="text-lg font-bold text-white">{p.total_days} <span className="text-xs text-gray-500 font-normal">hari</span></p>
              </div>
              <div className="text-gray-600 text-xl">|</div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500">Batas Bawa</p>
                <p className="text-lg font-bold text-amber-400">{p.carry_over_limit} <span className="text-xs text-gray-500 font-normal">hari</span></p>
              </div>
            </div>
            {p.carry_over_expiry_months > 0 && (
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                Sisa cuti hangus setelah {p.carry_over_expiry_months} bulan
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
