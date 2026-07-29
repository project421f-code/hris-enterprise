# DOKUMEN PRODUCT REQUIREMENT DOCUMENT (PRD)
## APLIKASI ENTERPRISE HRIS TERINTEGRASI
**Versi:** 2.4.0-RELEASE | **Tanggal:** Juli 2026 | **Status:** Approved & Production-Ready

---

## 1. Executive Summary & Visi Sistem

*Spesifikasi tingkat tinggi mengenai tujuan bisnis, ruang lingkup produk, dan dampak strategis implementasi HRIS Terintegrasi.*

### 1.1 Visi & Latar Belakang Produk

Aplikasi **Enterprise HRIS Terintegrasi** dirancang untuk mentransformasi operasional Sumber Daya Manusia (SDM) dari proses manual terpisah menjadi platform SaaS berbasis cloud terpadu. Platform ini menghubungkan **Absensi (Time & Attendance)**, **Management Cuti & Izin**, **Payroll Engine (Penggajian)**, dan **Evaluasi Kinerja (Performance Management)** dalam satu ekosistem data yang sinkron secara real-time.

> **Target Dampak Bisnis**
> Mengurangi waktu proses payroll dari 5 hari menjadi kurang dari 2 jam per periode, menekan human error kalkulasi pajak/BPJS hingga 0%, dan meningkatkan kepuasan karyawan (ESS CSAT) di atas 90%.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Arsitektur Multi-tenant dengan isolasi data antar perusahaan secara aman
- [ ] Tersedia dalam antarmuka Web Dashboard (Admin & Manager) dan Mobile App (ESS Karyawan)
- [ ] Sesuai dengan regulasi Ketenagakerjaan Indonesia (UU Cipta Kerja, PPh 21 PMK 168/2023 TER, BPJS Kesehatan & Ketenagakerjaan)

### 1.2 Ruang Lingkup Integrasi 4 Modul Utama

Ekosistem HRIS ini menghilangkan sekat (silo) antar departemen dengan aliran data otomatis:
1. **Absensi ➔ Payroll**: Keterlambatan, ketidakhadiran (alpha), dan jam lembur otomatis mengkalkulasi komponen pemotong atau penambah gaji.
2. **Cuti ➔ Absensi & Payroll**: Cuti terbayar menjaga status hadir, sedangkan Unpaid Leave (cuti tidak terbayar) secara otomatis memotong gaji pokok/tunjangan harian.
3. **Kinerja ➔ Payroll**: Skor evaluasi kinerja (KPI/OKR) menjadi acuan pembagian bonus berkala, insentif, dan kenaikan gaji berkala.
4. **Data Karyawan Sentral (Core HR)**: Seluruh modul mengacu pada Master Data Karyawan (Grade, Jabatan, PTKP, Rekening Bank, Kebijakan Shift).

> **Keunggulan Aliran Data (Data Flow Architecture)**
> Setiap perubahan pada modul Absensi atau Cuti langsung mengkalkulasi ulang secara asinkron (background job worker) pada draft payroll berjalan tanpa membebankan performa sistem.

---

## 2. Modul Absensi & Waktu Kerja

*Modul pencatatan kehadiran, geofencing GPS, integrasi mesin biometrik fisik, manajemen shift fleksibel, dan pengajuan lembur.*

### 2.1 Clock-In/Out Mobile Geofencing & Liveness Selfie

Fitur pencatatan kehadiran mandiri melalui Mobile App ESS Karyawan dengan validasi berlapis:
- **GPS Geofencing**: Karyawan hanya bisa clock-in jika berada dalam radius lokasi kantor/site yang ditentukan (misal: radius 50 meter dari koordinat kantor).
- **Liveness & Face Recognition**: Mengambil foto selfie real-time dengan verifikasi ekspresi wajah/deteksi keaslian (anti-spoofing menggunakan foto atau layar HP lain).
- **Mode Wi-Fi / IP Bounding**: Validasi tambahan berdasarkan IP jaringan Wi-Fi kantor untuk pendaftaran lokasi kerja statis.
- **Mode WFH / Remote Working**: Karyawan luar kantor dapat melakukan check-in dengan mewajibkan isi deskripsi catatan kegiatan dan lokasi GPS fleksibel sesuai persetujuan atasan.

