import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, DollarSign,
  Award, TrendingUp, LogOut, ChevronLeft,
  Sparkles, Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Karyawan' },
  { to: '/departments', icon: Building2, label: 'Departemen' },
];

const navModules = [
  { to: '/attendance', icon: CalendarCheck, label: 'Absensi' },
  { to: '/leave', icon: CalendarCheck, label: 'Cuti & Izin' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/performance', icon: Award, label: 'Kinerja' },
  { to: '/manpower', icon: TrendingUp, label: 'MPP' },
];

const moduleItems: { to: string; icon: React.ComponentType<any>; label: string; disabled: boolean }[] = [];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, employeeRole, signOut } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border border-blue-800/40 font-semibold'
        : 'text-gray-400 hover:bg-[#181818] hover:text-gray-200'
    }`;

  const disabledLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 cursor-not-allowed opacity-50';

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#080808] border-r border-[#1a1a1a] z-50 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      <div className={`p-4 border-b border-[#1a1a1a] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">HRIS</h1>
              <p className="text-[9px] text-gray-500 -mt-0.5">Enterprise Suite</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-[#141414] text-gray-500 hover:text-gray-300 transition-all">
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={linkClass}>
            <item.icon className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {navModules.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <item.icon className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && moduleItems.length > 0 && (
          <div className="pt-4 pb-2">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.15em] px-3">Modul Lainnya</span>
          </div>
        )}

        {moduleItems.map((item) => (
          <div key={item.to} className={disabledLinkClass}>
            <item.icon className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && (
              <span className="flex items-center gap-2">
                {item.label}
                <span className="px-1.5 py-0.5 bg-[#141414] text-[9px] text-gray-600 rounded border border-[#222]">COMING</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={`border-t border-[#1a1a1a] p-3 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-semibold truncate">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-gray-500 capitalize truncate">{employeeRole || 'employee'}</p>
            </div>
            <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-rose-950/50 text-gray-500 hover:text-rose-400 transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-rose-950/50 text-gray-500 hover:text-rose-400 transition-all" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
