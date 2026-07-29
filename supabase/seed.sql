-- ============================================================
-- SEED DATA: Enterprise HRIS Terintegrasi
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. COMPANY DEMO
INSERT INTO public.companies (name, code)
SELECT 'PT Teknologi Maju Indonesia', 'TMI'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE code = 'TMI');

-- 2. DEPARTEMEN (gunakan company_id yang sudah ada)
INSERT INTO public.departments (company_id, name)
SELECT c.id, d.name
FROM public.companies c
CROSS JOIN (VALUES
  ('Teknologi Informasi'),
  ('Sumber Daya Manusia'),
  ('Keuangan & Akuntansi'),
  ('Marketing & Sales'),
  ('Operasional')
) AS d(name)
WHERE c.code = 'TMI'
AND NOT EXISTS (
  SELECT 1 FROM public.departments de
  WHERE de.company_id = c.id AND de.name = d.name
);

-- 3. KARYAWAN DEMO
INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Teknologi Informasi' LIMIT 1),
  'ADM001', 'Admin HRIS', 'admin@tmi.co.id', '081234567890',
  'System Administrator', 'super_admin', 'active', '2024-01-01', 'K/3', 25000000, 'Bank Mandiri', '1234567890'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'ADM001');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Sumber Daya Manusia' LIMIT 1),
  'HR001', 'Siti Rahayu', 'siti@tmi.co.id', '081234567891',
  'HR Manager', 'hr_payroll', 'active', '2024-01-15', 'K/2', 18000000, 'BCA', '1234567891'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'HR001');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Teknologi Informasi' LIMIT 1),
  'IT001', 'Budi Santoso', 'budi@tmi.co.id', '081234567892',
  'Senior Software Engineer', 'manager', 'active', '2024-02-01', 'K/1', 15000000, 'BNI', '1234567892'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'IT001');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Teknologi Informasi' LIMIT 1),
  'IT002', 'Andi Pratama', 'andi@tmi.co.id', '081234567893',
  'Software Engineer', 'employee', 'active', '2024-03-01', 'TK/0', 12000000, 'BCA', '1234567893'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'IT002');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Keuangan & Akuntansi' LIMIT 1),
  'FIN001', 'Dewi Lestari', 'dewi@tmi.co.id', '081234567894',
  'Finance Manager', 'manager', 'active', '2024-01-20', 'K/2', 20000000, 'Mandiri', '1234567894'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'FIN001');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Marketing & Sales' LIMIT 1),
  'MKT001', 'Rina Wijaya', 'rina@tmi.co.id', '081234567895',
  'Marketing Lead', 'manager', 'active', '2024-02-15', 'TK/1', 14000000, 'BNI', '1234567895'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'MKT001');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Operasional' LIMIT 1),
  'OPS001', 'Agus Hidayat', 'agus@tmi.co.id', '081234567896',
  'Operational Staff', 'employee', 'active', '2024-04-01', 'K/0', 8000000, 'BRI', '1234567896'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'OPS001');

INSERT INTO public.employees (company_id, department_id, nik, full_name, email, phone, position, role, status, join_date, ptkp_status, basic_salary, bank_name, bank_account_no)
SELECT 
  c.id,
  (SELECT id FROM public.departments WHERE company_id = c.id AND name = 'Operasional' LIMIT 1),
  'OPS002', 'Citra Dewi', 'citra@tmi.co.id', '081234567897',
  'Operational Staff', 'employee', 'active', '2024-05-01', 'TK/0', 7500000, 'BCA', '1234567897'
FROM public.companies c WHERE c.code = 'TMI'
AND NOT EXISTS (SELECT 1 FROM public.employees WHERE nik = 'OPS002');

-- 4. SET MANAGER DEPARTEMEN (update setelah employee dibuat)
UPDATE public.departments d
SET manager_id = e.id
FROM public.employees e, public.companies c
WHERE c.code = 'TMI'
AND d.company_id = c.id
AND d.name = 'Sumber Daya Manusia'
AND e.nik = 'HR001';

UPDATE public.departments d
SET manager_id = e.id
FROM public.employees e, public.companies c
WHERE c.code = 'TMI'
AND d.company_id = c.id
AND d.name = 'Teknologi Informasi'
AND e.nik = 'IT001';

UPDATE public.departments d
SET manager_id = e.id
FROM public.employees e, public.companies c
WHERE c.code = 'TMI'
AND d.company_id = c.id
AND d.name = 'Keuangan & Akuntansi'
AND e.nik = 'FIN001';

UPDATE public.departments d
SET manager_id = e.id
FROM public.employees e, public.companies c
WHERE c.code = 'TMI'
AND d.company_id = c.id
AND d.name = 'Marketing & Sales'
AND e.nik = 'MKT001';

-- 5. SHIFT KERJA
INSERT INTO public.shifts (company_id, name, start_time, end_time, grace_period_minutes)
SELECT c.id, s.name, s.start_time, s.end_time, s.grace
FROM public.companies c
CROSS JOIN (VALUES
  ('Shift Reguler', '08:00'::time, '17:00'::time, 15),
  ('Shift Pagi', '07:00'::time, '15:00'::time, 10),
  ('Shift Siang', '14:00'::time, '22:00'::time, 10),
  ('Shift Malam', '22:00'::time, '06:00'::time, 10)
) AS s(name, start_time, end_time, grace)
WHERE c.code = 'TMI'
AND NOT EXISTS (
  SELECT 1 FROM public.shifts sh
  WHERE sh.company_id = c.id AND sh.name = s.name
);

-- 6. KEBIJAKAN CUTI
INSERT INTO public.leave_policies (company_id, name, total_days, accrual_type, carry_over_limit, carry_over_expiry_months)
SELECT c.id, lp.name, lp.total_days, lp.accrual, lp.carry_over, lp.expiry
FROM public.companies c
CROSS JOIN (VALUES
  ('Cuti Tahunan', 12, 'MONTHLY_ACCRUAL', 3, 3),
  ('Cuti Sakit', 14, 'YEARLY_FRONTLOAD', 0, 0),
  ('Cuti Melahirkan', 90, 'YEARLY_FRONTLOAD', 0, 0),
  ('Cuti Menikah', 3, 'YEARLY_FRONTLOAD', 0, 0),
  ('Cuti Duka', 2, 'YEARLY_FRONTLOAD', 0, 0),
  ('Unpaid Leave', 30, 'YEARLY_FRONTLOAD', 0, 0)
) AS lp(name, total_days, accrual, carry_over, expiry)
WHERE c.code = 'TMI'
AND NOT EXISTS (
  SELECT 1 FROM public.leave_policies l
  WHERE l.company_id = c.id AND l.name = lp.name
);

-- ============================================================
-- VERIFIKASI DATA
-- ============================================================
SELECT '✅ SEED DATA BERHASIL' as status;

SELECT 'Company' as entity, COUNT(*)::text as count FROM public.companies
UNION ALL
SELECT 'Departments', COUNT(*)::text FROM public.departments
UNION ALL
SELECT 'Employees', COUNT(*)::text FROM public.employees
UNION ALL
SELECT 'Shifts', COUNT(*)::text FROM public.shifts
UNION ALL
SELECT 'Leave Policies', COUNT(*)::text FROM public.leave_policies;
