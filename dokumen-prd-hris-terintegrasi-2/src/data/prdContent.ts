import { PRDSection, UserPersona, APIEndpoint, DatabaseTable } from '../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    role: 'HR Admin / People Ops Lead',
    title: 'Pengelola Operasional SDM Enterprise',
    description: 'Menangani administrasi harian karyawan, pendaftaran karyawan baru, penjadwalan shift, approval cuti/izin, serta pengawasan kepatuhan aturan internal.',
    painPoints: [
      'Rekapitulasi absensi manual memakan waktu 3-5 hari setiap akhir bulan',
      'Human error saat penyesuaian data keterlambatan dan izin tidak terbayar',
      'Pengarsipan dokumen karyawan & laporan kinerja yang tidak tersentralisasi'
    ],
    keyNeeds: [
      'Dashboard absensi real-time dengan alert otomatis',
      'Pengaturan kebijakan cuti, shift, dan lembur secara fleksibel',
      'Persetujuan bertingkat (multi-level approval) dan audit trail'
    ],
    moduleAccess: ['Absensi', 'Payroll (Viewer)', 'Cuti', 'Performance', 'Settings']
  },
  {
    role: 'Payroll Specialist & Finance',
    title: 'Pengelola Penggajian & Perpajakan',
    description: 'Bertanggung jawab atas akurasi kalkulasi gaji, pemotongan PPh 21 TER, BPJS Kesehatan & Ketenagakerjaan, serta distribusi slip gaji dan file transfer bank.',
    painPoints: [
      'Sering ada perubahan formula PPh 21 dan BPJS oleh pemerintah yang rumit dihitung di Excel',
      'Risiko kebocoran data gaji dan komplain slip gaji tidak transparan',
      'Proses kalkulasi lembur & pemotongan absen butuh waktu berhari-hari'
    ],
    keyNeeds: [
      'Payroll Engine otomatis berbasis integrasi data Absensi & Cuti',
      'Auto-calculation PPh 21 TER (PMK 168/2023) dan BPJS Capping',
      'Export format file bank (BCA, Mandiri, BNI) dan Slip Gaji terenkripsi'
    ],
    moduleAccess: ['Payroll', 'Absensi (Report)', 'Cuti (Report)', 'Financial Analytics']
  },
  {
    role: 'Department Manager / Team Lead',
    title: 'Atasan Direct Manager',
    description: 'Memantau kehadiran tim harian, menyetujui pengajuan lembur & cuti, serta melakukan evaluasi kinerja (KPI/OKR) rutin anggota tim.',
    painPoints: [
      'Kesulitan melacak ketersediaan anggota tim harian',
      'Evaluasi kinerja sering kali subjektif tanpa matriks penilaian terukur',
      'Proses persetujuan lembur yang terlambat berakibat pada komplain karyawan'
    ],
    keyNeeds: [
      'Kalender tim & notifikasi persetujuan instan via Mobile/Email',
      'Matriks Evaluasi Kinerja (KPI/OKR & 360 Feedback)',
      'Laporan produktivitas dan jam kerja lembur anggota tim'
    ],
    moduleAccess: ['Absensi (Team)', 'Cuti (Approval)', 'Performance (Rater)']
  },
  {
    role: 'Karyawan (Employee ESS)',
    title: 'Pengguna Employee Self-Service',
    description: 'Melakukan clock-in/out harian via HP, mengajukan cuti/izin/lembur, melihat slip gaji, serta mengisi self-assessment kinerja.',
    painPoints: [
      'Harus antre di mesin fingerprint fisik saat jam masuk kerja',
      'Tidak tahu sisa saldo cuti dan status pengajuan yang menggantung',
      'Slip gaji fisik mudah hilang dan tidak bisa diakses riwayat tahunan'
    ],
    keyNeeds: [
      'Mobile App Absensi GPS Geofencing & Liveness Selfie Check-in',
      'Sisa saldo cuti transparan dan pengajuan izin mandiri',
      'Akses Slip Gaji digital terenkripsi kapan saja'
    ],
    moduleAccess: ['Absensi ESS', 'Cuti ESS', 'Slip Gaji ESS', 'Performance ESS']
  }
];

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: 'overview',
    title: '1. Executive Summary & Visi Sistem',
    badge: 'Core Vision',
    description: 'Spesifikasi tingkat tinggi mengenai tujuan bisnis, ruang lingkup produk, dan dampak strategis implementasi HRIS Terintegrasi.',
    subsections: [
      {
        id: 'overview-vision',
        title: '1.1 Visi & Latar Belakang Produk',
        content: `Aplikasi **Enterprise HRIS Terintegrasi** dirancang untuk mentransformasi operasional Sumber Daya Manusia (SDM) dari proses manual terpisah menjadi platform SaaS berbasis cloud terpadu. Terinspirasi oleh standar industri HRIS enterprise, platform ini menghubungkan **Absensi (Time & Attendance)**, **Management Cuti & Izin**, **Payroll Engine (Penggajian)**, dan **Evaluasi Kinerja (Performance Management)** dalam satu ekosistem data yang sinkron secara real-time.`,
        callout: {
          type: 'info',
          title: 'Target Dampak Bisnis',
          text: 'Mengurangi waktu proses payroll dari 5 hari menjadi kurang dari 2 jam per periode, menekan human error kalkulasi pajak/BPJS hingga 0%, dan meningkatkan kepuasan karyawan (ESS CSAT) di atas 90%.'
        },
        acceptanceCriteria: [
          'Arsitektur Multi-tenant dengan isolasi data antar perusahaan secara aman',
          'Tersedia dalam antarmuka Web Dashboard (Admin & Manager) dan Mobile App (ESS Karyawan)',
          'Sesuai dengan regulasi Ketenagakerjaan Indonesia (UU Cipta Kerja, PPh 21 PMK 168/2023 TER, BPJS Kesehatan & Ketenagakerjaan)'
        ]
      },
      {
        id: 'overview-scope',
        title: '1.2 Ruang Lingkup Integrasi 4 Modul Utama',
        content: `Ekosistem HRIS ini menghilangkan sekat (silo) antar departemen dengan aliran data otomatis:
1. **Absensi ➔ Payroll**: Keterlambatan, ketidakhadiran (alpha), dan jam lembur otomatis mengkalkulasi komponen pemotong atau penambah gaji.
2. **Cuti ➔ Absensi & Payroll**: Cuti terbayar menjaga status hadir, sedangkan Unpaid Leave (cuti tidak terbayar) secara otomatis memotong gaji pokok/tunjangan harian.
3. **Kinerja ➔ Payroll**: Skor evaluasi kinerja (KPI/OKR) menjadi acuan pembagian bonus berkala, insentif, dan kenaikan gaji berkala.
4. **Data Karyawan Sentral (Core HR)**: Seluruh modul mengacu pada Master Data Karyawan (Grade, Jabatan, PTKP, Rekening Bank, Kebijakan Shift).`,
        callout: {
          type: 'tech',
          title: 'Keunggulan Aliran Data (Data Flow Architecture)',
          text: 'Setiap perubahan pada modul Absensi atau Cuti langsung mengkalkulasi ulang secara asinkron (background job worker) pada draft payroll berjalan tanpa membebankan performa sistem.'
        }
      }
    ]
  },
  {
    id: 'absensi',
    title: '2. Modul Absensi & Waktu Kerja',
    badge: 'Time & Attendance',
    description: 'Modul pencatatan kehadiran, geofencing GPS, integrasi mesin biometrik fisik, manajemen shift fleksibel, dan pengajuan lembur.',
    subsections: [
      {
        id: 'absensi-geofence',
        title: '2.1 Clock-In/Out Mobile Geofencing & Liveness Selfie',
        content: `Fitur pencatatan kehadiran mandiri melalui Mobile App ESS Karyawan dengan validasi berlapis:
- **GPS Geofencing**: Karyawan hanya bisa clock-in jika berada dalam radius lokasi kantor/site yang ditentukan (misal: radius 50 meter dari koordinat kantor).
- **Liveness & Face Recognition**: Mengambil foto selfie real-time dengan verifikasi ekspresi wajah/deteksi keaslian (anti-spoofing menggunakan foto atau layar HP lain).
- **Mode Wi-Fi / IP Bounding**: Validasi tambahan berdasarkan IP jaringan Wi-Fi kantor untuk pendaftaran lokasi kerja statis.
- **Mode WFH / Remote Working**: Karyawan luar kantor dapat melakukan check-in dengan mewajibkan isi deskripsi catatan kegiatan dan lokasi GPS fleksibel sesuai persetujuan atasan.`,
        callout: {
          type: 'regulation',
          title: 'Pencegahan Kecurangan Absensi',
          text: 'Sistem secara otomatis menolak lokasi yang terdeteksi menggunakan Fake GPS / Mock Location API pada smartphone Android & iOS.'
        },
        acceptanceCriteria: [
          'Kecepatan respons verifikasi wajah & lokasi < 1.5 detik',
          'Riwayat clock-in menyimpan data latitude, longitude, foto selfie, ID perangkat, dan alamat IP',
          'Peringatan otomatis dikirimkan ke atasan jika karyawan clock-in di luar area kantor yang diizinkan'
        ]
      },
      {
        id: 'absensi-hardware',
        title: '2.2 Integrasi Mesin Fingerprint & Biometrik Fisik',
        content: `Dukungan sinkronisasi otomatis dengan mesin absensi fisik (seperti ZK Teco, Hikvision, Solution) melalui:
- **Cloud Webhook Receiver**: Mesin absensi fisik mengirimkan log presensi secara real-time ke endpoint REST API HRIS saat jari/wajah terscan.
- **Auto-matching ID Karyawan**: Menghubungkan ID PIN mesin dengan NIK Karyawan di database sentral.
- **Offline Buffer Fallback**: Jika koneksi internet di lokasi cabang terputus, log disimpan lokal di mesin dan disinkronkan otomatis saat online kembali.`,
        acceptanceCriteria: [
          'Dukungan integrasi multi-cabang tanpa perlu menyewa IP Publik statis di setiap lokasi',
          'Dukungan pemicu penggabungan data (deduplikasi) jika karyawan absen di hp dan mesin fingerprint pada hari yang sama'
        ]
      },
      {
        id: 'absensi-shift-overtime',
        title: '2.3 Pengaturan Shift Roster & Pengajuan Lembur (Overtime)',
        content: `Manajemen waktu kerja fleksibel untuk industri Manufaktur, Retail, Hospitality, maupun Kantor Pusat:
- **Multi-Shift Roster**: Mendukung shift reguler, shift malam, shift bergilir (3 rotasi), dan jadwal kerja dinamis.
- **Aturan Lembur Permenaker No. 102/2004**:
  - Hari Kerja Biasa: Jam pertama dihitung 1.5x upah sejam, jam kedua dan seterusnya dihitung 2x upah sejam.
  - Hari Libur Resmi / Istirahat: Jam 1-7 dihitung 2x, jam ke-8 dihitung 3x, jam ke-9 & 10 dihitung 4x upah sejam.
- **Digital SPL (Surat Perintah Lembur)**: Karyawan mengajukan estimasi jam lembur via Mobile ESS ➔ Disetujui Atasan ➔ Karyawan melakukan Clock-In Lembur ➔ Sistem mengkalkulasi durasi aktual vs estimasi.`,
        callout: {
          type: 'regulation',
          title: 'Formula Upah Lembur Sejam (Permenaker)',
          text: 'Upah Sejam = 1/173 × (Gaji Pokok + Tunjangan Tetap Bulan Berjalan).'
        }
      }
    ]
  },
  {
    id: 'payroll',
    title: '3. Modul Payroll Engine Terintegrasi',
    badge: 'Automated Payroll',
    description: 'Kalkulasi penggajian otomatis terhubung dengan data kehadiran, potongan PPh 21 TER terbaru, BPJS Kesehatan & Ketenagakerjaan, serta distribusi file bank.',
    subsections: [
      {
        id: 'payroll-engine',
        title: '3.1 Otomasi Kalkulasi Penggajian',
        content: `Payroll Engine memproses penggajian ratusan/ribuan karyawan hanya dalam hitungan detik dengan formula yang dapat disesuaikan (custom salary components):
- **Komponen Penambah (Earnings)**: Gaji Pokok, Tunjangan Jabatan, Tunjangan Makan/Malam, Tunjangan Transport, Upah Lembur, Bonus Kinerja, Insentif Penjualan, THR.
- **Komponen Pemotong (Deductions)**: Potongan Keterlambatan (Late Penalty), Potongan Mangkir/Alpha, Potongan Unpaid Leave, Kasbon Karyawan, Iuran BPJS (Karyawan), PPh 21.
- **Kalkulasi Prorata (Prorated Salary)**: Untuk karyawan yang masuk di tengah bulan (New Hire) atau resign sebelum akhir bulan berdasarkan jumlah hari kerja efektif.`,
        acceptanceCriteria: [
          'Sistem mengunci (lock) data absensi periode payroll saat proses kalkulasi dimulai',
          'Tersedia preview draf payroll sebelum dieksekusi oleh Tim Finance',
          'Mendukung simulasi perkiraan pengeluaran gaji per departemen'
        ]
      },
      {
        id: 'payroll-pajak-bpjs',
        title: '3.2 PPh 21 TER (PMK 168/2023) & BPJS Capping Engine',
        content: `Mesin kalkulasi perpajakan dan jaminan sosial sesuai aturan hukum Republik Indonesia:
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
  - 4.00% (Ditanggung Perusahaan) + 1.00% (Ditanggung Karyawan) dengan Capping Batas Atas Gaji (Rp 12.000.000,-).`,
        callout: {
          type: 'regulation',
          title: 'Kepatuhan Regulasi PPh 21 TER PMK 168/2023',
          text: 'Sistem HRIS wajib memperbarui tabel tarif TER secara otomatis tanpa mengharuskan HR Admin mengubah rumus manual di spreadsheet.'
        }
      },
      {
        id: 'payroll-disbursement',
        title: '3.3 Slip Gaji Terenkripsi & Export File Transfer Bank',
        content: `Penyelesaian pembayaran gaji dan distribusi slip gaji digital:
- **Bank Transfer Batch File Export**: Menggenerate file transaksi format khusus bank lokal (seperti BCA KlikBisnis, Mandiri MCM, BNI Direct, BRI Corporate) untuk sekali unggah pembayaran gaji massal.
- **Slip Gaji Digital PDF Terenkripsi**: Slip gaji otomatis dikirim ke email karyawan dan Mobile App ESS. PDF dilindungi kata sandi unik (misal: gabungan 6 digit Tanggal Lahir karyawan).
- **Laporan Pajak e-Bupot**: Export data pemotongan PPh 21 format siap impor ke aplikasi e-Bupot 21/26 DJP Online.`,
        acceptanceCriteria: [
          'Slip gaji tidak dapat dibuka tanpa kata sandi karyawan',
          'Sistem mencatat log audit kapan slip gaji dibuka/diunduh oleh karyawan'
        ]
      }
    ]
  },
  {
    id: 'cuti',
    title: '4. Modul Manajemen Cuti & Izin',
    badge: 'Leave & Absence',
    description: 'Pengelolaan kuota cuti tahunan, cuti khusus, aturan prorata, alur persetujuan bertingkat, dan sinkronisasi ke kalender tim.',
    subsections: [
      {
        id: 'cuti-policy',
        title: '4.1 Pembuat Kebijakan Cuti & Prorata Otomatis',
        content: `Flexibilitas penyusunan jenis cuti dan hak cuti karyawan:
- **Jenis Cuti Standar & Khusus**: Cuti Tahunan (12 hari), Cuti Melahirkan (3 bulan / 90 hari), Cuti Menikah (3 hari), Cuti Duka (2 hari), Cuti Khitanan/Baptis (2 hari), Unpaid Leave.
- **Aturan Hak Cuti (Accrual/Prorate Rules)**:
  - **Anniversary Date**: Kuota cuti bertambah 1 hari setiap bulan setelah masa kerja mencapai 1 tahun.
  - **Calendar Year Prorate**: Karyawan baru yang bergabung pertengahan tahun mendapatkan kuota prorata: \`(Sisa Bulan Kerja / 12) × Kuota Tahunan\`.
- **Carry-Over & Kadaluwarsa Cuti**: Pengaturan batas waktu hangus sisa cuti tahun sebelumnya (misal: maksimal 3 hari sisa cuti dapat dibawa ke tahun depan dan wajib diambil sebelum 31 Maret).`,
        callout: {
          type: 'info',
          title: 'Otomasi Potongan Gaji (Unpaid Leave)',
          text: 'Setiap pengajuan Izin Tidak Terbayar (Unpaid Leave) yang disetujui akan secara otomatis mengurangi komponen Gaji Pokok/Tunjangan Harian pada periode payroll berjalan.'
        }
      },
      {
        id: 'cuti-workflow',
        title: '4.2 Alur Persetujuan Bertingkat (Cascading Approval Workflow)',
        content: `Mekanisme pengajuan dan verifikasi cuti secara transparan:
- **Persetujuan Bertingkat**: Pengajuan Cuti ➔ Atasan Langsung (Level 1) ➔ Head of Department (Level 2) ➔ HR Admin (Final Approval).
- **Delegasi Wewenang (Delegate Approval)**: Jika atasan sedang cuti atau dinas luar, persetujuan dapat dialihkan otomatis ke pengganti sementara.
- **Lampiran Dokumen**: Pengajuan Cuti Sakit atau Cuti Khusus mewajibkan unggah foto Surat Keterangan Dokter atau dokumen pendukung.
- **Shared Team Calendar**: Menampilkan kalender ketersediaan tim agar manajer dapat mencegah penumpukan cuti pada tanggal kritis yang sama.`,
        acceptanceCriteria: [
          'Notifikasi real-time dikirim via Push Notification Mobile App dan Email',
          'Pengajuan cuti otomatis memotong saldo cuti sementara (pending deduction) hingga disetujui atau ditolak'
        ]
      }
    ]
  },
  {
    id: 'kinerja',
    title: '5. Modul Evaluasi Kinerja Karyawan',
    badge: 'Performance Review',
    description: 'Sistem manajemen kinerja komprehensif mendukung KPI, OKR, 360-Degree Feedback, serta Matriks 9-Box untuk pengembangan talenta.',
    subsections: [
      {
        id: 'kinerja-framework',
        title: '5.1 Rangkaian Metrik Penilaian (KPI & OKR)',
        content: `Penyusunan target kerja individual dan organisasi yang terukur:
- **Key Performance Indicators (KPI)**: Penilaian berbasis target kuantitatif (misal: Pencapaian Omzet Sales Rp 1 Miliar, Waktu Pemrosesan Tiket CS < 15 menit).
- **Objectives & Key Results (OKR)**: Penilaian kualitatif yang didukung hasil utama yang dapat diukur secara fleksibel kuartalan/tahunan.
- **Penbobotan Bobot (Weighting)**: HR Admin dapat menetapkan bobot target (misal: KPI Kerja 70% + Kompetensi Perilaku 30% = Total 100%).`,
        acceptanceCriteria: [
          'Karyawan dapat memperbarui progres pencapaian target bulanan beserta lampiran bukti pendukung',
          'Atasan dapat memberikan catatan bimbingan (coaching notes) secara berkala'
        ]
      },
      {
        id: 'kinerja-360-cycle',
        title: '5.2 Siklus Evaluasi & 360-Degree Feedback',
        content: `Proses evaluasi menyeluruh tanpa bias:
- **Tahapan Siklus Penilaian**:
  1. **Self-Assessment**: Karyawan menilai dirinya sendiri berdasarkan target yang ditetapkan.
  2. **Manager Review**: Atasan langsung memberikan skor dan umpan balik konstruktif.
  3. **Peer Review (360 Feedback)**: Rekan kerja selevel dan bawahan (jika ada) memberikan masukan anonim atas kompetensi soft skill.
  4. **Calibration Session**: Pertemuan HR dan jajaran Direksi untuk menyelaraskan kurva distribusi nilai kinerja perusahaan.
  5. **Final Sign-off**: Karyawan menyetujui dan menandatangani hasil evaluasi kinerja secara digital.`,
        callout: {
          type: 'info',
          title: '360-Degree Feedback Anonymity',
          text: 'Masukan dari rekan kerja selevel disajikan dalam bentuk rata-rata agregat tanpa menampilkan nama reviewer untuk menjaga objektivitas dan kenyamanan tim.'
        }
      },
      {
        id: 'kinerja-ninebox',
        title: '5.3 Matriks 9-Box (Potential vs Performance) & Bonus Multiplier',
        content: `Visualisasi pemetaan talenta perusahaan untuk rencana suksesi dan pengalokasian insentif:
- **Matriks 9-Box**: Membagi karyawan ke dalam 9 kuadran berdasarkan kombinasi Tingkat Kinerja (Rendah, Sedang, Tinggi) dan Tingkat Potensi (Rendah, Sedang, Tinggi).
  - Contoh Kuadran: **Star/High Flyer** (Potensi Tinggi & Kinerja Tinggi), **Core Player** (Potensi Sedang & Kinerja Sedang), **Underperformer** (Potensi Rendah & Kinerja Rendah).
- **Integrasi ke Payroll (Bonus & Increment Multiplier)**:
  - Skor Kinerja 'A' (Sangat Memuaskan): Multiplier Bonus 150% + Rekomendasi Kenaikan Gaji 10-15%.
  - Skor Kinerja 'B' (Memuaskan): Multiplier Bonus 100% + Kenaikan Gaji 5-8%.
  - Skor Kinerja 'C' (Perlu Perbaikan): Multiplier Bonus 0% + Program PIP (Performance Improvement Plan).`,
        acceptanceCriteria: [
          'Matriks 9-Box terupdate secara otomatis setelah siklus evaluasi dikunci',
          'Integrasi langsung dengan rekomendasi kenaikan gaji di modul Payroll'
        ]
      }
    ]
  },
  {
    id: 'manpower',
    title: '6. Modul Manpower Planning & Budgeting (MPP)',
    badge: 'Strategic HR',
    description: 'Perencanaan Alokasi Tenaga Kerja, Formulir Pengajuan Tenaga Kerja (FPTK / Job Requisition), Simulasi Budget Overhead, dan Monitoring FTE Variance.',
    subsections: [
      {
        id: 'mpp-overview',
        title: '6.1 Visi & Alur Pengajuan Manpower Planning',
        content: `Modul **Manpower Planning & Budgeting (MPP)** memungkinkan tim Management dan HR untuk merencanakan kebutuhan sumber daya manusia secara terukur, efisien, dan selaras dengan plafon anggaran tahunan perusahaan.

### Alur Kerja Utama MPP & FPTK:
1. **Penyusunan Anggaran MPP Tahunan (Annual MPP Budgeting)**: Head of Department mengajukan proyeksi kebutuhan headcount per kuartal (Q1 - Q4) beserta estimasi grade & rentang gaji.
2. **Evaluasi Plafon & Direct Approval Workflow**: HR Lead dan CFO meninjau dampak anggaran mencakup Gaji Pokok, Tunjangan, BPJS Overhead (±20%), dan Biaya Rekrutmen.
3. **Penerbitan Formulir Pengajuan Tenaga Kerja (FPTK / Job Requisition)**: Ketika ada kebutuhan hiring, Manager menerbitkan FPTK yang dikunci secara otomatis dengan sisa kuota MPP.
4. **Integration with ATS & Payroll**: FPTK yang disetujui langsung membuka lowongan di ATS (Applicant Tracking System) dan memesan alokasi anggaran pada modul Payroll.`,
        callout: {
          type: 'info',
          title: 'Kontrol Keuangan & Mitigasi Over-Budget',
          text: 'Setiap pengajuan FPTK yang melebihi kuota MPP atau melebihi anggaran yang dialokasikan akan memicu alur persetujuan darurat (Special Exemption) dari CFO dan Direktur Utama.'
        },
        acceptanceCriteria: [
          'Dukungan kalkulasi prorata masa kerja berdasarkan kuartal rekrutmen (Q1=12 bln, Q2=9 bln, Q3=6 bln, Q4=3 bln)',
          'Auto-calculating Overhead Rate (BPJS Kesehatan & Ketenagakerjaan + Tunjangan Tetap)',
          'Notifikasi real-time dan dashboard tracking status FPTK (Draft ➔ Approved ➔ Sourcing ➔ Onboarded)'
        ]
      },
      {
        id: 'mpp-metrics',
        title: '6.2 Indikator & Metrik Evaluasi Manpower',
        content: `Sistem menyediakan dashboard analitik real-time dengan metrik utama:
- **Full-Time Equivalent (FTE) Ratio**: Mengukur rasio kecukupan beban kerja tim harian.
- **Budget Variance Rate (%)**: Persentase selisih antara realisasi anggaran biaya tenaga kerja vs plafon terencana.
- **Cost per Hire (CPH)**: Total pengeluaran rekrutmen (iklan, headhunter, tes psikotes) dibagi total headcount baru yang berhasil di-onboard.
- **Attrition / Turnover Buffer**: Memperhitungkan proyeksi karyawan resign dalam perhitungan net tambahan tenaga kerja.`,
        acceptanceCriteria: [
          'Visualisasi chart perbandingan Headcount Terencana vs Realisasi Aktif per Departemen',
          'Export laporan analisis varians anggaran MPP ke format Excel/PDF untuk Rapat Direksi'
        ]
      }
    ]
  },
  {
    id: 'arsitektur',
    title: '7. Arsitektur Teknis & Keamanan Data',
    badge: 'System Architecture',
    description: 'Arsitektur cloud-native multi-tenant, keamanan enkripsi data tingkat enterprise, dan keandalan tinggi (SLA 99.9%).',
    subsections: [
      {
        id: 'arsitektur-tech-stack',
        title: '6.1 Tech Stack & Desain Microservices',
        content: `Infrastruktur aplikasi dibangun menggunakan pendekatan modern yang siap menangani lonjakan beban kerja (traffic spikes) saat jam clock-in masuk kantor dan tanggal gajian:
- **Frontend Layer**: React 19 dengan TypeScript, Tailwind CSS, Vite, dan Motion UI untuk kecepatan rendering antarmuka.
- **Backend API Layer**: Node.js / Express microservices gateway dengan dukungan Asynchronous Background Job Workers (Redis & BullMQ) untuk pemrosesan payroll massal.
- **Database & Storage Layer**: PostgreSQL untuk data transaksional terstruktur (ACID Compliant), Redis Cache untuk session & geofence caching, serta AWS S3 / Cloud Storage terenkripsi untuk foto selfie & slip gaji PDF.
- **Mobile Client**: React Native / Flutter untuk iOS & Android ESS App.`,
        callout: {
          type: 'tech',
          title: 'Performa Skalabilitas Payroll',
          text: 'Penggunaan pemrosesan paralel multi-worker memungkinkan sistem memproses penggajian untuk 10.000 karyawan hanya dalam waktu < 45 detik.'
        }
      },
      {
        id: 'arsitektur-security',
        title: '6.2 Keamanan Data, RBAC & Kepatuhan GDPR/ISO 27001',
        content: `Perlindungan data sensitif karyawan (Gaji, NIK, Rekening Bank, Foto Wajah):
- **Role-Based Access Control (RBAC)**: Pembatasan hak akses berbasis peran kustom (Super Admin, HR Payroll, HR Attendance, Dept Manager, Employee).
- **Enkripsi Data**:
  - **Data at Rest**: Enkripsi kolom gaji dan rekening menggunakan algoritma AES-256.
  - **Data in Transit**: Komunikasi API wajib menggunakan HTTPS dengan TLS 1.3.
- **Audit Log Trail**: Mencatat setiap aktivitas manipulasi data (Create, Read, Update, Delete) lengkap dengan Timestamp, User ID, IP Address, dan perubahan nilai data lama vs baru.`,
        acceptanceCriteria: [
          'Lulus uji ketahanan keamanan (Penetration Testing) standar OWASP Top 10',
          'Session timeout otomatis setelah 15 menit inaktivitas pada Web Admin Dashboard'
        ]
      }
    ]
  },
  {
    id: 'database',
    title: '7. Spesifikasi Database & Schema ERD',
    badge: 'Data Model',
    description: 'Rancangan struktur tabel basis data relasional sentral untuk menghubungkan Karyawan, Absensi, Cuti, Payroll, dan Kinerja.',
    subsections: [
      {
        id: 'db-schema-overview',
        title: '7.1 Entity Relationship Diagram (ERD) Core Tables',
        content: `Database PostgreSQL menggunakan relasi terstruktur dengan foreign keys dan indeks teroptimasi pada kolom pencarian frekuensi tinggi (seperti \`employee_id\`, \`company_id\`, dan \`created_at\`).`,
        acceptanceCriteria: [
          'Menggunakan UUID v4 sebagai Primary Key di seluruh tabel transaksional',
          'Soft Delete menggunakan kolom `deleted_at` untuk menjaga integritas riwayat arsip data karyawan'
        ]
      }
    ]
  },
  {
    id: 'api',
    title: '8. Spesifikasi REST API & Webhooks',
    badge: 'API Specs',
    description: 'Katalog endpoint RESTful API terstandarisasi untuk integrasi aplikasi web, mobile, dan sistem pihak ketiga (ERP/Accounting).',
    subsections: [
      {
        id: 'api-overview',
        title: '8.1 Arsitektur API & Otentikasi JWT',
        content: `Seluruh komunikasi endpoint mengandalkan standar RESTful API dengan format respons JSON:
- **Authentication**: JWT (JSON Web Token) dengan Access Token (expired 15 menit) dan Refresh Token (expired 7 hari, HTTP-Only Cookie).
- **Rate Limiting**: Maksimal 100 request/menit per IP untuk mencegah serangan Brute Force & DDoS.`,
        acceptanceCriteria: [
          'Setiap respons error menyertakan kode error terstandar dan pesan deskriptif dalam Bahasa Indonesia & Inggris'
        ]
      }
    ]
  },
  {
    id: 'regulasi',
    title: '9. Matriks Regulasi Ketenagakerjaan Indonesia',
    badge: 'Compliance Matrix',
    description: 'Acuan Hukum dan Formula Matematika untuk Kepatuhan Regulasi Ketenagakerjaan & Pajak Republik Indonesia.',
    subsections: [
      {
        id: 'regulasi-tax',
        title: '9.1 Acuan PPh 21 TER PMK 168/2023 & UU Cipta Kerja',
        content: `Sistem HRIS menjamin kepatuhan 100% terhadap hukum ketenagakerjaan dan perpajakan di Indonesia:

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
Upah Sejam = \`1/173 × (Gaji Pokok + Tunjangan Tetap)\`.`,
        callout: {
          type: 'regulation',
          title: 'Garansi Kepatuhan Hukum (Compliance Guarantee)',
          text: 'Sistem menyediakan log rekapitulasi audit perpajakan e-Bupot 21/26 yang siap diunduh dan diimpor langsung ke sistem DJP Online.'
        }
      }
    ]
  },
  {
    id: 'roadmap',
    title: '10. Roadmap Peluncuran & Metrik Keberhasilan',
    badge: 'Implementation & KPI',
    description: 'Tahapan rilis fitur (Phase 1 MVP hingga Phase 3 AI Advanced) dan Indikator Kinerja Utama (KPI) produk.',
    subsections: [
      {
        id: 'roadmap-phases',
        title: '10.1 Jadwal Peluncuran (3 Fase)',
        content: `Rencana pengembangan berkelanjutan dalam kurun waktu 9 bulan:
- **Fase 1: Core MVP (Bulan 1 - 3)**
  - Core HR Data Karyawan, GPS Geofencing Mobile Attendance, Leave Request Basic, & Basic Payroll Engine dengan PPh 21 TER.
- **Fase 2: Advanced Integrations (Bulan 4 - 6)**
  - Integrasi Mesin Fingerprint Biometrik, Shift Roster Kompleks, Multi-tier Leave Approval, Bank Direct Transfer Export, & Performance KPI Module.
- **Fase 3: AI & HR Analytics (Bulan 7 - 9)**
  - Smart Attendance Anomaly Detection, AI Predictive Attrition / Churn Risk, Automated Salary Benchmark, & 360-degree OKR Performance Calibration.`,
        callout: {
          type: 'info',
          title: 'Metrik Keberhasilan Utama (Product Success Metrics)',
          text: '1. Keakuratan Kalkulasi Payroll > 99.99%\n2. Waktu Pemrosesan Payroll < 2 jam per periode\n3. Tingkat Adopsi Karyawan (ESS Monthly Active Users) > 95%\n4. SLA Uptime Sistem > 99.95%'
        }
      }
    ]
  }
];

