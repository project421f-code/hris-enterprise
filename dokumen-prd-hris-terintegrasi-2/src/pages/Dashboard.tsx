import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Users, Building2, UserCheck, Clock, DollarSign,
  TrendingUp, CalendarCheck, ArrowRight,
  Briefcase, Activity, Target, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  todayAttendance: number;
  pendingLeaves: number;
}

export const Dashboard: React.FC = () => {
  const { user, employeeRole, employeeCompanyId } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const companyId = employeeCompanyId;

      try {
        const todayStr = new Date().toISOString().split('T')[0];

        const baseQuery = companyId
          ? (qb: any) => qb.eq('company_id', companyId)
          : (qb: any) => qb;

        const [
          { count: totalEmp },
          { count: activeEmp },
          { count: totalDept },
          { count: todayAtt },
          { count: pendingLeave }
        ] = await Promise.all([
          // 1. Total employees
          baseQuery(
            supabase.from('employees').select('*', { count: 'exact', head: true })
          ).is('deleted_at', null),
          // 2. Active employees
          baseQuery(
            supabase.from('employees').select('*', { count: 'exact', head: true })
          ).eq('status', 'active').is('deleted_at', null),
          // 3. Total departments
          baseQuery(
            supabase.from('departments').select('*', { count: 'exact', head: true })
          ),
          // 4. Today's attendance
          supabase.from('attendance_logs')
            .select('*', { count: 'exact', head: true })
            .gte('clock_in', todayStr),
          // 5. Pending leave requests
          supabase.from('leave_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING'),
        ]);

        setStats({
          totalEmployees: totalEmp || 0,
          activeEmployees: activeEmp || 0,
          totalDepartments: totalDept || 0,
          todayAttendance: todayAtt || 0,
          pendingLeaves: pendingLeave || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchStats();
  }, [employeeCompanyId]);

  const statCards = [
    {
      label: 'Total Karyawan',
      value: stats.totalEmployees || '—',
      icon: Users,
      bg: 'bg-blue-950/30 border-blue-800/30',
      iconBg: 'bg-blue-600/20',
    },
    {
      label: 'Karyawan Aktif',
      value: stats.activeEmployees || '—',
      icon: UserCheck,
      bg: 'bg-emerald-950/30 border-emerald-800/30',
      iconBg: 'bg-emerald-600/20',
    },
    {
      label: 'Departemen',
      value: stats.totalDepartments || '—',
      icon: Building2,
      bg: 'bg-purple-950/30 border-purple-800/30',
      iconBg: 'bg-purple-600/20',
    },
    {
      label: 'Absensi Hari Ini',
      value: stats.todayAttendance || '—',
      icon: Clock,
      bg: 'bg-amber-950/30 border-amber-800/30',
      iconBg: 'bg-amber-600/20',
    },
  ];

  const quickActions = [
    {
      title: 'Kelola Karyawan',
      description: 'Tambah, edit, atau nonaktifkan data karyawan',
      link: '/employees',
      icon: Users,
      gradient: 'from-blue-600/20 to-indigo-600/20',
      border: 'border-blue-800/30',
      text: 'text-blue-300',
    },
    {
      title: 'Kelola Departemen',
      description: 'Atur struktur organisasi perusahaan',
      link: '/departments',
      icon: Building2,
      gradient: 'from-purple-600/20 to-violet-600/20',
      border: 'border-purple-800/30',
      text: 'text-purple-300',
    },
    {
      title: 'Kelola Cuti',
      description: 'Atur pengajuan cuti & izin karyawan',
      link: '/leave',
      icon: CalendarCheck,
      gradient: 'from-teal-600/20 to-emerald-600/20',
      border: 'border-teal-800/30',
      text: 'text-teal-300',
    },
    {
      title: 'Simulator Payroll',
      description: 'Uji kalkulasi PPh 21 TER & BPJS',
      link: '/payroll/simulator',
      icon: DollarSign,
      gradient: 'from-amber-600/20 to-orange-600/20',
      border: 'border-amber-800/30',
      text: 'text-amber-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            Selamat Datang, {user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Anda login sebagai <span className="font-semibold text-gray-300 capitalize">{employeeRole || 'Employee'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs text-blue-300 font-medium flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            Live
          </div>
          <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 font-medium">
            Sistem Aktif
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`p-4 rounded-2xl border ${card.bg} relative overflow-hidden group hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.link}
              to={action.link}
              className={`p-4 rounded-2xl border ${action.border} bg-gradient-to-br ${action.gradient} hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <action.icon className={`w-5 h-5 ${action.text}`} />
                  <h3 className={`text-sm font-bold ${action.text}`}>{action.title}</h3>
                  <p className="text-[11px] text-gray-400">{action.description}</p>
                </div>
                <ArrowRight className={`w-4 h-4 ${action.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        <div className="p-5 bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-400" />
            Status Sistem
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-gray-400">Database</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Terhubung
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-gray-400">Autentikasi</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Aktif
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Modul Core HR</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Berjalan
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-amber-400" />
            Informasi Perusahaan
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-gray-400">Versi Aplikasi</span>
              <span className="text-white font-mono font-bold">v1.0.0-LIVE</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-gray-400">Deployment</span>
              <span className="text-blue-300 font-mono font-bold flex items-center gap-1">
                <Globe className="w-3 h-3" /> GitHub Pages
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
              <span className="text-gray-400">Framework</span>
              <span className="text-blue-300 font-mono">React 19 + Vite</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">Database</span>
              <span className="text-emerald-300 font-mono">PostgreSQL (Supabase)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