> **Pencegahan Kecurangan Absensi**
> Sistem secara otomatis menolak lokasi yang terdeteksi menggunakan Fake GPS / Mock Location API pada smartphone Android & iOS.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Kecepatan respons verifikasi wajah & lokasi < 1.5 detik
- [ ] Riwayat clock-in menyimpan data latitude, longitude, foto selfie, ID perangkat, dan alamat IP
- [ ] Peringatan otomatis dikirimkan ke atasan jika karyawan clock-in di luar area kantor yang diizinkan

### 2.2 Integrasi Mesin Fingerprint & Biometrik Fisik

Dukungan sinkronisasi otomatis dengan mesin absensi fisik (seperti ZK Teco, Hikvision, Solution) melalui:
- **Cloud Webhook Receiver**: Mesin absensi fisik mengirimkan log presensi secara real-time ke endpoint REST API HRIS saat jari/wajah terscan.
- **Auto-matching ID Karyawan**: Menghubungkan ID PIN mesin dengan NIK Karyawan di database sentral.
- **Offline Buffer Fallback**: Jika koneksi internet di lokasi cabang terputus, log disimpan lokal di mesin dan disinkronkan otomatis saat online kembali.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Dukungan integrasi multi-cabang tanpa perlu menyewa IP Publik statis di setiap lokasi
- [ ] Dukungan pemicu penggabungan data (deduplikasi) jika karyawan absen di hp dan mesin fingerprint pada hari yang sama

### 2.3 Pengaturan Shift Roster & Pengajuan Lembur (Overtime)

Manajemen waktu kerja fleksibel untuk industri Manufaktur, Retail, Hospitality, maupun Kantor Pusat:
- **Multi-Shift Roster**: Mendukung shift reguler, shift malam, shift bergilir (3 rotasi), dan jadwal kerja dinamis.
- **Aturan Lembur Permenaker No. 102/2004**:
  - Hari Kerja Biasa: Jam pertama dihitung 1.5x upah sejam, jam kedua dan seterusnya dihitung 2x upah sejam.
  - Hari Libur Resmi / Istirahat: Jam 1-7 dihitung 2x, jam ke-8 dihitung 3x, jam ke-9 & 10 dihitung 4x upah sejam.
- **Digital SPL (Surat Perintah Lembur)**: Karyawan mengajukan estimasi jam lembur via Mobile ESS ➔ Disetujui Atasan ➔ Karyawan melakukan Clock-In Lembur ➔ Sistem mengkalkulasi durasi aktual vs estimasi.

> **Formula Upah Lembur Sejam (Permenaker)**
> Upah Sejam = 1/173 × (Gaji Pokok + Tunjangan Tetap Bulan Berjalan).

---

## 3. Modul Payroll Engine Terintegrasi

*Kalkulasi penggajian otomatis terhubung dengan data kehadiran, potongan PPh 21 TER terbaru, BPJS Kesehatan & Ketenagakerjaan, serta distribusi file bank.*

### 3.1 Otomasi Kalkulasi Penggajian

Payroll Engine memproses penggajian ratusan/ribuan karyawan hanya dalam hitungan detik dengan formula yang dapat disesuaikan (custom salary components):
- **Komponen Penambah (Earnings)**: Gaji Pokok, Tunjangan Jabatan, Tunjangan Makan/Malam, Tunjangan Transport, Upah Lembur, Bonus Kinerja, Insentif Penjualan, THR.
- **Komponen Pemotong (Deductions)**: Potongan Keterlambatan (Late Penalty), Potongan Mangkir/Alpha, Potongan Unpaid Leave, Kasbon Karyawan, Iuran BPJS (Karyawan), PPh 21.
- **Kalkulasi Prorata (Prorated Salary)**: Untuk karyawan yang masuk di tengah bulan (New Hire) atau resign sebelum akhir bulan berdasarkan jumlah hari kerja efektif.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Sistem mengunci (lock) data absensi periode payroll saat proses kalkulasi dimulai
- [ ] Tersedia preview draf payroll sebelum dieksekusi oleh Tim Finance
- [ ] Mendukung simulasi perkiraan pengeluaran gaji per departemen

