import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAttendanceHistory } from '../../hooks/useAttendance';
import {
  ArrowLeft, Search, Loader2, Smartphone, Fingerprint,
  Home, MapPin, RefreshCw, Filter, ChevronDown
} from 'lucide-react';

export const AttendanceLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [lateFilter, setLateFilter] = useState<string>('all');
  const { logs, loading, refetch } = useAttendanceHistory();

  const filteredLogs = logs.filter((log) => {
    const name = log.employees?.full_name?.toLowerCase() || '';
    const nik = log.employees?.nik?.toLowerCase() || '';
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || nik.includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === 'all' || log.source === sourceFilter;
    const matchesLate = lateFilter === 'all'
      ? true
      : lateFilter === 'late' ? log.is_late
      : lateFilter === 'ontime' ? !log.is_late
      : true;

    return matchesSearch && matchesSource && matchesLate;
  });

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'MOBILE_GPS': return <Smartphone className="w-3 h-3" />;
      case 'FINGERPRINT': return <Fingerprint className="w-3 h-3" />;
      case 'WFH_REMOTE': return <Home className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/attendance" className="p-1.5 hover:bg-[#181818] rounded-lg text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Riwayat Absensi</h1>
            <p className="text-xs text-gray-500 mt-1">{filteredLogs.length} log ditemukan</p>
          </div>
        </div>
        <button onClick={refetch} className="p-2 bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] rounded-xl text-gray-400 hover:text-white transition-all" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan atau NIK..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs"
        >
          <option value="all">Semua Sumber</option>
          <option value="MOBILE_GPS">Mobile GPS</option>
          <option value="FINGERPRINT">Fingerprint</option>
          <option value="WFH_REMOTE">WFH</option>
        </select>
        <select
          value={lateFilter}
          onChange={(e) => setLateFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs"
        >
          <option value="all">Semua Status</option>
          <option value="ontime">Tepat Waktu</option>
          <option value="late">Terlambat</option>
        </select>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <p className="text-xs text-gray-500">Tidak ada data absensi yang cocok</p>
        </div>
      ) : (
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080808] text-gray-400 uppercase text-[10px] border-b border-[#1a1a1a]">
                <tr>
                  <th className="p-3 font-semibold">Tanggal</th>
                  <th className="p-3 font-semibold">Karyawan</th>
                  <th className="p-3 font-semibold">NIK</th>
                  <th className="p-3 font-semibold">Clock-In</th>
                  <th className="p-3 font-semibold">Clock-Out</th>
                  <th className="p-3 font-semibold">Shift</th>
                  <th className="p-3 font-semibold">Sumber</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141414]">
                    <td className="p-3 text-gray-300">{formatDate(log.clock_in)}</td>
                    <td className="p-3 font-semibold text-white">{log.employees?.full_name || '—'}</td>
                    <td className="p-3 font-mono text-gray-400 text-[11px]">{log.employees?.nik || '—'}</td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-mono">{formatTime(log.clock_in)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-400 font-mono">{formatTime(log.clock_out)}</span>
                    </td>
                    <td className="p-3 text-gray-400 text-[11px]">{log.shifts?.name || '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        {getSourceIcon(log.source)}
                        <span className="text-[11px]">{log.source === 'MOBILE_GPS' ? 'GPS' : log.source === 'WFH_REMOTE' ? 'WFH' : 'Fingerprint'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {log.is_late ? (
                        <span className="px-1.5 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded text-[9px]">{log.late_minutes}m telat</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded text-[9px]">On Time</span>
                      )}
                    </td>
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
