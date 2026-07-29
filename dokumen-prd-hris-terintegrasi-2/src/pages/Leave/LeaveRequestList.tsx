import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeaveRequests } from '../../hooks/useLeave';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export const LeaveRequestList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { employeeId } = useAuth();
  const { requests, loading, approveRequest, rejectRequest, refetch } = useLeaveRequests(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = requests.filter(r => {
    const name = r.employees?.full_name?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase());
  });

  const statusBadge = (status: string) => {
    const s: Record<string, { label: string; style: string }> = {
      PENDING: { label: 'Pending', style: 'bg-amber-950/60 text-amber-400 border-amber-800/50' },
      APPROVED_L1: { label: 'Approval L1', style: 'bg-blue-950/60 text-blue-400 border-blue-800/50' },
      APPROVED_L2: { label: 'Approval L2', style: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50' },
      APPROVED: { label: 'Disetujui', style: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' },
      REJECTED: { label: 'Ditolak', style: 'bg-rose-950/60 text-rose-400 border-rose-800/50' },
    };
    return s[status] || { label: status, style: 'bg-gray-900 text-gray-400 border-gray-700' };
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/leave" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-white">Semua Pengajuan Cuti</h1>
            <p className="text-xs text-gray-500 mt-1">{filtered.length} pengajuan</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan..." className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white placeholder-gray-600 text-xs" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Disetujui' },
            { value: 'REJECTED', label: 'Ditolak' },
          ].map(s => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s.value ? 'bg-white text-black font-bold' : 'bg-[#121212] text-gray-400 border border-[#262626] hover:bg-[#181818]'
              }`}>{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <p className="text-xs text-gray-500">Tidak ada pengajuan cuti</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const badge = statusBadge(r.status);
            return (
              <div key={r.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 hover:border-[#2a2a2a] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {r.employees?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.employees?.full_name || '—'}</p>
                      <p className="text-[10px] text-gray-400">{r.leave_policies?.name} • {r.total_days} hari</p>
                      <p className="text-[10px] text-gray-500">{formatDate(r.start_date)} - {formatDate(r.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${badge.style}`}>{badge.label}</span>
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button onClick={async () => { await approveRequest(r.id, 'final', employeeId || ''); refetch(); }}
                          className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition-all"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                        <button onClick={async () => { await rejectRequest(r.id); refetch(); }}
                          className="p-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-lg transition-all"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
                {r.reason && <p className="text-xs text-gray-500 mt-2 italic">"{r.reason}"</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
