import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../../hooks/useAttendance';
import {
  Clock, UserCheck, AlertTriangle, Home, Fingerprint,
  Coffee, ArrowRight, Calendar, MapPin, Smartphone,
  RefreshCw, Loader2, CheckCircle2, XCircle
} from 'lucide-react';

export const AttendanceDashboard: React.FC = () => {
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const { logs, stats, loading, error, refetch } = useAttendance(today);

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const statCards = [
    {
      label: 'Total Clock-In',
      value: stats.totalClockedIn,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-950/30 border-blue-800/30',
      iconBg: 'bg-blue-600/20',
    },
    {
      label: 'Tepat Waktu',
      value: stats.onTimeCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30 border-emerald-800/30',
      iconBg: 'bg-emerald-600/20',
    },
    {
      label: 'Terlambat',
      value: stats.lateCount,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-950/30 border-amber-800/30',
      iconBg: 'bg-amber-600/20',
    },
    {
      label: 'WFH',
      value: stats.wfhCount,
      icon: Home,
      color: 'text-purple-400',
      bg: 'bg-purple-950/30 border-purple-800/30',
      iconBg: 'bg-purple-600/20',
    },
  ];

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'MOBILE_GPS': return <Smartphone className="w-3 h-3" />;
      case 'FINGERPRINT': return <Fingerprint className="w-3 h-3" />;
      case 'WFH_REMOTE': return <Home className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  const getStatusBadge = (log: typeof logs[0]) => {
    if (log.is_late) {
      return <span className="px-1.5 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded text-[9px] font-medium">{log.late_minutes}m terlambat</span>;
    }
    if (log.clock_out) {
      return <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded text-[9px] font-medium">Selesai</span>;
    }
    return <span className="px-1.5 py-0.5 bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded text-[9px] font-medium">Sedang Bekerja</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Gagal memuat data absensi: {error}</p>
        <button onClick={refetch} className="mt-3 px-3 py-1.5 bg-[#181818] text-gray-300 rounded-lg text-xs">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard Absensi</h1>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(today).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            className="px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs"
          />
          <button
            onClick={refetch}
            className="p-2 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] rounded-xl text-gray-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/attendance/logs"
            className="px-3 py-2 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] rounded-xl text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            Riwayat <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`p-4 rounded-2xl border ${card.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Log Table */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Log Absensi Hari Ini</h3>
          <span className="text-xs text-gray-500">{logs.length} karyawan</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <Coffee className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Belum ada data absensi untuk hari ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-gray-400 uppercase text-[10px] border-b border-[#1a1a1a]">
                <tr>
                  <th className="p-3 font-semibold">Karyawan</th>
                  <th className="p-3 font-semibold">NIK</th>
                  <th className="p-3 font-semibold">Clock-In</th>
                  <th className="p-3 font-semibold">Clock-Out</th>
                  <th className="p-3 font-semibold">Sumber</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141414]">
                    <td className="p-3 font-semibold text-white">{log.employees?.full_name || '—'}</td>
                    <td className="p-3 font-mono text-gray-400 text-[11px]">{log.employees?.nik || '—'}</td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-mono">{formatTime(log.clock_in)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-400 font-mono">{formatTime(log.clock_out)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        {getSourceIcon(log.source)}
                        <span className="text-[11px]">{log.source === 'MOBILE_GPS' ? 'GPS' : log.source === 'WFH_REMOTE' ? 'WFH' : 'Fingerprint'}</span>
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(log)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/attendance/logs" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-blue-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-300">Riwayat Absensi</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all" />
        </Link>
        <Link to="/attendance/shifts" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-purple-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-300">Kelola Shift</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all" />
        </Link>
        <Link to="/attendance/logs?late=true" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-amber-800/50 transition-all flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-300">Laporan Keterlambatan</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-all" />
        </Link>
      </div>
    </div>
  );
};
