import React from 'react';
import { Link } from 'react-router-dom';
import { useLeaveRequests, useLeavePolicies } from '../../hooks/useLeave';
import { useAuth } from '../../contexts/AuthContext';import { Clock, CheckCircle2, XCircle, Plus, Loader2, ArrowRight, FileText } from 'lucide-react';

export const LeaveDashboard: React.FC = () => {
  const { employeeId } = useAuth();
  const { requests, loading: reqLoading } = useLeaveRequests();
  const { policies } = useLeavePolicies();

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedL1 = requests.filter(r => r.status === 'APPROVED_L1');
  const approved = requests.filter(r => r.status === 'APPROVED');
  const rejected = requests.filter(r => r.status === 'REJECTED');

  const myRequests = requests.filter(r => r.employee_id === employeeId);

  const statCards = [
    { label: 'Total Pengajuan', value: requests.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/30' },
    { label: 'Menunggu Approval', value: pendingRequests.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/30' },
    { label: 'Disetujui', value: approved.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/30' },
    { label: 'Ditolak', value: rejected.length, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-950/30 border-rose-800/30' },
  ];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
      APPROVED_L1: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
      APPROVED_L2: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50',
      APPROVED: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
      REJECTED: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
    };
    return styles[status] || 'bg-gray-900 text-gray-400 border-gray-700';
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (reqLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Manajemen Cuti & Izin</h1>
          <p className="text-xs text-gray-500 mt-1">{policies.length} kebijakan cuti aktif</p>
        </div>
        <Link to="/leave/new"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajukan Cuti
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(c => (
          <div key={c.label} className={`p-3.5 rounded-2xl border ${c.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-medium">{c.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{c.value}</p>
              </div>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Menunggu Persetujuan
          </h3>
          <Link to="/leave/requests" className="text-[10px] text-blue-400 hover:underline">Lihat Semua</Link>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center"><CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" /><p className="text-xs text-gray-500">Tidak ada pengajuan yang menunggu</p></div>
        ) : (
          <div className="divide-y divide-[#1a1a1a] text-xs">
            {pendingRequests.slice(0, 5).map(r => (
              <div key={r.id} className="p-4 hover:bg-[#141414] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {r.employees?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{r.employees?.full_name}</p>
                    <p className="text-[10px] text-gray-400">{r.leave_policies?.name} • {r.total_days} hari • {formatDate(r.start_date)} - {formatDate(r.end_date)}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(r.status)}`}>Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/leave/requests" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-blue-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">Semua Pengajuan</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all" />
        </Link>
        <Link to="/leave/policies" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-purple-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-300">Kebijakan Cuti</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all" />
        </Link>
        <Link to="/leave/new" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-emerald-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-300">Ajukan Cuti Baru</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all" />
        </Link>
      </div>
    </div>
  );
};
