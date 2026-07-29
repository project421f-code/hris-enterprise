# STRUKTUR APLIKASI & DRAFT DATABASE SCHEMA
## Enterprise HRIS Terintegrasi (Supabase & GitHub)

Dokumen ini menjelaskan struktur folder repositori monorepo, rancangan tabel PostgreSQL (Supabase DDL), Row Level Security (RLS) policies, dan desain Edge Functions yang disesuaikan untuk implementasi Enterprise HRIS.

---

## 1. Rekomendasi Framework & Teknologi

Berdasarkan kesederhanaan, kecepatan pengembangan, dan integrasi yang erat dengan Supabase:
- **Web Dashboard (Admin & Manager):** **Vite + React 19 + TypeScript + Tailwind CSS**. Mengapa? Supabase menyediakan Client SDK JavaScript/TypeScript yang tangguh, sehingga web dashboard dapat langsung berinteraksi dengan database (dilindungi oleh RLS) tanpa overhead server Next.js.
- **Mobile ESS (Karyawan):** **React Native (Expo) + TypeScript**. Mengapa? Mempermudah berbagi tipe data (*shared types*) dari monorepo, performa tinggi untuk akses kamera (Face Recognition/Selfie Liveness) dan GPS Geolocation, serta build yang cepat.

---

## 2. Struktur Repositori (Monorepo Layout)

Struktur folder di bawah ini diatur sebagai monorepo berbasis pnpm/npm workspaces:

```text
├── .github/
│   └── workflows/
│       ├── frontend-deploy.yml      # Deploy dashboard ke GitHub Pages / Vercel
│       └── supabase-deploy.yml      # CI/CD sinkronisasi migrasi & Edge Functions
├── supabase/
│   ├── config.toml                  # Konfigurasi Supabase CLI
│   ├── seed.sql                     # Seed data awal (e.g. Master PTKP, Tabel Tarif TER)
│   ├── migrations/                  # Migrasi SQL PostgreSQL
│   │   ├── 20260729000000_init_schema.sql
│   │   └── 20260729000001_rls_policies.sql
│   └── functions/                   # Supabase Edge Functions (Deno TS)
│       ├── biometric-webhook/       # Parsing push log dari mesin fingerprint
│       ├── clock-in-liveness/       # Verifikasi GPS, IP, & Liveness Selfie
│       └── calculate-payroll/       # Background Job kalkulasi payroll massal
├── apps/
│   ├── web-dashboard/               # React 19 + Vite (Admin / Finance / Manager)
│   │   ├── src/
│   │   │   ├── components/          # Komponen UI (Buttons, Cards, Modals)
│   │   │   ├── hooks/               # Custom Hooks (useAuth, useAttendance)
│   │   │   ├── pages/               # Tampilan modul (Absensi, Payroll, Cuti, Performance, MPP)
│   │   │   ├── services/            # Client Supabase API integrations
│   │   │   └── types/               # Type definitions frontend
│   └── mobile-ess/                  # React Native / Expo (ESS Karyawan)
│       ├── src/
│       │   ├── screens/             # Screen Check-in, Request Cuti, Slip Gaji, KPI
│       │   ├── components/          # Camera Preview, Map/GPS components
│       │   └── services/            # Supabase JS SDK client
└── packages/
    └── types/                       # Shared TypeScript Interfaces (untuk Web & Mobile)
        └── index.ts
```

---

## 3. Skema Basis Data Supabase (PostgreSQL DDL)