### 3.2 PPh 21 TER (PMK 168/2023) & BPJS Capping Engine

Mesin kalkulasi perpajakan dan jaminan sosial sesuai aturan hukum Republik Indonesia:
- **PPh 21 PMK 168/2023 (Metode TER - Tarif Efektif Rata-rata)**:
  - **Kategori TER A**: PTKP TK/0 (Rp 54 jt), TK/1 (Rp 58.5 jt), K/0 (Rp 58.5 jt).
  - **Kategori TER B**: PTKP TK/2, TK/3, K/1, K/2.
  - **Kategori TER C**: PTKP K/3 (Rp 72 jt).
  - Otomatis mencocokkan Bruto Bulanan dengan tabel tarif TER (0% hingga 34%) untuk bulan Januari - November, serta kalkulasi rekonsiliasi Pasal 17 pada bulan Desember.
- **BPJS Ketenagakerjaan**:
  - **JKK (Jaminan Kecelakaan Kerja)**: 0.24% - 1.74% (Ditanggung Perusahaan, tergantung tingkat risiko industri).
  - **JKM (Jaminan Kematian)**: 0.30% (Ditanggung Perusahaan).
  - **JHT (Jaminan Hari Tua)**: 3.70% (Perusahaan) + 2.00% (Karyawan).
  - **JP (Jaminan Pensiun)**: 2.00% (Perusahaan) + 1.00% (Karyawan) dengan Capping Maksimal Gaji (Batas Atas).
- **BPJS Kesehatan**:
  - 4.00% (Ditanggung Perusahaan) + 1.00% (Ditanggung Karyawan) dengan Capping Batas Atas Gaji (Rp 12.000.000,-).

> **Kepatuhan Regulasi PPh 21 TER PMK 168/2023**
> Sistem HRIS wajib memperbarui tabel tarif TER secara otomatis tanpa mengharuskan HR Admin mengubah rumus manual di spreadsheet.

### 3.3 Slip Gaji Terenkripsi & Export File Transfer Bank

Penyelesaian pembayaran gaji dan distribusi slip gaji digital:
- **Bank Transfer Batch File Export**: Menggenerate file transaksi format khusus bank lokal (seperti BCA KlikBisnis, Mandiri MCM, BNI Direct, BRI Corporate) untuk sekali unggah pembayaran gaji massal.
- **Slip Gaji Digital PDF Terenkripsi**: Slip gaji otomatis dikirim ke email karyawan dan Mobile App ESS. PDF dilindungi kata sandi unik (misal: gabungan 6 digit Tanggal Lahir karyawan).
- **Laporan Pajak e-Bupot**: Export data pemotongan PPh 21 format siap impor ke aplikasi e-Bupot 21/26 DJP Online.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Slip gaji tidak dapat dibuka tanpa kata sandi karyawan
- [ ] Sistem mencatat log audit kapan slip gaji dibuka/diunduh oleh karyawan

---

## 4. Modul Manajemen Cuti & Izin

*Pengelolaan kuota cuti tahunan, cuti khusus, aturan prorata, alur persetujuan bertingkat, dan sinkronisasi ke kalender tim.*

### 4.1 Pembuat Kebijakan Cuti & Prorata Otomatis

Flexibilitas penyusunan jenis cuti dan hak cuti karyawan:
- **Jenis Cuti Standar & Khusus**: Cuti Tahunan (12 hari), Cuti Melahirkan (3 bulan / 90 hari), Cuti Menikah (3 hari), Cuti Duka (2 hari), Cuti Khitanan/Baptis (2 hari), Unpaid Leave.
- **Aturan Hak Cuti (Accrual/Prorate Rules)**:
  - **Anniversary Date**: Kuota cuti bertambah 1 hari setiap bulan setelah masa kerja mencapai 1 tahun.
  - **Calendar Year Prorate**: Karyawan baru yang bergabung pertengahan tahun mendapatkan kuota prorata: `(Sisa Bulan Kerja / 12) × Kuota Tahunan`.
