import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Loader2, Menu } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-gray-400">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`transition-all duration-300 min-h-screen ml-0 ${
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden shrink-0 p-2 rounded-lg bg-[#121212] border border-[#262626] text-gray-400 hover:text-white hover:border-blue-500/50 transition-all"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-white truncate">HRIS Enterprise Dashboard</h2>
                <p className="text-[11px] text-gray-500 hidden sm:block">Sistem Informasi SDM Terintegrasi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