Di bawah ini adalah rancangan SQL DDL lengkap yang akan diletakkan di `supabase/migrations/20260729000000_init_schema.sql`.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Perusahaan (Multi-tenant Root)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Tabel Departemen
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Tabel Master Karyawan
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Terhubung dengan auth.users milik Supabase
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    nik VARCHAR(30) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(30),
    position VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'employee' NOT NULL, -- employee, manager, hr_attendance, hr_payroll, super_admin
    status VARCHAR(20) DEFAULT 'active' NOT NULL, -- active, inactive, suspended
    join_date DATE NOT NULL,
    resign_date DATE,
    ptkp_status VARCHAR(10) NOT NULL, -- TK/0, TK/1, K/0, K/1, K/2, K/3, dll
    basic_salary NUMERIC(15, 2) NOT NULL, -- Dalam produksi, gunakan enkripsi tingkat kolom
    bank_name VARCHAR(50),
    bank_account_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_role CHECK (role IN ('employee', 'manager', 'hr_attendance', 'hr_payroll', 'super_admin')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Tambahkan manager_id di departemen setelah tabel employee terbuat
ALTER TABLE public.departments ADD COLUMN manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- 4. Tabel Jam Shift Kerja
CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- Shift Pagi, Shift Malam, dll.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Tabel Log Absensi Karyawan
CREATE TABLE public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    clock_in_latitude NUMERIC(10, 8),
    clock_in_longitude NUMERIC(11, 8),
    clock_out_latitude NUMERIC(10, 8),
    clock_out_longitude NUMERIC(11, 8),
    is_late BOOLEAN DEFAULT false NOT NULL,
    late_minutes INTEGER DEFAULT 0 NOT NULL,
    selfie_image_url TEXT, -- Link ke Supabase Storage bucket 'selfies'
    source VARCHAR(30) DEFAULT 'MOBILE_GPS' NOT NULL, -- MOBILE_GPS, FINGERPRINT, WFH_REMOTE
    wfh_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Surat Perintah Lembur (SPL / Overtime Request)
CREATE TABLE public.overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    estimated_hours NUMERIC(4, 2) NOT NULL,
    actual_hours NUMERIC(4, 2),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED, REJECTED
    approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_overtime_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- 7. Kebijakan Cuti
CREATE TABLE public.leave_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- Cuti Tahunan, Cuti Hamil, dll.
    total_days NUMERIC(4, 1) NOT NULL,
    accrual_type VARCHAR(20) DEFAULT 'YEARLY_FRONTLOAD' NOT NULL, -- MONTHLY_ACCRUAL, YEARLY_FRONTLOAD
    carry_over_limit INTEGER DEFAULT 0 NOT NULL,
    carry_over_expiry_months INTEGER DEFAULT 3 NOT NULL -- 3 bulan (s/d 31 Maret)
);

-- 8. Pengajuan Cuti & Izin
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    leave_policy_id UUID REFERENCES public.leave_policies(id) ON DELETE RESTRICT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    attachment_url TEXT, -- Link surat sakit dari dokter
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED_L1, APPROVED_L2, APPROVED, REJECTED
    approver_l1_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    approver_l2_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    final_approver_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED_L1', 'APPROVED_L2', 'APPROVED', 'REJECTED'))
);

-- 9. Periode Payroll (Payroll Runs)
CREATE TABLE public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL, -- 1 s/d 12
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, PROCESSING, LOCKED, PAID
    executed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_payroll_run_status CHECK (status IN ('DRAFT', 'PROCESSING', 'LOCKED', 'PAID'))
);

-- 10. Detail Rincian Payroll / Slip Gaji
CREATE TABLE public.payroll_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE RESTRICT NOT NULL,
    basic_salary NUMERIC(15, 2) NOT NULL,
    allowances JSONB DEFAULT '{}'::jsonb NOT NULL, -- { "transport": 500000, "meal": 500000, "overtime": 1200000 }
    deductions JSONB DEFAULT '{}'::jsonb NOT NULL, -- { "late_penalty": 50000, "unpaid_leave": 400000 }
    overtime_pay NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bonus NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_health_company NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_health_employee NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_ketenagakerjaan_company NUMERIC(15, 2) DEFAULT 0 NOT NULL, -- JHT + JKK + JKM + JP (Persen Perusahaan)
    bpjs_ketenagakerjaan_employee NUMERIC(15, 2) DEFAULT 0 NOT NULL, -- JHT + JP (Persen Karyawan)
    pph21_tax NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    pph21_category VARCHAR(5) NOT NULL, -- TER A, TER B, TER C
    pph21_rate NUMERIC(5, 2) NOT NULL, -- Persentase Tarif TER
    gross_salary NUMERIC(15, 2) NOT NULL,
    net_salary NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Penilaian Kinerja Karyawan
