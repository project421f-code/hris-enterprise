import React, { useState } from 'react';
import { PRDSectionId } from '../types';
import { 
  FileText, Sparkles, Download, Search, CheckCircle2, Clock, FileEdit, 
  ChevronDown, ChevronUp, BarChart2, ShieldCheck, Check
} from 'lucide-react';

export type PRDSectionStatus = 'Approved' | 'Review' | 'Draft';

export interface SectionProgressData {
  id: PRDSectionId;
  label: string;
  iconBadge?: string;
  status: PRDSectionStatus;
  progressPct: number;
}

interface PRDHeaderProps {
  activeSection: PRDSectionId;
  onSelectSection: (id: PRDSectionId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAI: () => void;
  onOpenExport: () => void;
}

const INITIAL_SECTIONS_DATA: SectionProgressData[] = [
  { id: 'overview', label: '1. Visi & Scope', status: 'Approved', progressPct: 100 },
  { id: 'personas', label: 'User Personas', status: 'Approved', progressPct: 100 },
  { id: 'absensi', label: '2. Modul Absensi', iconBadge: 'GPS', status: 'Approved', progressPct: 100 },
  { id: 'payroll', label: '3. Modul Payroll', iconBadge: 'PPh 21', status: 'Approved', progressPct: 100 },
  { id: 'cuti', label: '4. Modul Cuti', status: 'Approved', progressPct: 100 },
  { id: 'kinerja', label: '5. Evaluasi Kinerja', iconBadge: '9-Box', status: 'Approved', progressPct: 100 },
  { id: 'manpower', label: '6. Modul Manpower', iconBadge: 'MPP', status: 'Approved', progressPct: 100 },
  { id: 'simulators', label: '🧮 Simulators', status: 'Approved', progressPct: 100 },
  { id: 'wireframes', label: '📱 Wireframes', status: 'Review', progressPct: 90 },
  { id: 'arsitektur', label: '7. Arsitektur', status: 'Approved', progressPct: 100 },
  { id: 'database', label: '8. Database ERD', status: 'Approved', progressPct: 100 },
  { id: 'api', label: '9. API Specs', status: 'Approved', progressPct: 100 },
  { id: 'regulasi', label: '10. Regulasi RI', status: 'Approved', progressPct: 100 },
  { id: 'roadmap', label: '11. Roadmap', status: 'Draft', progressPct: 65 },
];

export const PRDHeader: React.FC<PRDHeaderProps> = ({
  activeSection,
  onSelectSection,
  searchQuery,
  onSearchChange,
  onOpenAI,
  onOpenExport
}) => {
  const [sections, setSections] = useState<SectionProgressData[]>(INITIAL_SECTIONS_DATA);
  const [isStatusDrawerOpen, setIsStatusDrawerOpen] = useState<boolean>(false);

  // Calculate completion statistics
  const approvedCount = sections.filter(s => s.status === 'Approved').length;
  const reviewCount = sections.filter(s => s.status === 'Review').length;
  const draftCount = sections.filter(s => s.status === 'Draft').length;
  const totalCount = sections.length;

  const totalProgress = Math.round(
    sections.reduce((acc, curr) => acc + curr.progressPct, 0) / totalCount
  );

  const approvedWidth = (approvedCount / totalCount) * 100;
  const reviewWidth = (reviewCount / totalCount) * 100;
  const draftWidth = (draftCount / totalCount) * 100;

  const cycleStatus = (id: PRDSectionId) => {
    setSections(prev =>
      prev.map(sec => {
        if (sec.id === id) {
          if (sec.status === 'Approved') return { ...sec, status: 'Review', progressPct: 85 };
          if (sec.status === 'Review') return { ...sec, status: 'Draft', progressPct: 50 };
          return { ...sec, status: 'Approved', progressPct: 100 };
        }
        return sec;
      })
    );
  };

  const getStatusBadgeStyle = (status: PRDSectionStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
      case 'Review':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'Draft':
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const getStatusDotColor = (status: PRDSectionStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-400';
      case 'Review':
        return 'bg-amber-400';
      case 'Draft':
        return 'bg-slate-500';
    }
  };

  return (
    <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] sticky top-0 z-40 shadow-xl print:hidden">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#141414] border border-[#262626] text-white rounded-xl shadow-inner">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-serif italic text-white tracking-wider">Dokumen PRD HRIS Terintegrasi</h1>
              <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-md text-[10px] font-mono tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3" /> v2.4 Approved
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Benchmark Mekari Talenta • Absensi, Payroll PPh 21 TER, Cuti, & Performance Review</p>
          </div>
        </div>

        {/* Right Actions & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari fitur, regulasi, API..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 transition-all"
            />
          </div>

          <button
            onClick={onOpenAI}
            className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#222222] border border-[#2e2e2e] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Assistant
          </button>

          <button
            onClick={onOpenExport}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-200 text-black rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Progress Bar Summary Section */}
      <div className="bg-[#0e0e0e] border-t border-b border-[#181818] px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Progress Stats Summary & Segmented Bar */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <BarChart2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-mono font-semibold text-white">
                Progress PRD: <span className="text-emerald-400 font-bold">{totalProgress}%</span>
              </span>
            </div>

            {/* Segmented Multi-Color Progress Bar */}
            <div className="flex-1 max-w-md bg-[#181818] border border-[#262626] h-2.5 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${approvedWidth}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`${approvedCount} Approved (${Math.round(approvedWidth)}%)`}
              />
              <div
                style={{ width: `${reviewWidth}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`${reviewCount} Review (${Math.round(reviewWidth)}%)`}
              />
              <div
                style={{ width: `${draftWidth}%` }}
                className="bg-slate-600 h-full transition-all duration-500"
                title={`${draftCount} Draft (${Math.round(draftWidth)}%)`}
              />
            </div>

            {/* Badges Count */}
            <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
              <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {approvedCount} Approved
              </span>
              <span className="px-2 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> {reviewCount} Review
              </span>
              <span className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-700 rounded flex items-center gap-1">
                <FileEdit className="w-3 h-3 text-slate-400" /> {draftCount} Draft
              </span>
            </div>
          </div>

          {/* Toggle Detail Drawer Button */}
          <button
            onClick={() => setIsStatusDrawerOpen(!isStatusDrawerOpen)}
            className="px-2.5 py-1 bg-[#161616] hover:bg-[#202020] border border-[#282828] text-gray-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all self-end md:self-auto shrink-0"
          >
            <span>Detail Status Section</span>
            {isStatusDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Section Status Matrix Drawer */}
        {isStatusDrawerOpen && (
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-[#1f1f1f] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pb-2 animate-fadeIn">
            {sections.map((sec) => (
              <div
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  activeSection === sec.id
                    ? 'bg-[#181818] border-blue-500/60 shadow-sm'
                    : 'bg-[#121212] border-[#222222] hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white truncate">{sec.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cycleStatus(sec.id);
                    }}
                    title="Klik untuk mengubah status penyelesaian (Approved ➔ Review ➔ Draft)"
                    className={`px-1.5 py-0.5 text-[9px] font-mono border rounded font-bold uppercase transition-all shrink-0 ${getStatusBadgeStyle(
                      sec.status
                    )}`}
                  >
                    {sec.status}
                  </button>
                </div>

                {/* Individual Section Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>Progress</span>
                    <span className="font-bold text-gray-300">{sec.progressPct}%</span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${sec.progressPct}%` }}
                      className={`h-full transition-all duration-300 ${
                        sec.status === 'Approved'
                          ? 'bg-emerald-400'
                          : sec.status === 'Review'
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1a1a1a] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 py-2 min-w-max">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex flex-col gap-1 transition-all whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-[#151515] text-white border border-[#2a2a2a] shadow-xs'
                  : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(sec.status)}`} />
                <span>{sec.label}</span>

                {sec.iconBadge && (
                  <span className="px-1.5 py-0.2 bg-blue-950/80 text-blue-400 border border-blue-800/50 text-[9px] font-mono rounded">
                    {sec.iconBadge}
                  </span>
                )}

                <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${getStatusBadgeStyle(sec.status)}`}>
                  {sec.status === 'Approved' ? '100%' : `${sec.progressPct}%`}
                </span>
              </div>

              {/* Mini Tab Progress Line */}
              <div className="w-full bg-[#1e1e1e] h-0.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${sec.progressPct}%` }}
                  className={`h-full ${
                    sec.status === 'Approved'
                      ? 'bg-emerald-400'
                      : sec.status === 'Review'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

