import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees, EmployeeRecord } from '../../hooks/useEmployees';
import {
  Plus, Search, MoreHorizontal, User, Pencil, Trash2,
  Mail, Phone, Loader2, ChevronDown, Filter
} from 'lucide-react';

const PTKP_OPTIONS = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];

export const EmployeeList: React.FC = () => {
  const { employees, loading, softDeleteEmployee } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? emp.status === 'active' :
      emp.status === 'inactive';

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menonaktifkan karyawan ini?')) return;
    await softDeleteEmployee(id);
    setOpenMenuId(null);
  };

  const formatSalary = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Data Karyawan</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total {filteredEmployees.length} karyawan
            {searchQuery && ` (pencarian: "${searchQuery}")`}
          </p>
        </div>
        <Link
          to="/employees/new"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Karyawan
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari NIK, nama, email, jabatan..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#121212] text-gray-400 border border-[#262626] hover:bg-[#181818]'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'active' ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">Tidak Ada Data Karyawan</h3>
          <p className="text-xs text-gray-500 mt-1">
            {searchQuery ? 'Ubah kata kunci pencarian' : 'Tambahkan karyawan pertama Anda'}
          </p>
        </div>
      ) : (
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#080808] text-gray-400 uppercase text-[10px] border-b border-[#1a1a1a]">
                <tr>
                  <th className="p-3 font-semibold">NIK</th>
                  <th className="p-3 font-semibold">Nama Lengkap</th>
                  <th className="p-3 font-semibold">Departemen</th>
                  <th className="p-3 font-semibold">Jabatan</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Gaji Pokok</th>
                  <th className="p-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a] text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#141414] transition-colors">
                    <td className="p-3 font-mono text-gray-300 text-[11px]">{emp.nik}</td>
                    <td className="p-3">
                      <Link to={`/employees/${emp.id}`} className="font-semibold text-white hover:text-blue-400 transition-colors">
                        {emp.full_name}
                      </Link>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </div>
                    </td>
                    <td className="p-3 text-gray-300">{emp.departments?.name || '—'}</td>
                    <td className="p-3 text-gray-300">{emp.position}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        emp.status === 'active'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                      }`}>
                        {emp.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-300 text-[11px]">{formatSalary(emp.basic_salary)}</td>
                    <td className="p-3 text-right relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === emp.id ? null : emp.id)}
                        className="p-1.5 hover:bg-[#1a1a1a] rounded-lg text-gray-400 hover:text-white transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenuId === emp.id && (
                        <div className="absolute right-3 top-10 z-20 bg-[#181818] border border-[#2a2a2a] rounded-xl shadow-xl py-1.5 min-w-[140px]">
                          <Link
                            to={`/employees/${emp.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#222] transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <User className="w-3.5 h-3.5" /> Detail
                          </Link>
                          <Link
                            to={`/employees/${emp.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#222] transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors w-full text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Nonaktifkan
                          </button>
                        </div>
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