CREATE TABLE public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    period VARCHAR(20) NOT NULL, -- e.g. 2026-Q2, 2026-ANNUAL
    kpi_score NUMERIC(5, 2) NOT NULL,
    competency_score NUMERIC(5, 2) NOT NULL,
    final_rating VARCHAR(5) NOT NULL, -- A, B, C, D
    nine_box_quadrant VARCHAR(50) NOT NULL, -- Star/High Flyer, Core Player, Underperformer
    bonus_multiplier NUMERIC(4, 2) DEFAULT 1.00 NOT NULL,
    self_review TEXT,
    manager_review TEXT,
    peer_review_avg NUMERIC(5, 2),
    status VARCHAR(20) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, SELF_ASSESSMENT, MANAGER_REVIEW, CALIBRATION, SIGNED_OFF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_perf_status CHECK (status IN ('DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'SIGNED_OFF'))
);

-- 12. Anggaran MPP (Manpower Planning)
CREATE TABLE public.mpp_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    allocated_budget NUMERIC(15, 2) NOT NULL,
    current_headcount INTEGER DEFAULT 0 NOT NULL,
    target_additions INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_mpp_status CHECK (status IN ('DRAFT', 'APPROVED', 'REJECTED'))
);

-- 13. Formulir Pengajuan Tenaga Kerja (FPTK / Job Requisition)
CREATE TABLE public.job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mpp_plan_id UUID REFERENCES public.mpp_plans(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    target_quarter VARCHAR(5) NOT NULL, -- Q1, Q2, Q3, Q4
    estimated_salary NUMERIC(15, 2) NOT NULL,
    recruitment_cost NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    status VARCHAR(30) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, SOURCING, ONBOARDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_requisition_status CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SOURCING', 'ONBOARDED'))
);

-- 14. Tabel Audit Logs ( GDPR & ISO 27001 Compliance )
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID, -- auth.uid()
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create optimized index
CREATE INDEX idx_emp_company ON public.employees(company_id);
CREATE INDEX idx_emp_auth ON public.employees(auth_user_id);
CREATE INDEX idx_att_emp_date ON public.attendance_logs(employee_id, created_at);
CREATE INDEX idx_leave_emp ON public.leave_requests(employee_id);
CREATE INDEX idx_payroll_run ON public.payroll_details(payroll_run_id);
```

---

## 4. Keamanan & Row Level Security (RLS)

Kebijakan RLS memastikan isolasi data multi-tenant (antar perusahaan) dan pembatasan hak akses berbasis peran (role-based access control).
Berikut adalah isi dari file `supabase/migrations/20260729000001_rls_policies.sql`.

```sql
-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpp_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Fungsi pembantu untuk mengambil data karyawan yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_employee()
RETURNS public.employees AS $$
DECLARE
    emp public.employees;
BEGIN
    SELECT * INTO emp 
    FROM public.employees 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1;
    RETURN emp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Kebijakan untuk Tabel employees
-- Karyawan hanya bisa melihat biodata mereka sendiri.
-- HR & Super Admin dapat melihat dan mengedit semua data karyawan satu perusahaan.
CREATE POLICY employee_select_own ON public.employees
    FOR SELECT
    USING (auth_user_id = auth.uid());

CREATE POLICY hr_admin_all_employees ON public.employees
    FOR ALL
    USING (
        company_id = (SELECT company_id FROM public.employees WHERE auth_user_id = auth.uid())
        AND (SELECT role FROM public.employees WHERE auth_user_id = auth.uid()) IN ('hr_payroll', 'hr_attendance', 'super_admin')
    );

-- 2. Kebijakan untuk Tabel attendance_logs
-- Karyawan hanya dapat melihat dan menambah log absen mereka sendiri.
-- HR Attendance & Manager (untuk bawahannya) dapat melihat seluruh absensi.
CREATE POLICY employee_own_attendance ON public.attendance_logs
    FOR SELECT
    USING (employee_id = (SELECT id FROM public.employees WHERE auth_user_id = auth.uid()));

CREATE POLICY employee_insert_own_attendance ON public.attendance_logs
    FOR INSERT
    WITH CHECK (employee_id = (SELECT id FROM public.employees WHERE auth_user_id = auth.uid()));

CREATE POLICY hr_attendance_all ON public.attendance_logs
    FOR ALL
    USING (
        (SELECT role FROM public.employees WHERE auth_user_id = auth.uid()) IN ('hr_attendance', 'super_admin')
    );