- **Carry-Over & Kadaluwarsa Cuti**: Pengaturan batas waktu hangus sisa cuti tahun sebelumnya (misal: maksimal 3 hari sisa cuti dapat dibawa ke tahun depan dan wajib diambil sebelum 31 Maret).

> **Otomasi Potongan Gaji (Unpaid Leave)**
> Setiap pengajuan Izin Tidak Terbayar (Unpaid Leave) yang disetujui akan secara otomatis mengurangi komponen Gaji Pokok/Tunjangan Harian pada periode payroll berjalan.

### 4.2 Alur Persetujuan Bertingkat (Cascading Approval Workflow)

Mekanisme pengajuan dan verifikasi cuti secara transparan:
- **Persetujuan Bertingkat**: Pengajuan Cuti ➔ Atasan Langsung (Level 1) ➔ Head of Department (Level 2) ➔ HR Admin (Final Approval).
- **Delegasi Wewenang (Delegate Approval)**: Jika atasan sedang cuti atau dinas luar, persetujuan dapat dialihkan otomatis ke pengganti sementara.
- **Lampiran Dokumen**: Pengajuan Cuti Sakit atau Cuti Khusus mewajibkan unggah foto Surat Keterangan Dokter atau dokumen pendukung.
- **Shared Team Calendar**: Menampilkan kalender ketersediaan tim agar manajer dapat mencegah penumpukan cuti pada tanggal kritis yang sama.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Notifikasi real-time dikirim via Push Notification Mobile App dan Email
- [ ] Pengajuan cuti otomatis memotong saldo cuti sementara (pending deduction) hingga disetujui atau ditolak

---

## 5. Modul Evaluasi Kinerja Karyawan

*Sistem manajemen kinerja komprehensif mendukung KPI, OKR, 360-Degree Feedback, serta Matriks 9-Box untuk pengembangan talenta.*

### 5.1 Rangkaian Metrik Penilaian (KPI & OKR)

Penyusunan target kerja individual dan organisasi yang terukur:
- **Key Performance Indicators (KPI)**: Penilaian berbasis target kuantitatif (misal: Pencapaian Omzet Sales Rp 1 Miliar, Waktu Pemrosesan Tiket CS < 15 menit).
- **Objectives & Key Results (OKR)**: Penilaian kualitatif yang didukung hasil utama yang dapat diukur secara fleksibel kuartalan/tahunan.
- **Penbobotan Bobot (Weighting)**: HR Admin dapat menetapkan bobot target (misal: KPI Kerja 70% + Kompetensi Perilaku 30% = Total 100%).

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Karyawan dapat memperbarui progres pencapaian target bulanan beserta lampiran bukti pendukung
- [ ] Atasan dapat memberikan catatan bimbingan (coaching notes) secara berkala

### 5.2 Siklus Evaluasi & 360-Degree Feedback

Proses evaluasi menyeluruh tanpa bias:
- **Tahapan Siklus Penilaian**:
  1. **Self-Assessment**: Karyawan menilai dirinya sendiri berdasarkan target yang ditetapkan.
  2. **Manager Review**: Atasan langsung memberikan skor dan umpan balik konstruktif.
  3. **Peer Review (360 Feedback)**: Rekan kerja selevel dan bawahan (jika ada) memberikan masukan anonim atas kompetensi soft skill.
  4. **Calibration Session**: Pertemuan HR dan jajaran Direksi untuk menyelaraskan kurva distribusi nilai kinerja perusahaan.
  5. **Final Sign-off**: Karyawan menyetujui dan menandatangani hasil evaluasi kinerja secara digital.

> **360-Degree Feedback Anonymity**
> Masukan dari rekan kerja selevel disajikan dalam bentuk rata-rata agregat tanpa menampilkan nama reviewer untuk menjaga objektivitas dan kenyamanan tim.

