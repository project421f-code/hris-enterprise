import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEmployees, EmployeeFormData, EmployeeRecord } from '../../hooks/useEmployees';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const PTKP_OPTIONS = [
  { value: 'TK/0', label: 'TK/0 (Rp 54 Juta)' },
  { value: 'TK/1', label: 'TK/1 (Rp 58.5 Juta)' },
  { value: 'TK/2', label: 'TK/2 (Rp 63 Juta)' },
  { value: 'TK/3', label: 'TK/3 (Rp 67.5 Juta)' },
  { value: 'K/0', label: 'K/0 (Rp 58.5 Juta)' },
  { value: 'K/1', label: 'K/1 (Rp 63 Juta)' },
  { value: 'K/2', label: 'K/2 (Rp 67.5 Juta)' },
  { value: 'K/3', label: 'K/3 (Rp 72 Juta)' },
];

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Karyawan' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr_attendance', label: 'HR Attendance' },
  { value: 'hr_payroll', label: 'HR Payroll' },
  { value: 'super_admin', label: 'Super Admin' },
];

const initialFormData: EmployeeFormData = {
  nik: '',
  full_name: '',
  email: '',
  phone: '',
  department_id: '',
  position: '',
  role: 'employee',
  status: 'active',
  join_date: new Date().toISOString().split('T')[0],
  ptkp_status: 'TK/0',
  basic_salary: 5000000,
  bank_name: '',
  bank_account_no: '',
};

interface DepartmentOption {
  id: string;
  name: string;
}

export const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employeeCompanyId } = useAuth();
  const { createEmployee, updateEmployee, getEmployee } = useEmployees();
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isEditing = !!id;

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.from('departments').select('id, name').order('name');
      setDepartments(data || []);
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        setFetching(true);
        const emp = await getEmployee(id);
        if (emp) {
          setFormData({
            nik: emp.nik,
            full_name: emp.full_name,
            email: emp.email,
            phone: emp.phone || '',
            department_id: emp.department_id || '',
            position: emp.position,
            role: emp.role,
            status: emp.status,
            join_date: emp.join_date.split('T')[0],
            ptkp_status: emp.ptkp_status,
            basic_salary: emp.basic_salary,
            bank_name: emp.bank_name || '',
            bank_account_no: emp.bank_account_no || '',
          });
        }
        setFetching(false);
      };
      fetchEmployee();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'basic_salary' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isEditing && id) {
        const result = await updateEmployee(id, formData);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Data karyawan berhasil diperbarui!');
          setTimeout(() => navigate(`/employees/${id}`), 1000);
        }
      } else {
        if (!employeeCompanyId) {
          setError('Company ID tidak ditemukan. Silakan login ulang.');
          setLoading(false);
          return;
        }
        const result = await createEmployee(formData, employeeCompanyId);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Karyawan baru berhasil ditambahkan!');
          setTimeout(() => navigate('/employees'), 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to={isEditing ? `/employees/${id}` : '/employees'}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isEditing ? 'Kembali ke Detail' : 'Kembali ke Daftar'}
      </Link>

      {/* Form Card */}
      <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-1">
          {isEditing ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          {isEditing ? 'Perbarui informasi data karyawan' : 'Isi data karyawan baru untuk ditambahkan ke sistem'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Identitas Diri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">NIK <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="Nomor Induk Karyawan"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Nama Lengkap <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nama sesuai KTP"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Email <span className="text-rose-400">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@perusahaan.com"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">No. Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxx"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Position Section */}
          <div className="border-t border-[#1a1a1a] pt-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pekerjaan & Organisasi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Departemen <span className="text-rose-400">*</span></label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white text-xs"
                  required
                >
                  <option value="">Pilih Departemen</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Jabatan <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Role / Hak Akses</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white text-xs"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white text-xs"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Tanggal Masuk <span className="text-rose-400">*</span></label>
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Salary Section */}
          <div className="border-t border-[#1a1a1a] pt-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kompensasi & Perpajakan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Gaji Pokok <span className="text-rose-400">*</span></label>
                <input
                  type="number"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Status PTKP (Pajak)</label>
                <select
                  name="ptkp_status"
                  value={formData.ptkp_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white text-xs"
                >
                  {PTKP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Nama Bank</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="e.g. Bank Mandiri"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">No. Rekening</label>
                <input
                  type="text"
                  name="bank_account_no"
                  value={formData.bank_account_no}
                  onChange={handleChange}
                  placeholder="Nomor rekening bank"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to={isEditing ? `/employees/${id}` : '/employees'}
              className="px-4 py-2.5 bg-[#181818] hover:bg-[#222] text-gray-300 rounded-xl text-xs font-medium transition-all border border-[#2a2a2a]"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
