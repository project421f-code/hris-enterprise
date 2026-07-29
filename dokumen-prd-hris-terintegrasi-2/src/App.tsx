import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EmployeeList } from './pages/Employees/EmployeeList';
import { EmployeeForm } from './pages/Employees/EmployeeForm';
import { EmployeeDetail } from './pages/Employees/EmployeeDetail';
import { DepartmentList } from './pages/Departments/DepartmentList';
import { AttendanceDashboard } from './pages/Attendance/AttendanceDashboard';
import { AttendanceLogs } from './pages/Attendance/AttendanceLogs';
import { ShiftManagement } from './pages/Attendance/ShiftManagement';
import { LeaveDashboard } from './pages/Leave/LeaveDashboard';
import { LeaveRequestList } from './pages/Leave/LeaveRequestList';
import { LeaveRequestForm } from './pages/Leave/LeaveRequestForm';
import { LeavePolicies } from './pages/Leave/LeavePolicies';
import { PayrollDashboard } from './pages/Payroll/PayrollDashboard';
import { PayrollRunList } from './pages/Payroll/PayrollRunList';
import { PayrollRunDetail } from './pages/Payroll/PayrollRunDetail';
import { PayrollSimulator } from './pages/Payroll/PayrollSimulator';
import { PerformanceDashboard } from './pages/Performance/PerformanceDashboard';
import { PerformanceReviewList } from './pages/Performance/PerformanceReviewList';
import { PerformanceReviewForm } from './pages/Performance/PerformanceReviewForm';
import { NineBoxMatrix } from './pages/Performance/NineBoxMatrix';
import { ManpowerDashboard } from './pages/Manpower/ManpowerDashboard';
import { MPPPlanList } from './pages/Manpower/MPPPlanList';
import { MPPPlanForm } from './pages/Manpower/MPPPlanForm';
import { FPTKList } from './pages/Manpower/FPTKList';
import { FPTKForm } from './pages/Manpower/FPTKForm';
import { PRDSectionId } from './types';
import { PRD_SECTIONS } from './data/prdContent';
import { PRDHeader } from './components/PRDHeader';
import { PRDSectionView } from './components/PRDSectionView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ExportModal } from './components/ExportModal';
import { Search, Sparkles, FileText, ShieldCheck, Download, Calculator, Smartphone, Users } from 'lucide-react';

const PRDViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<PRDSectionId>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const currentSection = PRD_SECTIONS.find((s) => s.id === activeSection) || PRD_SECTIONS[0];

  const filteredSections = searchQuery.trim()
    ? PRD_SECTIONS.filter((sec) => {
        const query = searchQuery.toLowerCase();
        const matchTitle = sec.title.toLowerCase().includes(query);
        const matchDesc = sec.description.toLowerCase().includes(query);
        const matchSub = sec.subsections.some((sub) =>
          sub.title.toLowerCase().includes(query) || sub.content.toLowerCase().includes(query)
        );
        return matchTitle || matchDesc || matchSub;
      })
    : [];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-blue-900 selection:text-white">
      <PRDHeader
        activeSection={activeSection}
        onSelectSection={(id) => { setActiveSection(id); setSearchQuery(''); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAI={() => setIsAIModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            <button onClick={() => setActiveSection('manpower')}
              className="p-4 bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] hover:border-emerald-500/50 hover:bg-[#141414] transition-all text-left flex items-start gap-3 group">
              <div className="p-2.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xl group-hover:scale-105"><Users className="w-5 h-5" /></div>
              <div><h4 className="font-bold text-xs text-white group-hover:text-emerald-400">Modul Manpower (MPP)</h4><p className="text-[11px] text-gray-500 mt-0.5">Simulasi FPTK, Headcount, & Anggaran SDM</p></div>
            </button>
            <button onClick={() => setActiveSection('simulators')}
              className="p-4 bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] hover:border-blue-500/50 hover:bg-[#141414] transition-all text-left flex items-start gap-3 group">
              <div className="p-2.5 bg-blue-950/60 text-blue-400 border border-blue-800/40 rounded-xl group-hover:scale-105"><Calculator className="w-5 h-5" /></div>
              <div><h4 className="font-bold text-xs text-white group-hover:text-blue-400">Simulator Payroll & TER</h4><p className="text-[11px] text-gray-500 mt-0.5">Uji kalkulasi PPh 21 TER PMK 168 & BPJS riil</p></div>
            </button>
            <button onClick={() => setActiveSection('wireframes')}
              className="p-4 bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] hover:border-purple-500/50 hover:bg-[#141414] transition-all text-left flex items-start gap-3 group">
              <div className="p-2.5 bg-purple-950/60 text-purple-400 border border-purple-800/40 rounded-xl group-hover:scale-105"><Smartphone className="w-5 h-5" /></div>
              <div><h4 className="font-bold text-xs text-white group-hover:text-purple-400">Wireframe Mockups</h4><p className="text-[11px] text-gray-500 mt-0.5">Pratinjau antarmuka ESS Mobile & Admin</p></div>
            </button>
            <button onClick={() => setIsAIModalOpen(true)}
              className="p-4 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 text-white rounded-2xl border border-blue-800/50 hover:border-blue-500/70 hover:shadow-lg transition-all text-left flex items-start gap-3 group">
              <div className="p-2.5 bg-blue-900/40 rounded-xl group-hover:scale-105 border border-blue-700/50"><Sparkles className="w-5 h-5 text-amber-300" /></div>
              <div><h4 className="font-bold text-xs text-white">AI PRD Assistant</h4><p className="text-[11px] text-blue-300 mt-0.5">Tambah spesifikasi atau modul baru</p></div>
            </button>
          </div>
        )}
        {searchQuery.trim() ? (
          <div className="space-y-6">
            <div className="p-4 bg-[#0f0f0f] border border-blue-900/60 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-bold text-blue-300">Menampilkan hasil pencarian untuk "{searchQuery}": {filteredSections.length} bagian ditemukan</span>
              <button onClick={() => setSearchQuery('')} className="text-blue-400 hover:underline font-semibold">Bersihkan Pencarian</button>
            </div>
            {filteredSections.length === 0 ? (
              <div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] space-y-3">
                <Search className="w-10 h-10 text-gray-600 mx-auto" />
                <h3 className="font-bold text-white text-sm">Tidak Ada Bagian PRD Yang Cocok</h3>
                <p className="text-xs text-gray-500">Coba kata kunci lain seperti "Payroll", "PPh 21", "Geofence", "Cuti", atau "KPI".</p>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <PRDSectionView key={sec.id} section={sec} allSections={PRD_SECTIONS}
                  onNavigateSection={(id) => { setActiveSection(id); setSearchQuery(''); }} />
              ))
            )}
          </div>
        ) : (
          <PRDSectionView section={currentSection} allSections={PRD_SECTIONS} onNavigateSection={setActiveSection} />
        )}
      </main>
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] py-6 mt-12 text-center text-xs text-gray-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-serif italic text-white text-sm">Aplikasi PRD HRIS Terintegrasi (Benchmark Mekari Talenta)</p>
          <p className="text-[11px] text-gray-500">Dilengkapi Modul Absensi GPS, Payroll PPh 21 TER, Cuti, & Evaluasi Kinerja 9-Box</p>
        </div>
      </footer>
      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} currentSectionTitle={currentSection.title} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} prdSections={PRD_SECTIONS} />
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/prd" element={<PRDViewer />} />
      <Route path="/prd/*" element={<PRDViewer />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/departments" element={<DepartmentList />} />
        <Route path="/attendance" element={<AttendanceDashboard />} />
        <Route path="/attendance/logs" element={<AttendanceLogs />} />
        <Route path="/attendance/shifts" element={<ShiftManagement />} />
        <Route path="/leave" element={<LeaveDashboard />} />
        <Route path="/leave/requests" element={<LeaveRequestList />} />
        <Route path="/leave/new" element={<LeaveRequestForm />} />
        <Route path="/leave/policies" element={<LeavePolicies />} />
        <Route path="/payroll" element={<PayrollDashboard />} />
        <Route path="/payroll/runs" element={<PayrollRunList />} />
        <Route path="/payroll/runs/new" element={<PayrollDashboard />} />
        <Route path="/payroll/runs/:id" element={<PayrollRunDetail />} />
        <Route path="/payroll/simulator" element={<PayrollSimulator />} />
        <Route path="/performance" element={<PerformanceDashboard />} />
        <Route path="/performance/reviews" element={<PerformanceReviewList />} />
        <Route path="/performance/new" element={<PerformanceReviewForm />} />
        <Route path="/performance/matrix" element={<NineBoxMatrix />} />
        <Route path="/manpower" element={<ManpowerDashboard />} />
        <Route path="/manpower/plans" element={<MPPPlanList />} />
        <Route path="/manpower/plans/new" element={<MPPPlanForm />} />
        <Route path="/manpower/fptk" element={<FPTKList />} />
        <Route path="/manpower/fptk/new" element={<FPTKForm />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