### 5.3 Matriks 9-Box (Potential vs Performance) & Bonus Multiplier

Visualisasi pemetaan talenta perusahaan untuk rencana suksesi dan pengalokasian insentif:
- **Matriks 9-Box**: Membagi karyawan ke dalam 9 kuadran berdasarkan kombinasi Tingkat Kinerja (Rendah, Sedang, Tinggi) dan Tingkat Potensi (Rendah, Sedang, Tinggi).
  - Contoh Kuadran: **Star/High Flyer** (Potensi Tinggi & Kinerja Tinggi), **Core Player** (Potensi Sedang & Kinerja Sedang), **Underperformer** (Potensi Rendah & Kinerja Rendah).
- **Integrasi ke Payroll (Bonus & Increment Multiplier)**:
  - Skor Kinerja 'A' (Sangat Memuaskan): Multiplier Bonus 150% + Rekomendasi Kenaikan Gaji 10-15%.
  - Skor Kinerja 'B' (Memuaskan): Multiplier Bonus 100% + Kenaikan Gaji 5-8%.
  - Skor Kinerja 'C' (Perlu Perbaikan): Multiplier Bonus 0% + Program PIP (Performance Improvement Plan).

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Matriks 9-Box terupdate secara otomatis setelah siklus evaluasi dikunci
- [ ] Integrasi langsung dengan rekomendasi kenaikan gaji di modul Payroll

---

## 6. Modul Manpower Planning & Budgeting (MPP)

*Perencanaan Alokasi Tenaga Kerja, Formulir Pengajuan Tenaga Kerja (FPTK / Job Requisition), Simulasi Budget Overhead, dan Monitoring FTE Variance.*

### 6.1 Visi & Alur Pengajuan Manpower Planning

Modul **Manpower Planning & Budgeting (MPP)** memungkinkan tim Management dan HR untuk merencanakan kebutuhan sumber daya manusia secara terukur, efisien, dan selaras dengan plafon anggaran tahunan perusahaan.

### Alur Kerja Utama MPP & FPTK:
1. **Penyusunan Anggaran MPP Tahunan (Annual MPP Budgeting)**: Head of Department mengajukan proyeksi kebutuhan headcount per kuartal (Q1 - Q4) beserta estimasi grade & rentang gaji.
2. **Evaluasi Plafon & Direct Approval Workflow**: HR Lead dan CFO meninjau dampak anggaran mencakup Gaji Pokok, Tunjangan, BPJS Overhead (±20%), dan Biaya Rekrutmen.
3. **Penerbitan Formulir Pengajuan Tenaga Kerja (FPTK / Job Requisition)**: Ketika ada kebutuhan hiring, Manager menerbitkan FPTK yang dikunci secara otomatis dengan sisa kuota MPP.
4. **Integration with ATS & Payroll**: FPTK yang disetujui langsung membuka lowongan di ATS (Applicant Tracking System) dan memesan alokasi anggaran pada modul Payroll.

> **Kontrol Keuangan & Mitigasi Over-Budget**
> Setiap pengajuan FPTK yang melebihi kuota MPP atau melebihi anggaran yang dialokasikan akan memicu alur persetujuan darurat (Special Exemption) dari CFO dan Direktur Utama.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Dukungan kalkulasi prorata masa kerja berdasarkan kuartal rekrutmen (Q1=12 bln, Q2=9 bln, Q3=6 bln, Q4=3 bln)
- [ ] Auto-calculating Overhead Rate (BPJS Kesehatan & Ketenagakerjaan + Tunjangan Tetap)
- [ ] Notifikasi real-time dan dashboard tracking status FPTK (Draft ➔ Approved ➔ Sourcing ➔ Onboarded)

### 6.2 Indikator & Metrik Evaluasi Manpower

