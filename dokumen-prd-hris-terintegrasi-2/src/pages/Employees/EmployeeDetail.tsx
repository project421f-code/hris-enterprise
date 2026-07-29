import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEmployees, EmployeeRecord } from '../../hooks/useEmployees';
import { supabase } from '../../lib/supabaseClient';
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, Calendar,
  MapPin, Shield, DollarSign, Building2, User,
  Loader2, Banknote, FileText
} from 'lucide-react';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployee, softDeleteEmployee } = useEmployees();
  const [employee, setEmployee] = useState<EmployeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deptName, setDeptName] = useState<string>('—');

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      try {
        const emp = await getEmployee(id);
        setEmployee(emp);

        if (emp?.department_id) {
          const { data: dept } = await supabase
            .from('departments')
            .select('name')
            .eq('id', emp.department_id)
            .single();
          if (dept) setDeptName(dept.name);
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, getEmployee]);

  const handleDelete = async () => {
    if (!employee || !confirm('Yakin ingin menonaktifkan karyawan ini?')) return;
    const result = await softDeleteEmployee(employee.id);
    if (!result.error) {
      navigate('/employees');
    }
  };

  const formatSalary = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
        <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white">Karyawan Tidak Ditemukan</h3>
        <Link to="/employees" className="text-xs text-blue-400 hover:underline mt-2 inline-block">
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/employees" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Karyawan
      </Link>

      {/* Profile Header */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg">
            {employee.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{employee.full_name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{employee.position}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                employee.status === 'active'
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
              }`}>
                {employee.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/employees/${employee.id}/edit`}
              className="px-3.5 py-2 bg-[#181818] hover:bg-[#222] text-gray-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border border-[#2a2a2a]"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border border-rose-800/40"
            >
              <Trash2 className="w-3.5 h-3.5" /> Nonaktifkan
            </button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-blue-400" />
            Informasi Pribadi
          </h3>
          <div className="space-y-3 text-xs">
            <InfoRow icon={User} label="NIK" value={employee.nik} />
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Telepon" value={employee.phone || '—'} />
            <InfoRow icon={Calendar} label="Tanggal Masuk" value={new Date(employee.join_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} />
            {employee.resign_date && (
              <InfoRow icon={Calendar} label="Tanggal Keluar" value={new Date(employee.resign_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} />
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-purple-400" />
            Informasi Pekerjaan
          </h3>
          <div className="space-y-3 text-xs">
            <InfoRow icon={Building2} label="Departemen" value={deptName} />
            <InfoRow icon={MapPin} label="Jabatan" value={employee.position} />
            <InfoRow icon={Shield} label="Role Akses" value={employee.role.replace('_', ' ')} />
            <InfoRow icon={FileText} label="Status" value={employee.status === 'active' ? 'Aktif' : 'Nonaktif'} />
          </div>
        </div>

        {/* Salary Info */}
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Kompensasi
          </h3>
          <div className="space-y-3 text-xs">
            <InfoRow icon={DollarSign} label="Gaji Pokok" value={formatSalary(employee.basic_salary)} />
            <InfoRow icon={FileText} label="Status PTKP" value={employee.ptkp_status} />
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Banknote className="w-4 h-4 text-amber-400" />
            Informasi Bank
          </h3>
          <div className="space-y-3 text-xs">
            <InfoRow icon={Banknote} label="Nama Bank" value={employee.bank_name || '—'} />
            <InfoRow icon={FileText} label="No. Rekening" value={employee.bank_account_no || '—'} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
    <span className="text-white font-medium text-right ml-4">{value}</span>
  </div>
);