export const DATABASE_TABLES: DatabaseTable[] = [
  {
    name: 'employees',
    description: 'Master data karyawan lengkap dengan informasi personal, pekerjaan, dan rekening bank.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Unik Karyawan' },
      { name: 'company_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Perusahaan (Multi-tenant)' },
      { name: 'nik', type: 'VARCHAR(30)', nullable: false, description: 'Nomor Induk Karyawan' },
      { name: 'full_name', type: 'VARCHAR(150)', nullable: false, description: 'Nama Lengkap Karyawan' },
      { name: 'email', type: 'VARCHAR(100)', nullable: false, description: 'Email Kerja / Login' },
      { name: 'department_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Departemen' },
      { name: 'position', type: 'VARCHAR(100)', nullable: false, description: 'Jabatan Karyawan' },
      { name: 'join_date', type: 'DATE', nullable: false, description: 'Tanggal Masuk Kerja' },
      { name: 'ptkp_status', type: 'VARCHAR(10)', nullable: false, description: 'Status PTKP (TK/0, K/1, dll)' },
      { name: 'basic_salary', type: 'NUMERIC(15,2)', nullable: false, description: 'Gaji Pokok Bulanan (Enkripsi AES-256)' },
      { name: 'bank_account_no', type: 'VARCHAR(50)', nullable: true, description: 'Nomor Rekening Bank (Enkripsi AES-256)' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Waktu Dibuat' }
    ]
  },
  {
    name: 'attendance_logs',
    description: 'Catatan transaksi presensi masuk dan keluar harian karyawan.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Unik Transaksi Absen' },
      { name: 'employee_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Karyawan' },
      { name: 'clock_in', type: 'TIMESTAMP', nullable: false, description: 'Waktu Clock-In' },
      { name: 'clock_out', type: 'TIMESTAMP', nullable: true, description: 'Waktu Clock-Out' },
      { name: 'clock_in_latitude', type: 'DECIMAL(10,8)', nullable: false, description: 'Koordinat Latitude Check-in' },
      { name: 'clock_in_longitude', type: 'DECIMAL(11,8)', nullable: false, description: 'Koordinat Longitude Check-in' },
      { name: 'is_late', type: 'BOOLEAN', nullable: false, description: 'Flag Keterlambatan' },
      { name: 'late_minutes', type: 'INTEGER', nullable: false, description: 'Jumlah Menit Keterlambatan' },
      { name: 'selfie_image_url', type: 'TEXT', nullable: true, description: 'URL Foto Selfie Check-in (S3)' },
      { name: 'source', type: 'VARCHAR(30)', nullable: false, description: 'Sumber Absen (MOBILE_GPS / FINGERPRINT)' }
    ]
  },
  {
    name: 'leave_requests',
    description: 'Transaksi pengajuan cuti dan izin karyawan beserta status approval.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Pengajuan Cuti' },
      { name: 'employee_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Karyawan' },
      { name: 'leave_type', type: 'VARCHAR(50)', nullable: false, description: 'Jenis Cuti (ANNUAL / SICK / UNPAID)' },
      { name: 'start_date', type: 'DATE', nullable: false, description: 'Tanggal Mulai Cuti' },
      { name: 'end_date', type: 'DATE', nullable: false, description: 'Tanggal Selesai Cuti' },
      { name: 'total_days', type: 'NUMERIC(4,1)', nullable: false, description: 'Jumlah Hari Cuti' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: 'Status (PENDING / APPROVED / REJECTED)' },
      { name: 'approver_id', type: 'UUID', isForeign: true, nullable: true, description: 'ID Atasan Penyetuju' },
      { name: 'reason', type: 'TEXT', nullable: true, description: 'Alasan Cuti' }
    ]
  },
  {
    name: 'payroll_runs',
    description: 'Riwayat eksekusi periode penggajian perusahaan.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Periode Payroll' },
      { name: 'company_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Perusahaan' },
      { name: 'period_month', type: 'INTEGER', nullable: false, description: 'Bulan Payroll (1-12)' },
      { name: 'period_year', type: 'INTEGER', nullable: false, description: 'Tahun Payroll' },
      { name: 'total_gross_payout', type: 'NUMERIC(18,2)', nullable: false, description: 'Total Gaji Kotor Perusahaan' },
      { name: 'total_net_payout', type: 'NUMERIC(18,2)', nullable: false, description: 'Total Gaji Bersih Dibayarkan' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: 'Status (DRAFT / PROCESSING / PAID / LOCKED)' },
      { name: 'executed_by', type: 'UUID', isForeign: true, nullable: false, description: 'ID HR Administrator' }
    ]
  },
  {
    name: 'performance_reviews',
    description: 'Hasil evaluasi kinerja karyawan per periode penilaian.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Penilaian Kinerja' },
      { name: 'employee_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Karyawan' },
      { name: 'period', type: 'VARCHAR(20)', nullable: false, description: 'Periode (Q1_2026, ANNUAL_2026)' },
      { name: 'kpi_score', type: 'NUMERIC(5,2)', nullable: false, description: 'Skor Pencapaian KPI (0-100)' },
      { name: 'competency_score', type: 'NUMERIC(5,2)', nullable: false, description: 'Skor Kompetensi Perilaku (0-100)' },
      { name: 'final_rating', type: 'VARCHAR(5)', nullable: false, description: 'Rating Akhir (A / B / C / D)' },
      { name: 'nine_box_quadrant', type: 'VARCHAR(50)', nullable: false, description: 'Kuadran 9-Box (High Flyer, Core, dll)' },
      { name: 'bonus_multiplier', type: 'NUMERIC(4,2)', nullable: false, description: 'Pengali Bonus Kinerja (misal 1.25)' }
    ]
  },
  {
    name: 'mpp_plans',
    description: 'Master data rencana anggaran dan kuota tenaga kerja tahunan per departemen.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Unik MPP' },
      { name: 'company_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Perusahaan' },
      { name: 'department_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Departemen' },
      { name: 'year', type: 'INT', nullable: false, description: 'Tahun Anggaran (misal 2026)' },
      { name: 'current_headcount', type: 'INT', nullable: false, description: 'Jumlah Karyawan Eksisting' },
      { name: 'target_addition', type: 'INT', nullable: false, description: 'Target Tambahan Karyawan Baru' },
      { name: 'allocated_budget', type: 'NUMERIC(15,2)', nullable: false, description: 'Plafon Anggaran yang Disediakan' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, description: 'Status (DRAFT / APPROVED / REJECTED)' }
    ]
  },
  {
    name: 'job_requisitions',
    description: 'Data pengajuan rekrutmen tenaga kerja (FPTK) berbasis alokasi kuota MPP.',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'ID Unik FPTK' },
      { name: 'mpp_plan_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Plan MPP' },
      { name: 'title', type: 'VARCHAR(150)', nullable: false, description: 'Judul Posisi Pekerjaan' },
      { name: 'department_id', type: 'UUID', isForeign: true, nullable: false, description: 'ID Departemen' },
      { name: 'target_quarter', type: 'VARCHAR(5)', nullable: false, description: 'Target Kuartal (Q1/Q2/Q3/Q4)' },
      { name: 'estimated_salary', type: 'NUMERIC(15,2)', nullable: false, description: 'Estimasi Gaji Pokok' },
      { name: 'approval_status', type: 'VARCHAR(20)', nullable: false, description: 'Status Approval (PENDING / APPROVED)' }
    ]
  }
];