Sistem menyediakan dashboard analitik real-time dengan metrik utama:
- **Full-Time Equivalent (FTE) Ratio**: Mengukur rasio kecukupan beban kerja tim harian.
- **Budget Variance Rate (%)**: Persentase selisih antara realisasi anggaran biaya tenaga kerja vs plafon terencana.
- **Cost per Hire (CPH)**: Total pengeluaran rekrutmen (iklan, headhunter, tes psikotes) dibagi total headcount baru yang berhasil di-onboard.
- **Attrition / Turnover Buffer**: Memperhitungkan proyeksi karyawan resign dalam perhitungan net tambahan tenaga kerja.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Visualisasi chart perbandingan Headcount Terencana vs Realisasi Aktif per Departemen
- [ ] Export laporan analisis varians anggaran MPP ke format Excel/PDF untuk Rapat Direksi

---

## 7. Arsitektur Teknis & Keamanan Data

*Arsitektur cloud-native multi-tenant, keamanan enkripsi data tingkat enterprise, dan keandalan tinggi (SLA 99.9%).*

### 6.1 Tech Stack & Desain Microservices

Infrastruktur aplikasi dibangun menggunakan pendekatan modern yang siap menangani lonjakan beban kerja (traffic spikes) saat jam clock-in masuk kantor dan tanggal gajian:
- **Frontend Layer**: React 19 dengan TypeScript, Tailwind CSS, Vite, dan Motion UI untuk kecepatan rendering antarmuka.
- **Backend API Layer**: Node.js / Express microservices gateway dengan dukungan Asynchronous Background Job Workers (Redis & BullMQ) untuk pemrosesan payroll massal.
- **Database & Storage Layer**: PostgreSQL untuk data transaksional terstruktur (ACID Compliant), Redis Cache untuk session & geofence caching, serta AWS S3 / Cloud Storage terenkripsi untuk foto selfie & slip gaji PDF.
- **Mobile Client**: React Native / Flutter untuk iOS & Android ESS App.

> **Performa Skalabilitas Payroll**
> Penggunaan pemrosesan paralel multi-worker memungkinkan sistem memproses penggajian untuk 10.000 karyawan hanya dalam waktu < 45 detik.

### 6.2 Keamanan Data, RBAC & Kepatuhan GDPR/ISO 27001

Perlindungan data sensitif karyawan (Gaji, NIK, Rekening Bank, Foto Wajah):
- **Role-Based Access Control (RBAC)**: Pembatasan hak akses berbasis peran kustom (Super Admin, HR Payroll, HR Attendance, Dept Manager, Employee).
- **Enkripsi Data**:
  - **Data at Rest**: Enkripsi kolom gaji dan rekening menggunakan algoritma AES-256.
  - **Data in Transit**: Komunikasi API wajib menggunakan HTTPS dengan TLS 1.3.
- **Audit Log Trail**: Mencatat setiap aktivitas manipulasi data (Create, Read, Update, Delete) lengkap dengan Timestamp, User ID, IP Address, dan perubahan nilai data lama vs baru.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Lulus uji ketahanan keamanan (Penetration Testing) standar OWASP Top 10
- [ ] Session timeout otomatis setelah 15 menit inaktivitas pada Web Admin Dashboard

---

## 7. Spesifikasi Database & Schema ERD

*Rancangan struktur tabel basis data relasional sentral untuk menghubungkan Karyawan, Absensi, Cuti, Payroll, dan Kinerja.*

### 7.1 Entity Relationship Diagram (ERD) Core Tables

Database PostgreSQL menggunakan relasi terstruktur dengan foreign keys dan indeks teroptimasi pada kolom pencarian frekuensi tinggi (seperti `employee_id`, `company_id`, dan `created_at`).

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Menggunakan UUID v4 sebagai Primary Key di seluruh tabel transaksional
- [ ] Soft Delete menggunakan kolom `deleted_at` untuk menjaga integritas riwayat arsip data karyawan

---

## 8. Spesifikasi REST API & Webhooks

*Katalog endpoint RESTful API terstandarisasi untuk integrasi aplikasi web, mobile, dan sistem pihak ketiga (ERP/Accounting).*

### 8.1 Arsitektur API & Otentikasi JWT

