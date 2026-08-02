import React, { useEffect } from 'react';
import {
  X, BookOpen, Globe, LogIn, UserPlus, MailCheck, HelpCircle, ShieldCheck, Workflow,
} from 'lucide-react';

interface LoginGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <section className="bg-[#0d0d0d] border border-[#1c1c1c] rounded-2xl p-5 space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-white">
      <span className="text-blue-400 shrink-0">{icon}</span>
      {title}
    </h3>
    {children}
  </section>
);

const StepList: React.FC<{ steps: React.ReactNode[] }> = ({ steps }) => (
  <ol className="space-y-2">
    {steps.map((step, i) => (
      <li key={i} className="flex gap-3 text-xs text-gray-400 leading-relaxed">
        <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
          {i + 1}
        </span>
        <span>{step}</span>
      </li>
    ))}
  </ol>
);

const InfoTable: React.FC<{ headers: string[]; rows: React.ReactNode[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-[#1c1c1c]">
    <table className="w-full text-left text-[11px]">
      <thead>
        <tr className="bg-[#141414]">
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-2 text-gray-300 font-bold whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-[#1c1c1c]">
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-2 text-gray-400 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Callout: React.FC<{ type?: 'info' | 'warning'; children: React.ReactNode }> = ({ type = 'info', children }) => (
  <div
    className={`p-3 rounded-xl text-xs leading-relaxed ${
      type === 'warning'
        ? 'bg-amber-950/30 border border-amber-800/40 text-amber-200/90'
        : 'bg-blue-950/30 border border-blue-800/40 text-blue-200/90'
    }`}
  >
    {children}
  </div>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="px-1.5 py-0.5 bg-[#1a1a1a] border border-[#262626] rounded text-[10px] text-blue-300 font-mono">
    {children}
  </code>
);

export const LoginGuideModal: React.FC<LoginGuideModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Panduan Login & Verifikasi Email"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        style={{ animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1c] bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/30">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Panduan Login &amp; Verifikasi Email</h2>
              <p className="text-[11px] text-gray-500">HRIS Enterprise Suite · v1.0.0-LIVE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            aria-label="Tutup panduan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          {/* Akses Aplikasi */}
          <Section icon={<Globe className="w-4 h-4" />} title="🌐 Akses Aplikasi">
            <InfoTable
              headers={['Item', 'Detail']}
              rows={[
                ['URL aplikasi', <Code key="url">https://project421f-code.github.io/hris-enterprise/</Code>],
                ['Browser yang disarankan', 'Chrome, Edge, Firefox (versi terbaru)'],
                ['Perangkat', 'Desktop (optimal) &amp; mobile'],
              ]}
            />
          </Section>

          {/* Cara Masuk */}
          <Section icon={<LogIn className="w-4 h-4" />} title="🚪 1. Cara Masuk (Login)">
            <StepList
              steps={[
                <>Buka URL aplikasi di browser.</>,
                <>Halaman <strong className="text-gray-200">Login</strong> akan muncul dengan form <strong className="text-gray-200">Email</strong> dan <strong className="text-gray-200">Password</strong>.</>,
                <>Masukkan email kantor Anda (mis. <Code>nama@perusahaan.com</Code>).</>,
                <>Masukkan password Anda.</>,
                <>Klik tombol <strong className="text-gray-200">Masuk</strong>.</>,
                <>Anda akan diarahkan ke <strong className="text-gray-200">Dashboard</strong> jika kredensial benar.</>,
              ]}
            />
            <Callout>💡 Klik ikon mata 👁 di kolom password untuk melihat password yang diketik.</Callout>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-200">🔑 Akun Demo (Data Contoh)</h4>
              <InfoTable
                headers={['Email', 'Peran', 'Deskripsi']}
                rows={[
                  [<Code key="1">admin@tmi.co.id</Code>, 'Super Admin', 'Akses penuh ke semua modul'],
                  [<Code key="2">siti@tmi.co.id</Code>, 'HR &amp; Payroll', 'Kelola karyawan, absensi, payroll'],
                  [<Code key="3">budi@tmi.co.id</Code>, 'Manager', 'Review &amp; approval tim'],
                  [<Code key="4">andi@tmi.co.id</Code>, 'Employee', 'Akses data diri &amp; pengajuan'],
                ]}
              />
              <Callout type="warning">
                ⚠️ <strong>Catatan:</strong> Data di atas adalah <strong>data karyawan contoh</strong> (profil), bukan akun
                login yang aktif. Akun login (email + password) untuk kredensial demo perlu <strong>dibuat oleh admin HRIS</strong>{' '}
                di dashboard Supabase terlebih dahulu sebelum bisa dipakai masuk.
              </Callout>
            </div>
          </Section>

          {/* Cara Mendaftar */}
          <Section icon={<UserPlus className="w-4 h-4" />} title="🆕 2. Cara Mendaftar (Signup / Buat Akun Baru)">
            <StepList
              steps={[
                <>Di halaman Login, klik <strong className="text-gray-200">Daftar Baru</strong>.</>,
                <>
                  Isi formulir yang muncul:
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    <li><strong className="text-gray-200">Nama Lengkap</strong> — nama sesuai dokumen resmi (wajib).</li>
                    <li><strong className="text-gray-200">Email</strong> — gunakan email perusahaan/kantor (wajib).</li>
                    <li><strong className="text-gray-200">Password</strong> — minimal <strong className="text-gray-200">6 karakter</strong> (wajib).</li>
                  </ul>
                </>,
                <>Klik tombol <strong className="text-gray-200">Daftar</strong>.</>,
                <>
                  Sistem akan membuat akun dan otomatis menyiapkan <strong className="text-gray-200">perusahaan baru</strong> +{' '}
                  <strong className="text-gray-200">profil karyawan Anda</strong> (via Edge Function <Code>handle-signup</Code>).
                </>,
                <>Lanjut ke langkah verifikasi di bawah.</>,
              ]}
            />
          </Section>

          {/* Verifikasi Email */}
          <Section icon={<MailCheck className="w-4 h-4" />} title="📧 3. Alur Verifikasi Email (WAJIB)">
            <p className="text-xs text-gray-400 leading-relaxed">
              Setiap akun baru <strong className="text-gray-200">harus memverifikasi email sebelum bisa login</strong>.
            </p>
            <h4 className="text-xs font-bold text-gray-200">Langkah-langkah:</h4>
            <StepList
              steps={[
                <>Setelah mendaftar, cek <strong className="text-gray-200">inbox email</strong> Anda.</>,
                <>Buka email dari <strong className="text-gray-200">HRIS Enterprise</strong> dengan subjek konfirmasi/verifikasi.</>,
                <>Klik tombol/link <Code>Confirm your email</Code> atau <Code>Verifikasi Email</Code> di dalam email.</>,
                <>Setelah diklik, email Anda terverifikasi ✅ dan Anda siap login.</>,
              ]}
            />
            <h4 className="text-xs font-bold text-gray-200">⏳ Status yang perlu diketahui:</h4>
            <InfoTable
              headers={['Status', 'Arti', 'Bisa Login?']}
              rows={[
                ['Email belum diverifikasi', 'Akun baru menunggu konfirmasi', '❌ Tidak (muncul pesan Email not confirmed)'],
                ['Email sudah diverifikasi', 'Akun aktif', '✅ Ya'],
              ]}
            />
            <Callout type="warning">
              ⚠️ <strong>Penting:</strong> Jika login ditolak dengan pesan <Code>Email not confirmed</Code>, artinya Anda
              belum menekan link verifikasi di email. Buka kembali email konfirmasi dari sistem dan klik link-nya.
            </Callout>
          </Section>

          {/* Pemecahan Masalah */}
          <Section icon={<HelpCircle className="w-4 h-4" />} title="❓ 4. Pemecahan Masalah Umum">
            <InfoTable
              headers={['Masalah', 'Penyebab', 'Solusi']}
              rows={[
                [<strong key="1" className="text-gray-300">Invalid login credentials</strong>, 'Email/password salah atau akun belum ada', 'Periksa kembali email &amp; password. Gunakan fitur Daftar Baru jika belum punya akun.'],
                [<strong key="2" className="text-gray-300">Email not confirmed</strong>, 'Email belum diverifikasi', 'Buka email konfirmasi dan klik link verifikasi.'],
                [<strong key="3" className="text-gray-300">Email rate limit exceeded</strong>, 'Terlalu banyak percobaan daftar dalam waktu singkat', 'Tunggu ±1 jam, lalu coba lagi. Proteksi ini bawaan Supabase untuk mencegah spam.'],
                [<strong key="4" className="text-gray-300">Email address is invalid</strong>, 'Format email salah atau domain tidak diizinkan', 'Pastikan email benar (mis. nama@perusahaan.co.id), tanpa spasi.'],
                ['Tidak menerima email verifikasi', 'Email masuk ke spam/junk, atau salah ketik alamat', 'Cek folder Spam/Junk. Ulangi pendaftaran dengan email yang benar jika perlu.'],
                ['Lupa password', '—', 'Hubungi admin HRIS perusahaan untuk reset akun.'],
              ]}
            />
          </Section>

          {/* Keamanan Akun */}
          <Section icon={<ShieldCheck className="w-4 h-4" />} title="🔒 5. Keamanan Akun">
            <ul className="space-y-2 text-xs text-gray-400 leading-relaxed">
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> Gunakan password kuat (kombinasi huruf besar/kecil, angka, simbol).</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> Jangan bagikan kredensial login ke siapa pun.</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> Keluar dari akun (logout) saat menggunakan perangkat bersama.</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> Akses data dibatasi per peran (<Code>super_admin</Code>, <Code>hr_payroll</Code>, <Code>manager</Code>, <Code>employee</Code>) dan diisolasi antar perusahaan (multi-tenant/RLS).</li>
            </ul>
          </Section>

          {/* Alur Singkat */}
          <Section icon={<Workflow className="w-4 h-4" />} title="🗺️ 6. Alur Singkat (Flowchart Teks)">
            <pre className="bg-[#080808] border border-[#1c1c1c] rounded-xl p-4 text-[11px] leading-relaxed text-gray-400 font-mono overflow-x-auto whitespace-pre">
{`Buka aplikasi
   │
   ├─ Sudah punya akun?
   │     │
   │     ├─ YA → Login (email + password)
   │     │         │
   │     │         ├─ Email terverifikasi? → ✅ Dashboard
   │     │         └─ Belum? → ❌ "Email not confirmed" → verifikasi email → login
   │     │
   │     └─ TIDAK → Klik "Daftar Baru"
   │               ├─ Isi nama, email, password → klik "Daftar"
   │               ├─ Cek email → klik link verifikasi
   │               └─ Login kembali → ✅ Dashboard`}
            </pre>
          </Section>

          <p className="text-center text-[10px] text-gray-600 pt-1">
            Terakhir diperbarui: 1 Agustus 2026 · Aplikasi: HRIS Enterprise Suite v1.0.0-LIVE
          </p>
        </div>
      </div>
    </div>
  );
};