-- 3. Kebijakan untuk Tabel payroll_details (Payslips)
-- Keamanan ketat: Hanya pemilik slip gaji dan HR Payroll / Super Admin yang dapat membukanya.
CREATE POLICY employee_view_own_payslip ON public.payroll_details
    FOR SELECT
    USING (employee_id = (SELECT id FROM public.employees WHERE auth_user_id = auth.uid()));

CREATE POLICY hr_payroll_manage_payslips ON public.payroll_details
    FOR ALL
    USING (
        (SELECT role FROM public.employees WHERE auth_user_id = auth.uid()) IN ('hr_payroll', 'super_admin')
    );
```

---

## 5. Supabase Edge Functions (Deno TypeScript)

Sesuai permintaan Anda, kita akan merancang **Edge Function khusus** untuk melakukan parsing log mesin absensi fingerprint secara langsung di Supabase.

### 5.1 Biometric Webhook Parser (`supabase/functions/biometric-webhook/index.ts`)
Fungsi ini dipicu saat mesin fingerprint fisik (yang terhubung ke cloud/internet) mengirimkan data kehadiran via POST.

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const payload = await req.json()

    // MOCK PARSING payload berdasarkan format standar SDK ZKTeco/Solution:
    // Format payload biasanya: { pin: "10293", timestamp: "2026-07-29 08:00:00", device_sn: "AZK12345" }
    const pin = payload.pin
    const timestampStr = payload.timestamp
    const deviceSn = payload.device_sn

    // 1. Cari NIK Karyawan berdasarkan PIN Fingerprint (di tabel employee/mappings)
    // Untuk mempermudah, kita asumsikan PIN dipetakan ke NIK Karyawan
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, company_id')
      .eq('nik', pin)
      .eq('status', 'active')
      .single()

    if (empError || !employee) {
      console.error(`Karyawan dengan PIN ${pin} tidak ditemukan.`);
      return new Response(JSON.stringify({ error: 'Karyawan tidak terdaftar' }), { status: 404 })
    }

    // 2. Tentukan apakah log ini adalah Clock-In atau Clock-Out
    // Kita lakukan pencarian data absen hari ini untuk karyawan bersangkutan
    const today = new Date(timestampStr).toISOString().split('T')[0]
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('employee_id', employee.id)
      .gte('clock_in', `${today}T00:00:00Z`)
      .lte('clock_in', `${today}T23:59:59Z`)
      .single()

    if (existingLog) {
      // Jika sudah ada Clock-In hari ini, catat sebagai Clock-Out
      await supabase
        .from('attendance_logs')
        .update({
          clock_out: new Date(timestampStr).toISOString(),
          source: 'FINGERPRINT'
        })
        .eq('id', existingLog.id)
    } else {
      // Jika belum ada log hari ini, catat sebagai Clock-In
      await supabase
        .from('attendance_logs')
        .insert({
          employee_id: employee.id,
          clock_in: new Date(timestampStr).toISOString(),
          source: 'FINGERPRINT',
          is_late: false, // Tambahkan logika pengecekan keterlambatan terhadap jam shift
          late_minutes: 0
        })
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
```

---

## 6. GitHub Actions CI/CD Pipeline

Untuk deployment otomatis, kita akan meletakkan script workflow di direktori `.github/workflows/supabase-deploy.yml`:

```yaml
name: Deploy Supabase

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase Project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }} -p ${{ secrets.SUPABASE_DB_PASSWORD }}

      - name: Deploy Database Migrations
        run: supabase db push

      - name: Deploy Edge Functions
        run: supabase functions deploy --all
```

---

## 7. Cara Menjalankan Secara Lokal (Local Development)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```
2. **Inisialisasi Project Supabase:**
   ```bash
   supabase init
   ```
3. **Mulai Layanan Docker Supabase Lokal:**
   ```bash
   supabase start
   ```
   *Supabase akan berjalan di http://localhost:54321 dan menyediakan instance PostgreSQL lokal di port 54322.*
4. **Jalankan Migrasi:**
   ```bash
   supabase db reset
   ```
   *Ini akan menjalankan semua file SQL di folder `supabase/migrations` secara berurutan dan mengaplikasikan schema serta RLS.*
5. **Jalankan Edge Functions Secara Lokal:**
   ```bash
   supabase functions serve
   ```