Seluruh komunikasi endpoint mengandalkan standar RESTful API dengan format respons JSON:
- **Authentication**: JWT (JSON Web Token) dengan Access Token (expired 15 menit) dan Refresh Token (expired 7 hari, HTTP-Only Cookie).
- **Rate Limiting**: Maksimal 100 request/menit per IP untuk mencegah serangan Brute Force & DDoS.

#### Kriteria Penerimaan (Acceptance Criteria):
- [ ] Setiap respons error menyertakan kode error terstandar dan pesan deskriptif dalam Bahasa Indonesia & Inggris

---

## 9. Matriks Regulasi Ketenagakerjaan Indonesia

*Acuan Hukum dan Formula Matematika untuk Kepatuhan Regulasi Ketenagakerjaan & Pajak Republik Indonesia.*

### 9.1 Acuan PPh 21 TER PMK 168/2023 & UU Cipta Kerja

Sistem HRIS menjamin kepatuhan 100% terhadap hukum ketenagakerjaan dan perpajakan di Indonesia:

### 1. Pajak Penghasilan Pasal 21 (PMK 168/2023)
Pajak dihitung berdasarkan Tarif Efektif Rata-rata (TER) bulanan sesuai kategori PTKP:
- **TER A**: TK/0 (PTKP Rp 54.000.000), TK/1 & K/0 (PTKP Rp 58.500.000).
- **TER B**: TK/2 & K/1 (PTKP Rp 63.000.000), TK/3 & K/2 (PTKP Rp 67.500.000).
- **TER C**: K/3 (PTKP Rp 72.000.000).

### 2. BPJS Kesehatan & Ketenagakerjaan
- **BPJS Kesehatan**: Total 5% (4% Perusahaan + 1% Karyawan). Batas Atas Gaji = Rp 12.000.000.
- **BPJS Ketenagakerjaan**:
  - **JHT**: 3.7% Perusahaan + 2% Karyawan.
  - **JP**: 2% Perusahaan + 1% Karyawan (Capping Maksimal Rp 10.042.300 / disesuaikan regulasi terkini).
  - **JKK**: 0.24% - 1.74% Perusahaan.
  - **JKM**: 0.30% Perusahaan.

### 3. Perhitungan Lembur (Permenaker 102/2004)
Upah Sejam = `1/173 × (Gaji Pokok + Tunjangan Tetap)`.

> **Garansi Kepatuhan Hukum (Compliance Guarantee)**
> Sistem menyediakan log rekapitulasi audit perpajakan e-Bupot 21/26 yang siap diunduh dan diimpor langsung ke sistem DJP Online.

---

## 10. Roadmap Peluncuran & Metrik Keberhasilan

*Tahapan rilis fitur (Phase 1 MVP hingga Phase 3 AI Advanced) dan Indikator Kinerja Utama (KPI) produk.*

### 10.1 Jadwal Peluncuran (3 Fase)

Rencana pengembangan berkelanjutan dalam kurun waktu 9 bulan:
- **Fase 1: Core MVP (Bulan 1 - 3)**
  - Core HR Data Karyawan, GPS Geofencing Mobile Attendance, Leave Request Basic, & Basic Payroll Engine dengan PPh 21 TER.
- **Fase 2: Advanced Integrations (Bulan 4 - 6)**
  - Integrasi Mesin Fingerprint Biometrik, Shift Roster Kompleks, Multi-tier Leave Approval, Bank Direct Transfer Export, & Performance KPI Module.
- **Fase 3: AI & HR Analytics (Bulan 7 - 9)**
  - Smart Attendance Anomaly Detection, AI Predictive Attrition / Churn Risk, Automated Salary Benchmark, & 360-degree OKR Performance Calibration.

> **Metrik Keberhasilan Utama (Product Success Metrics)**
> 1. Keakuratan Kalkulasi Payroll > 99.99%
2. Waktu Pemrosesan Payroll < 2 jam per periode
3. Tingkat Adopsi Karyawan (ESS Monthly Active Users) > 95%
4. SLA Uptime Sistem > 99.95%

---

