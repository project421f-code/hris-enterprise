# 🏗️ HRIS Enterprise — Blueprint Aplikasi & Panduan Reusable

Dokumen ini adalah cetak biru lengkap struktur aplikasi **HRIS Enterprise Suite**. 
Gunakan sebagai template untuk membuat aplikasi React + Supabase baru dengan arsitektur, UI/UX, dan pola kode yang sama.

---

## 📁 1. Struktur Folder

```
project-root/
├── .github/workflows/         # GitHub Actions CI/CD
│   ├── deploy-pages.yml       # Auto-deploy ke GitHub Pages
│   └── supabase-deploy.yml    # Deploy migrations & edge functions
│
├── dokumen-prd-hris-terintegrasi-2/   # ← DIREKTORI APLIKASI UTAMA
│   ├── public/                # Static assets (favicon, dll)
│   ├── src/
│   │   ├── components/        # Komponen UI reusable
│   │   │   ├── Layout/        # Layout & navigasi
│   │   │   │   ├── DashboardLayout.tsx   # Layout utama (sidebar + header + outlet)
│   │   │   │   └── Sidebar.tsx           # Sidebar navigasi
│   │   │   ├── Simulators/    # Simulator interaktif (opsional)
│   │   │   └── ...            # Komponen umum lainnya
│   │   │
│   │   ├── contexts/          # React Context providers
│   │   │   └── AuthContext.tsx # Auth global (login, role, company scoping)
│   │   │
│   │   ├── hooks/             # Custom hooks (data fetching)
│   │   │   ├── useAttendance.ts
│   │   │   ├── useDepartments.ts
│   │   │   ├── useEmployees.ts
│   │   │   ├── useLeave.ts
│   │   │   ├── useManpower.ts
│   │   │   ├── usePayroll.ts
│   │   │   ├── usePerformance.ts
│   │   │   └── useShifts.ts
│   │   │
│   │   ├── lib/               # Library config
│   │   │   └── supabaseClient.ts  # Supabase client instance
│   │   │
│   │   ├── pages/             # Halaman aplikasi per modul
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Employees/
│   │   │   ├── Departments/
│   │   │   ├── Attendance/
│   │   │   ├── Leave/
│   │   │   ├── Payroll/
│   │   │   ├── Performance/
│   │   │   └── Manpower/
│   │   │
│   │   ├── data/              # Data statis / konfigurasi
│   │   │   └── prdContent.ts
│   │   │
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── App.tsx            # Root component + routing
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   │
│   ├── index.html             # Vite entry HTML
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript config
│   └── package.json           # Dependencies
│
├── supabase/                  # Supabase backend (shared)
│   ├── functions/             # Edge Functions
│   ├── migrations/            # Database migrations
│   └── seed.sql               # Seed data
│
├── docs/                      # Build output untuk GitHub Pages
├── .github/                   # GitHub config
├── .gitignore
└── BLUEPRINT.md               # ← Dokumen ini
```

---

## 🧱 2. Arsitektur Routing

### Struktur Router (App.tsx)

```
Routes
├── /login                     → <Login /> (tanpa layout)
├── /prd                       → <PRDViewer /> (tanpa layout, dokumentasi)
├── <DashboardLayout>          ← Layout dengan Sidebar + Header
│   ├── /dashboard             → Dashboard utama (stats + quick actions)
│   ├── /employees             → EmployeeList
│   ├── /employees/new         → EmployeeForm
│   ├── /employees/:id         → EmployeeDetail
│   ├── /employees/:id/edit    → EmployeeForm (edit mode)
│   ├── /departments           → DepartmentList
│   ├── /attendance            → AttendanceDashboard
│   ├── /attendance/logs       → AttendanceLogs
│   ├── /attendance/shifts     → ShiftManagement
│   ├── /leave                 → LeaveDashboard
│   ├── /leave/requests        → LeaveRequestList
│   ├── /leave/new             → LeaveRequestForm
│   ├── /leave/policies        → LeavePolicies
│   ├── /payroll               → PayrollDashboard
│   ├── /payroll/runs          → PayrollRunList
│   ├── /payroll/runs/new      → PayrollDashboard (simulator)
│   ├── /payroll/runs/:id      → PayrollRunDetail
│   ├── /payroll/simulator     → PayrollSimulator
│   ├── /performance           → PerformanceDashboard
│   ├── /performance/reviews   → PerformanceReviewList
│   ├── /performance/new       → PerformanceReviewForm
│   ├── /performance/matrix    → NineBoxMatrix
│   ├── /manpower              → ManpowerDashboard
│   ├── /manpower/plans        → MPPPlanList
│   ├── /manpower/plans/new    → MPPPlanForm
│   ├── /manpower/fptk         → FPTKList
│   └── /manpower/fptk/new     → FPTKForm
└── *                          → Redirect ke /login
```

