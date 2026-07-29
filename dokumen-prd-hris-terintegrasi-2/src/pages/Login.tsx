import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle, Building2, Users, DollarSign, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Nama lengkap harus diisi');
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, fullName);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccessMessage('Akun berhasil dibuat! Silakan cek email untuk verifikasi, atau login langsung.');
          setIsSignUp(false);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left - Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 max-w-md space-y-8">
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-900/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif italic text-white">Enterprise HRIS</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform Manajemen SDM Terintegrasi — Absensi GPS, Payroll PPh 21 TER, 
              Manajemen Cuti, Evaluasi Kinerja, dan Manpower Planning dalam satu ekosistem.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white">Multi-Company</h4>
              <p className="text-[10px] text-gray-500">Arsitektur multi-tenant</p>
            </div>
            <div className="p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">1000+ Employees</h4>
              <p className="text-[10px] text-gray-500">Skalabel enterprise</p>
            </div>
            <div className="p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white">PPh 21 TER</h4>
              <p className="text-[10px] text-gray-500">PMK 168/2023</p>
            </div>
            <div className="p-3 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl space-y-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white">ISO 27001</h4>
              <p className="text-[10px] text-gray-500">Keamanan data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">HRIS Enterprise</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isSignUp ? 'Buat Akun Baru' : 'Masuk ke Dashboard'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isSignUp
                ? 'Daftar untuk mulai menggunakan HRIS Enterprise'
                : 'Gunakan akun perusahaan Anda'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Andi Pratama"
                  className="w-full px-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-sm transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full px-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-sm transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Min. 6 karakter' : 'Password Anda'}
                  className="w-full px-4 py-2.5 pr-10 bg-[#121212] border border-[#262626] rounded-xl focus:bg-[#181818] focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 text-sm transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                'Daftar'
              ) : (
                'Masuk'
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Masuk' : 'Daftar Baru'}
              </button>
            </p>
          </form>

          <div className="pt-4 border-t border-[#1a1a1a] text-center">
            <Link
              to="/prd"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              📖 Lihat Dokumentasi PRD
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
