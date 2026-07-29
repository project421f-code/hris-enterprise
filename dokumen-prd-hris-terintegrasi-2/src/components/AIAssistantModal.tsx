import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, Copy, Check, FileText } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSectionTitle: string;
  onApplySnippet?: (text: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentSectionTitle,
  onApplySnippet
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/ai/generate-prd-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentModule: currentSectionTitle,
          context: 'PRD Sistem HRIS Terintegrasi (Mekari Talenta Benchmark)'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses AI.');
      }

      setResponse(data.result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memanggil AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetQuestions = [
    'Tambahkan kriteria penerimaan (acceptance criteria) untuk shift pabrik 3 rotasi.',
    'Bagaimana aturan penanganan klaim reimbursement medis dalam PRD ini?',
    'Buatkan skenario audit PPh 21 TER PMK 168/2023 untuk karyawan yang resign di pertengahan tahun.',
    'Tambahkan spesifikasi fitur Surat Peringatan (SP 1, SP 2, SP 3) terintegrasi ke Payroll.'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI PRD Customizer & Legal Assistant</h3>
              <p className="text-[11px] text-blue-200">Kustomisasi spesifikasi PRD atau konsultasi regulasi ketenagakerjaan RI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Preset Prompts */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Contoh Instruksi Kustomisasi:</span>
            <div className="flex flex-wrap gap-1.5">
              {presetQuestions.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-left text-[11px] transition-all border border-slate-200"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-800">Instruksi Tambahan PRD ({currentSectionTitle}):</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Tambahkan aturan perhitungan denda keterlambatan bertingkat..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses Spesifikasi AI...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Hasilkan Spesifikasi PRD
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* AI Output Display */}
          {response && (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-blue-600" /> Hasil Spesifikasi Tambahan:
                </span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin' : 'Salin Teks'}
                </button>
              </div>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