export const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: 'POST',
    endpoint: '/api/v1/attendance/clock-in',
    summary: 'Melakukan clock-in absensi karyawan via Mobile GPS & Selfie',
    module: 'Absensi',
    authRequired: true,
    requestBodyExample: `{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "selfie_image_base64": "data:image/jpeg;base64,...",
  "device_id": "iPhone14,2-XYZ"
}`,
    responseExample: `{
  "status": "success",
  "message": "Berhasil Clock-In",
  "data": {
    "timestamp": "2026-07-29T08:02:15Z",
    "is_late": false,
    "location_matched": true
  }
}`
  },
  {
    method: 'GET',
    endpoint: '/api/v1/payroll/calculate-preview',
    summary: 'Kalkulasi preview gaji karyawan termasuk PPh 21 TER dan BPJS',
    module: 'Payroll',
    authRequired: true,
    responseExample: `{
  "employee_id": "emp-001",
  "basic_salary": 12000000,
  "allowances": 2500000,
  "gross_salary": 14500000,
  "bpjs_deductions": {
    "jht_employee": 240000,
    "jp_employee": 100423,
    "health_employee": 120000
  },
  "pph21_ter": {
    "category": "A",
    "rate_percentage": 6.0,
    "tax_amount": 870000
  },
  "net_take_home_pay": 13169577
}`
  },
  {
    method: 'POST',
    endpoint: '/api/v1/leave/request',
    summary: 'Mengajukan permohonan cuti baru dari ESS Mobile',
    module: 'Cuti',
    authRequired: true,
    requestBodyExample: `{
  "leave_type": "ANNUAL",
  "start_date": "2026-08-10",
  "end_date": "2026-08-12",
  "reason": "Liburan Keluarga"
}`,
    responseExample: `{
  "leave_id": "leave-8891",
  "status": "PENDING_APPROVAL",
  "next_approver": "Budi Santoso (Manager IT)"
}`
  },
  {
    method: 'GET',
    endpoint: '/api/v1/performance/nine-box-matrix',
    summary: 'Mendapatkan data pemetaan 9-Box kinerja karyawan per departemen',
    module: 'Kinerja',
    authRequired: true,
    responseExample: `{
  "department": "Engineering",
  "period": "2026-Q2",
  "distribution": {
    "star_player": 8,
    "core_performer": 24,
    "underperformer": 2
  }
}`
  },
  {
    method: 'GET',
    endpoint: '/api/v1/mpp/budget-summary',
    summary: 'Mendapatkan ringkasan alokasi budget dan realisasi headcount MPP per departemen',
    module: 'Manpower',
    authRequired: true,
    responseExample: `{
  "department": "Engineering",
  "year": 2026,
  "current_headcount": 15,
  "target_additions": 4,
  "total_budget_allocated": 600000000,
  "projected_cost": 540000000,
  "budget_variance": 60000000,
  "is_within_budget": true
}`
  },
  {
    method: 'POST',
    endpoint: '/api/v1/mpp/requisitions',
    summary: 'Mengajukan Formulir Pengajuan Tenaga Kerja (FPTK) baru',
    module: 'Manpower',
    authRequired: true,
    requestBodyExample: `{
  "mpp_plan_id": "mpp-2026-eng",
  "title": "Senior Backend Engineer",
  "target_quarter": "Q2",
  "requested_headcount": 2,
  "estimated_basic_salary": 15000000
}`,
    responseExample: `{
  "requisition_id": "fptk-9902",
  "status": "APPROVED_AUTO",
  "quota_remaining": 2,
  "message": "FPTK Disetujui Otomatis (Dalam Kuota MPP)"
}`
  }
];
