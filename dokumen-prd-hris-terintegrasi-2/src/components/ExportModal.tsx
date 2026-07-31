import React, { useState } from 'react';
import { PRDSection } from '../types';
import { Download, Printer, Copy, Check, X, FileCode } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prdSections: PRDSection[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, prdSections }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateFullMarkdown = () => {
    let md = `# DOKUMEN PRODUCT REQUIREMENT DOCUMENT (PRD)\n`;
    md += `## APLIKASI ENTERPRISE HRIS TERINTEGRASI\n`;
    md += `**Versi:** 2.4.0-RELEASE | **Tanggal:** Juli 2026 | **Status:** Approved & Production-Ready\n\n`;
    md += `---\n\n`;

    prdSections.forEach((section) => {
      md += `## ${section.title}\n\n`;
      md += `*${section.description}*\n\n`;

      section.subsections.forEach((sub) => {
        md += `### ${sub.title}\n\n`;
        md += `${sub.content}\n\n`;

        if (sub.callout) {
          md += `> **${sub.callout.title}**\n> ${sub.callout.text}\n\n`;
        }

        if (sub.acceptanceCriteria && sub.acceptanceCriteria.length > 0) {
          md += `#### Kriteria Penerimaan (Acceptance Criteria):\n`;
          sub.acceptanceCriteria.forEach((crit) => {
            md += `- [ ] ${crit}\n`;
          });
          md += `\n`;
        }
      });

      md += `---\n\n`;
    });

    return md;
  };

  const handleDownloadMarkdown = () => {
    const content = generateFullMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'PRD_HRIS_Terintegrasi.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateFullMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Ekspor Dokumen PRD Complete</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Pilih format ekspor dokumen spesifikasi PRD lengkap termasuk 4 modul utama (Absensi, Payroll, Cuti, Evaluasi Kinerja), Arsitektur, ERD Database, dan API Specification.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              onClick={handleDownloadMarkdown}
              className="p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900 font-bold transition-all"
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <span className="block text-xs">Download File Markdown (.md)</span>
                  <span className="text-[10px] text-blue-600 font-normal">Format standar untuk Notion, GitHub, atau JIRA</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={handlePrint}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-slate-900 font-bold transition-all"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-slate-600" />
                <div className="text-left">
                  <span className="block text-xs">Cetak / Simpan ke PDF (Print View)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Tampilan dokumen bersih yang dioptimalkan untuk cetak PDF</span>
                </div>
              </div>
              <Printer className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-slate-900 font-bold transition-all"
            >
              <div className="flex items-center gap-3">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-slate-600" />}
                <div className="text-left">
                  <span className="block text-xs">{copied ? 'Teks Markdown Tersalin!' : 'Salin Seluruh Teks ke Clipboard'}</span>
                  <span className="text-[10px] text-slate-500 font-normal">Siap tempel langsung ke dokumen Word / Docs</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