### Layout per-modul (pola halaman CRUD)

Setiap modul mengikuti pola halaman yang konsisten:

```
pages/<ModuleName>/
├── <ModuleName>Dashboard.tsx   # Dashboard: stats, ringkasan, quick links
├── <ModuleName>List.tsx        # List: daftar data, filter, search
├── <ModuleName>Form.tsx        # Form: create/edit data
└── [Optional] <Detail>.tsx     # Detail: view detail data
```

---

## 🎨 3. UI/UX Design System

### 3.1 Color Palette

| Role | Warna | Tailwind Class | Hex |
|------|-------|----------------|-----|
| **Background** | Dark | `bg-[#050505]` | `#050505` |
| **Card bg** | Dark grey | `bg-[#0f0f0f]` | `#0f0f0f` |
| **Card border** | Border | `border-[#1a1a1a]` | `#1a1a1a` |
| **Text primary** | White | `text-white` | `#ffffff` |
| **Text secondary** | Light grey | `text-gray-300` | `#d1d5db` |
| **Text muted** | Dim grey | `text-gray-500` | `#6b7280` |
| **Input bg** | Input dark | `bg-[#121212]` | `#121212` |
| **Input border** | Input border | `border-[#262626]` | `#262626` |
| **Hover bg** | Hover | `hover:bg-[#181818]` | `#181818` |

### 3.2 Accent Colors (per Modul)

| Modul | Warna | Tailwind |
|-------|-------|----------|
| **Dashboard** | Blue | `from-blue-600 to-indigo-600` |
| **Karyawan** | Indigo | `from-indigo-600 to-purple-600` |
| **Absensi** | Amber | `from-amber-600 to-orange-600` |
| **Cuti** | Teal | `from-teal-600 to-emerald-600` |
| **Payroll** | Rose/Emerald | `from-rose-600 to-pink-600` |
| **Kinerja** | Purple | `from-purple-600 to-violet-600` |
| **MPP** | Emerald | `from-emerald-600 to-teal-600` |

### 3.3 Komponen UI Pattern

#### Card Component (paling sering dipakai)
```tsx
<div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-5">
  {/* konten */}
</div>
```

#### Stat Card (dashboard stats)
```tsx
<div className="p-3.5 rounded-2xl border bg-[color]-950/30 border-[color]-800/30">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white mt-0.5">{value}</p>
    </div>
    <Icon className="w-5 h-5 text-[color]-400" />
  </div>
</div>
```

#### Form Input
```tsx
<input type="text"
  className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs placeholder-gray-600" />
```

#### Select Dropdown
```tsx
<select className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-white text-xs">
  <option value="">Pilih opsi</option>
</select>
```

#### Primary Button
```tsx
<button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-500 hover:to-indigo-500 transition-all">
  Aksi
</button>
```

#### Status Badge
```tsx
const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    PENDING: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    DRAFT: 'bg-slate-950/60 text-slate-400 border-slate-800/50',
    REJECTED: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
  };
  return map[s] || 'bg-gray-900 text-gray-400 border-gray-700';
};

// Usage:
<span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${statusBadge(status)}`}>
  {status}
