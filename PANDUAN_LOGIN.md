# 🔐 Panduan Login & Verifikasi Email — HRIS Enterprise

Panduan untuk pengguna aplikasi: cara masuk, mendaftar, verifikasi email, dan pemecahan masalah umum.

---

## 🌐 Akses Aplikasi

| Item | Detail |
|------|--------|
| **URL aplikasi** | `https://project421f-code.github.io/hris-enterprise/` |
| **Browser yang disarankan** | Chrome, Edge, Firefox (versi terbaru) |
| **Perangkat** | Desktop (optimal) & mobile |

---

## 🚪 1. Cara Masuk (Login)

1. Buka URL aplikasi di browser.
2. Halaman **Login** akan muncul dengan form **Email** dan **Password**.
3. Masukkan email kantor Anda (mis. `nama@perusahaan.com`).
4. Masukkan password Anda.
5. Klik tombol **Masuk**.
6. Anda akan diarahkan ke **Dashboard** jika kredensial benar.

> 💡 Klik ikon mata 👁 di kolom password untuk melihat password yang diketik.

### 🔑 Akun Demo (Data Contoh)

Data karyawan berikut tersedia sebagai contoh di database (dari seed data):

| Email | Peran | Deskripsi |
|-------|-------|-----------|
| `admin@tmi.co.id` | Super Admin | Akses penuh ke semua modul |
| `siti@tmi.co.id` | HR & Payroll | Kelola karyawan, absensi, payroll |
| `budi@tmi.co.id` | Manager | Review & approval tim |
| `andi@tmi.co.id` | Employee | Akses data diri & pengajuan |

> ⚠️ **Catatan:** Data di atas adalah **data karyawan contoh** (profil), bukan akun login yang aktif. 
> Akun login (email + password) untuk kredensial demo perlu **dibuat oleh admin HRIS** di dashboard Supabase terlebih dahulu sebelum bisa dipakai masuk.

---

## 🆕 2. Cara Mendaftar (Signup / Buat Akun Baru)

1. Di halaman Login, klik **Daftar Baru**.
2. Isi formulir yang muncul:
   - **Nama Lengkap** — nama sesuai dokumen resmi (wajib).
   - **Email** — gunakan email perusahaan/kantor (wajib).
   - **Password** — minimal **6 karakter** (wajib).
3. Klik tombol **Daftar**.
4. Sistem akan membuat akun dan otomatis menyiapkan **perusahaan baru** + **profil karyawan Anda** (via Edge Function `handle-signup`).
5. Lanjut ke langkah verifikasi di bawah.

---

## 📧 3. Alur Verifikasi Email (WAJIB)

Setiap akun baru **harus memverifikasi email sebelum bisa login**.

### Langkah-langkah:

1. Setelah mendaftar, cek **inbox email** Anda.
2. Buka email dari **HRIS Enterprise** dengan subjek konfirmasi/verifikasi.
3. Klik tombol/link **"Confirm your email"** atau **"Verifikasi Email"** di dalam email.
4. Setelah diklik, email Anda terverifikasi ✅ dan Anda siap login.

### ⏳ Status yang perlu diketahui:

| Status | Arti | Bisa Login? |
|--------|------|-------------|
| Email **belum** diverifikasi | Akun baru menunggu konfirmasi | ❌ Tidak (muncul pesan `Email not confirmed`) |
| Email **sudah** diverifikasi | Akun aktif | ✅ Ya |

> ⚠️ **Penting:** Jika login ditolak dengan pesan *"Email not confirmed"*, artinya Anda belum menekan link verifikasi di email. Buka kembali email konfirmasi dari sistem dan klik link-nya.

---

## ❓ 4. Pemecahan Masalah Umum

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| **"Invalid login credentials"** | Email/password salah atau akun belum ada | Periksa kembali email & password. Gunakan fitur *Daftar Baru* jika belum punya akun. |
| **"Email not confirmed"** | Email belum diverifikasi | Buka email konfirmasi dan klik link verifikasi. |
| **"Email rate limit exceeded"** | Terlalu banyak percobaan daftar dalam waktu singkat | Tunggu ±1 jam, lalu coba lagi. Proteksi ini bawaan Supabase untuk mencegah spam. |
| **"Email address is invalid"** | Format email salah atau domain tidak diizinkan | Pastikan email benar (mis. `nama@perusahaan.co.id`), tanpa spasi. |
| **Tidak menerima email verifikasi** | Email masuk ke spam/junk, atau salah ketik alamat | Cek folder **Spam/Junk**. Ulangi pendaftaran dengan email yang benar jika perlu. |
| **Lupa password** | — | Hubungi **admin HRIS** perusahaan untuk reset akun. |

---

## 🔒 5. Keamanan Akun

- Gunakan password kuat (kombinasi huruf besar/kecil, angka, simbol).
- Jangan bagikan kredensial login ke siapa pun.
- Keluar dari akun (*logout*) saat menggunakan perangkat bersama.
- Akses data dibatasi per peran (`super_admin`, `hr_payroll`, `manager`, `employee`) dan diisolasi antar perusahaan (multi-tenant/RLS).

---

## 🗺️ 6. Alur Singkat (Flowchart Teks)

```
Buka aplikasi
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
   │               └─ Login kembali → ✅ Dashboard
```

---

*Terakhir diperbarui: 1 Agustus 2026 · Aplikasi: HRIS Enterprise Suite v1.0.0-LIVE*
