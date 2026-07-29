import React from 'react';
import { PRDSection, PRDSectionId, UserPersona, APIEndpoint, DatabaseTable } from '../types';
import { USER_PERSONAS, DATABASE_TABLES, API_ENDPOINTS } from '../data/prdContent';
import { CheckSquare, AlertCircle, ShieldAlert, Cpu, Database, Code, CheckCircle2, User, ChevronRight, Copy, Check } from 'lucide-react';
import { PayrollSimulator } from './Simulators/PayrollSimulator';
import { LeaveProrateSimulator } from './Simulators/LeaveProrateSimulator';
import { AttendanceGeofenceSimulator } from './Simulators/AttendanceGeofenceSimulator';
import { PerformanceMatrixSimulator } from './Simulators/PerformanceMatrixSimulator';
import { ManpowerSimulator } from './Simulators/ManpowerSimulator';
import { WireframePreviews } from './WireframePreviews';

interface PRDSectionViewProps {
  section: PRDSection;
  allSections: PRDSection[];
  onNavigateSection: (id: PRDSectionId) => void;
}

export const PRDSectionView: React.FC<PRDSectionViewProps> = ({ section, allSections, onNavigateSection }) => {
  const [copiedSnippetId, setCopiedSnippetId] = React.useState<string | null>(null);

  const handleCopySnippet = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(snippetId);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Table of Contents / Sidebar */}
      <div className="lg:col-span-3 space-y-4 sticky top-28 print:hidden">
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 shadow-sm space-y-3">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Daftar Isi PRD</h4>
          <nav className="space-y-1 text-xs">
            {allSections.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigateSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between font-medium ${
                  section.id === s.id
                    ? 'bg-[#181818] text-white font-bold border border-[#2a2a2a]'
                    : 'text-gray-400 hover:bg-[#141414] hover:text-white'
                }`}
              >
                <span className="truncate">{s.title}</span>
                {section.id === s.id && <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </button>
            ))}
          </nav>
        </div>

        {/* System Specs Widget */}
        <div className="p-4 bg-[#0a0a0a] text-white rounded-2xl space-y-2 text-xs border border-[#1a1a1a]">
          <span className="text-[10px] uppercase font-mono text-blue-400 tracking-wider block">Standar Kepatuhan HRIS</span>
          <div className="space-y-1.5 text-gray-400 text-[11px]">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> PPh 21 TER PMK 168/2023</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> BPJS Kesehatan & TK Capping</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Permenaker 102/2004 Lembur</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> ISO 27001 Security Audit</div>
          </div>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="lg:col-span-9 space-y-8">
        {/* Section Header Banner */}
        <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            {section.badge && (
              <span className="px-2.5 py-0.5 bg-blue-950/80 text-blue-400 rounded-full text-xs font-mono border border-blue-800/60">
                {section.badge}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">Enterprise HRIS PRD Specification</span>
          </div>
          <h2 className="text-2xl font-serif italic text-white tracking-wide">{section.title}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{section.description}</p>
        </div>

        {/* Special Tab Render: User Personas */}
        {section.id === 'personas' && (
          <div className="space-y-6">
            <h3 className="text-base font-serif italic text-white border-b border-[#1a1a1a] pb-2">Katalog User Personas & Matriks Akses Modul</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {USER_PERSONAS.map((persona, idx) => (
                <div key={idx} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-blue-400 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{persona.role}</h4>
                      <p className="text-xs text-gray-500 font-medium">{persona.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{persona.description}</p>

                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-rose-400 block text-[11px] uppercase tracking-wider">Pain Points Utama:</span>
                    <ul className="list-disc pl-4 text-gray-400 space-y-1 text-[11px]">
                      {persona.painPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-[#1a1a1a]">
                    <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">Kebutuhan Kunci:</span>
                    <ul className="list-disc pl-4 text-gray-400 space-y-1 text-[11px]">
                      {persona.keyNeeds.map((kn, kIdx) => (
                        <li key={kIdx}>{kn}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1a1a1a]">
                    {persona.moduleAccess.map((mod, mIdx) => (
                      <span key={mIdx} className="px-2 py-0.5 bg-[#181818] text-gray-300 rounded text-[10px] font-medium border border-[#2a2a2a]">
                        Akses {mod}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Tab Render: Manpower Planning Section Simulator */}
        {section.id === 'manpower' && (
          <div className="space-y-6 mb-6">
            <ManpowerSimulator />
          </div>
        )}

        {/* Special Tab Render: Simulators */}
        {section.id === 'simulators' && (
          <div className="space-y-8">
            <PayrollSimulator />
            <LeaveProrateSimulator />
            <AttendanceGeofenceSimulator />
            <PerformanceMatrixSimulator />
            <ManpowerSimulator />
          </div>
        )}

        {/* Special Tab Render: Wireframes */}
        {section.id === 'wireframes' && (
          <WireframePreviews />
        )}

        {/* Special Tab Render: Database Schema */}
        {section.id === 'database' && (
          <div className="space-y-6">
            <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Spesifikasi Tabel Basis Data PostgreSQL</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Struktur tabel utama dalam database relasional terintegrasi. Menggunakan skema PostgreSQL dengan constraint integritas data, indeks pencarian, dan enkripsi kolom data sensitif.
              </p>
            </div>

            {DATABASE_TABLES.map((table, tIdx) => (
              <div key={tIdx} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden shadow-sm">
                <div className="p-4 bg-[#0a0a0a] text-white flex justify-between items-center border-b border-[#1a1a1a]">
                  <div>
                    <h4 className="font-mono font-bold text-sm text-blue-400">Tabel: {table.name}</h4>
                    <p className="text-xs text-gray-400">{table.description}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#181818] text-gray-300 rounded-md text-[10px] font-mono border border-[#2a2a2a]">PostgreSQL Entity</span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#050505] text-gray-400 uppercase text-[10px] border-b border-[#1a1a1a]">
                      <tr>
                        <th className="p-3">Nama Kolom</th>
                        <th className="p-3">Tipe Data</th>
                        <th className="p-3">Atribut</th>
                        <th className="p-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a] font-mono text-[11px]">
                      {table.fields.map((field, fIdx) => (
                        <tr key={fIdx} className="hover:bg-[#141414]">
                          <td className="p-3 font-bold text-white">{field.name}</td>
                          <td className="p-3 text-blue-400">{field.type}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {field.isPrimary && <span className="px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[9px] font-bold">PK</span>}
                              {field.isForeign && <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-[9px] font-bold">FK</span>}
                              {!field.nullable ? <span className="px-1.5 py-0.5 bg-[#181818] text-gray-300 rounded text-[9px]">NOT NULL</span> : <span className="px-1.5 py-0.5 bg-[#121212] text-gray-500 rounded text-[9px]">NULL</span>}
                            </div>
                          </td>
                          <td className="p-3 font-sans text-gray-300">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Special Tab Render: API Specs */}
        {section.id === 'api' && (
          <div className="space-y-6">
            <div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Code className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Katalog REST API Endpoints</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Antarmuka API terstandarisasi untuk komunikasi antarmuka web, aplikasi mobile ESS, dan sistem eksternal (ERP/Bank Transfer).
              </p>
            </div>

            <div className="space-y-4">
              {API_ENDPOINTS.map((endpoint, aIdx) => (
                <div key={aIdx} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a1a1a] pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                        endpoint.method === 'GET' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        endpoint.method === 'POST' ? 'bg-blue-950 text-blue-400 border border-blue-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-xs font-bold text-white bg-[#121212] px-2 py-1 rounded border border-[#262626]">{endpoint.endpoint}</code>
                    </div>
                    <span className="px-2 py-0.5 bg-[#181818] text-gray-400 rounded text-[10px] font-medium border border-[#262626]">
                      Modul {endpoint.module}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300">{endpoint.summary}</p>

                  {endpoint.requestBodyExample && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Contoh Request Body (JSON):</span>
                      <pre className="p-3 bg-[#050505] text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-[#1a1a1a]">
                        {endpoint.requestBodyExample}
                      </pre>
                    </div>
                  )}

                  {endpoint.responseExample && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Contoh Response Body (JSON 200 OK):</span>
                      <pre className="p-3 bg-[#050505] text-blue-300 rounded-xl text-[11px] font-mono overflow-x-auto border border-[#1a1a1a]">
                        {endpoint.responseExample}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Subsections Rendering */}
        {section.subsections && section.subsections.map((sub) => (
          <div key={sub.id} className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white">{sub.title}</h3>
              <button
                onClick={() => handleCopySnippet(`${sub.title}\n\n${sub.content}`, sub.id)}
                className="p-1.5 hover:bg-[#181818] text-gray-500 hover:text-gray-300 rounded-lg text-xs flex items-center gap-1 transition-all"
                title="Salin Bagian Ini"
              >
                {copiedSnippetId === sub.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Markdown Paragraphs */}
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap space-y-2">
              {sub.content}
            </div>

            {/* Callout Box */}
            {sub.callout && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                sub.callout.type === 'regulation' ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' :
                sub.callout.type === 'tech' ? 'bg-indigo-950/30 border-indigo-800/50 text-indigo-200' :
                'bg-blue-950/30 border-blue-800/50 text-blue-200'
              }`}>
                {sub.callout.type === 'regulation' ? (
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : sub.callout.type === 'tech' ? (
                  <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="font-bold mb-0.5">{sub.callout.title}</h5>
                  <p className="leading-normal opacity-90">{sub.callout.text}</p>
                </div>
              </div>
            )}

            {/* Acceptance Criteria Checklist */}
            {sub.acceptanceCriteria && sub.acceptanceCriteria.length > 0 && (
              <div className="p-4 bg-[#080808] border border-[#1a1a1a] rounded-xl space-y-2.5 text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Kriteria Penerimaan QA (Acceptance Criteria):
                </span>
                <ul className="space-y-1.5 text-gray-300">
                  {sub.acceptanceCriteria.map((crit, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded border border-emerald-800 bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