</span>
```

#### List Item (Row)
```tsx
<div className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] p-4 hover:border-[#2a2a2a] transition-all">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
        {initial}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title} <span className="text-gray-500 font-normal">• {subtitle}</span></p>
        <p className="text-xs text-gray-400">{detail}</p>
      </div>
    </div>
    <StatusBadge status={status} />
  </div>
</div>
```

#### Filter Button Group
```tsx
{['all', 'ACTIVE', 'PENDING'].map(s => (
  <button key={s} onClick={() => setFilter(s)}
    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
      filter === s ? 'bg-white text-black font-bold' : 'bg-[#121212] text-gray-400 border border-[#262626]'
    }`}>
    {s === 'all' ? 'Semua' : s}
  </button>
))}
```

#### Back Link
```tsx
<Link to="/module" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
  <ArrowLeft className="w-4 h-4" /> Kembali
</Link>
```

#### Loading State
```tsx
if (loading) return (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
  </div>
);
```

#### Empty State
```tsx
<div className="p-12 text-center bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a]">
  <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
  <p className="text-xs text-gray-500">Belum ada data</p>
</div>
```

#### Quick Link Card
```tsx
<Link to="/path" className="p-3.5 bg-[#0f0f0f] rounded-xl border border-[#1a1a1a] hover:border-blue-800/50 transition-all flex items-center justify-between group">
  <div className="flex items-center gap-3">
    <Icon className="w-4 h-4 text-blue-400" />
    <span className="text-xs text-gray-300">Label</span>
  </div>
  <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
</Link>
```

### 3.4 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (fixed left)    │  Header Bar (sticky top)      │
│  ┌───────────────────┐   │  ┌──────────────────────────┐ │
│  │ Logo + Title      │   │  │ Title    Date     🟢    │ │
│  ├───────────────────┤   │  └──────────────────────────┘ │
│  │ • Dashboard       │   │                               │
│  │ • Karyawan        │   │  Main Content Area             │
│  │ • Departemen      │   │  ┌──────────────────────────┐ │
│  ├───────────────────┤   │  │                          │ │
│  │ • Absensi         │   │  │   <Outlet />             │ │
│  │ • Cuti & Izin     │   │  │   (page content)         │ │
│  │ • Payroll         │   │  │                          │ │
│  │ • Kinerja         │   │  └──────────────────────────┘ │
│  │ • MPP             │   │                               │
│  ├───────────────────┤   │                               │
│  │ User info + Logout│   │                               │
│  └───────────────────┘   └───────────────────────────────┘
```

---

## 🔌 4. Data Flow Patterns

### 4.1 Supabase Client
```tsx
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
```

### 4.2 Custom Hook Pattern (standar untuk semua modul)

```tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function useSomeData() {
  const { employeeCompanyId } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('table_name').select('*');
      
      // Company scoping
      if (employeeCompanyId) {
        query = query.eq('company_id', employeeCompanyId);
      }
      
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setData(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeCompanyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = async (payload: any) => {
    try {
      const { error } = await supabase.from('table_name').insert(payload);
      if (error) throw error;
      await fetchData();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { data, loading, error, create, refetch: fetchData };
}
```

### 4.3 Auth Context (wajib)

`AuthContext.tsx` menyediakan:
- `user` — Supabase User object
- `session` — Supabase Session
- `loading` — loading state
- `employeeRole` — role dari tabel employees (super_admin / hr_payroll / manager / employee)
- `employeeCompanyId` — company_id untuk scoping data
- `employeeId` — employee_id untuk relasi data
- `signIn(email, password)` — login
- `signUp(email, password, fullName)` — signup + panggil Edge Function handle-signup
- `signOut()` — logout

### 4.4 Company Scoping (paling penting!)

Semua hook WAJIB memfilter data berdasarkan `employeeCompanyId`:

```tsx
// ✅ BENAR - semua hook harus seperti ini:
let query = supabase.from('table_name').select('*');
if (employeeCompanyId) {
  query = query.eq('company_id', employeeCompanyId);
}

// Untuk tabel yang tidak punya company_id langsung, gunakan join:
let query = supabase
  .from('child_table')
  .select('*, parent_table!inner(company_id)')
  .eq('parent_table.company_id', employeeCompanyId);
```

### 4.5 Format Rupiah (reusable utility)

```tsx
const formatRp = (v: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(v);

const formatNumber = (v: number) => new Intl.NumberFormat('id-ID').format(v);

const monthName = (m: number) =>
  ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][m - 1] || '';
```

---

## 🧩 5. Cara Membuat Modul Baru

Template step-by-step untuk menambah modul baru:

### Step 1: Database Migration
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_new_module.sql
CREATE TABLE IF NOT EXISTS public.new_module (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- + RLS policies
```

### Step 2: Deploy migration
```bash
supabase db push
```

### Step 3: Buat Hook
```tsx
// src/hooks/useNewModule.ts
export function useNewModule() { /* lihat pola di atas */ }
export interface NewModuleData { /* type definitions */ }
```

### Step 4: Buat Halaman
```
src/pages/NewModule/
├── NewModuleDashboard.tsx
├── NewModuleList.tsx
├── NewModuleForm.tsx
```

### Step 5: Update App.tsx (routing)
```tsx
import { NewModuleDashboard } from './pages/NewModule/NewModuleDashboard';
// ...
<Route path="/new-module" element={<NewModuleDashboard />} />
<Route path="/new-module/list" element={<NewModuleList />} />
<Route path="/new-module/new" element={<NewModuleForm />} />
```

### Step 6: Update Sidebar.tsx
```tsx
const navModules = [
  // ... existing modules
  { to: '/new-module', icon: YourIcon, label: 'Modul Baru' },
];
```

---

## ☁️ 6. Deployment Setup

### GitHub Pages (via GitHub Actions)

File: `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
    paths:
      - 'dokumen-prd-hris-terintegrasi-2/**'
      - '.github/workflows/deploy-pages.yml'
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: dokumen-prd-hris-terintegrasi-2
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: 'dokumen-prd-hris-terintegrasi-2/package-lock.json'
      - run: npm ci
      - run: npx vite build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Environment Variables (wajib di .env)

```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

---

## 📦 7. Dependencies Utama

| Package | Kegunaan |
|---------|----------|
| `react` `react-dom` | UI Framework |
| `react-router-dom` | Routing SPA |
| `@supabase/supabase-js` | Backend database + auth |
| `lucide-react` | Icon library (400+ icons) |
| `tailwindcss` | CSS Utility Framework |
| `@tailwindcss/vite` | Tailwind Vite plugin |
| `vite` | Build tool |
| `typescript` | Type safety |

---

## 🏁 8. Quick Start untuk Project Baru

```bash
# 1. Clone template ini
git clone https://github.com/project421f-code/hris-enterprise.git project-baru
cd project-baru

# 2. Install dependencies
cd dokumen-prd-hris-terintegrasi-2
npm install

# 3. Setup environment
cp .env.example .env
# Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

# 4. Setup database
cd ..
supabase link --project-ref [project-ref]
supabase db push

# 5. Jalankan development
cd dokumen-prd-hris-terintegrasi-2
npm run dev
```

---

## ✅ Checklist Membuat Aplikasi Baru

- [ ] Clone repo template ini
- [ ] Buat project Supabase baru
- [ ] Setup `.env` dengan credentials Supabase
- [ ] Hapus modul yang tidak diperlukan (pages, hooks, routes)
- [ ] Ganti nama, logo, branding di Sidebar.tsx
- [ ] Ubah warna theme di tailwind config
- [ ] Buat database migration untuk fitur baru
- [ ] Buat hook + pages untuk modul baru
- [ ] Update App.tsx routing
- [ ] Build & test
- [ ] Push ke GitHub (auto-deploy via Actions)
