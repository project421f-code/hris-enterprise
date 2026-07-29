-- Migration: 20260729000000_init_schema.sql
-- Description: Create core HRIS schema, enums, triggers, and indices for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies Table (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    manager_id UUID, -- Will be set to reference public.employees(id) later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References Supabase auth.users(id)
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
    ptkp_status VARCHAR(10) NOT NULL, -- TK/0, TK/1, K/0, K/1, K/2, K/3, etc.
    basic_salary NUMERIC(15, 2) NOT NULL, -- Keep numeric for demo/simulations; in production, encrypt
    bank_name VARCHAR(50),
    bank_account_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_role CHECK (role IN ('employee', 'manager', 'hr_attendance', 'hr_payroll', 'super_admin')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Update foreign key relation for departments.manager_id
ALTER TABLE public.departments 
    ADD CONSTRAINT fk_departments_manager 
    FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- 4. Shifts Table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- Regular, Shift 1, Shift 2, Night Shift, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
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
    selfie_image_url TEXT,
    source VARCHAR(30) DEFAULT 'MOBILE_GPS' NOT NULL, -- MOBILE_GPS, FINGERPRINT, WFH_REMOTE
    wfh_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Overtime Requests Table (Surat Perintah Lembur)
CREATE TABLE IF NOT EXISTS public.overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    estimated_hours NUMERIC(4, 2) NOT NULL,
    actual_hours NUMERIC(4, 2),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED, REJECTED
    approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_overtime_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- 7. Leave Policies Table
CREATE TABLE IF NOT EXISTS public.leave_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- Annual Leave, Maternity Leave, Sick Leave, Unpaid Leave
    total_days NUMERIC(4, 1) NOT NULL,
    accrual_type VARCHAR(20) DEFAULT 'YEARLY_FRONTLOAD' NOT NULL, -- MONTHLY_ACCRUAL, YEARLY_FRONTLOAD
    carry_over_limit INTEGER DEFAULT 0 NOT NULL,
    carry_over_expiry_months INTEGER DEFAULT 3 NOT NULL, -- default 3 months (ends March 31)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    leave_policy_id UUID REFERENCES public.leave_policies(id) ON DELETE RESTRICT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    attachment_url TEXT, -- for sick leave, etc.
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, APPROVED_L1, APPROVED_L2, APPROVED, REJECTED
    approver_l1_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    approver_l2_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    final_approver_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED_L1', 'APPROVED_L2', 'APPROVED', 'REJECTED'))
);

-- 9. Payroll Runs Table
CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL, -- 1 to 12
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, PROCESSING, LOCKED, PAID
    executed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_payroll_run_status CHECK (status IN ('DRAFT', 'PROCESSING', 'LOCKED', 'PAID'))
);

-- 10. Payroll Details Table (Payslip Items)
CREATE TABLE IF NOT EXISTS public.payroll_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE RESTRICT NOT NULL,
    basic_salary NUMERIC(15, 2) NOT NULL,
    allowances JSONB DEFAULT '{}'::jsonb NOT NULL,
    deductions JSONB DEFAULT '{}'::jsonb NOT NULL,
    overtime_pay NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bonus NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_health_company NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_health_employee NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_ketenagakerjaan_company NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    bpjs_ketenagakerjaan_employee NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    pph21_tax NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    pph21_category VARCHAR(5) NOT NULL, -- TER A, B, C
    pph21_rate NUMERIC(5, 2) NOT NULL,
    gross_salary NUMERIC(15, 2) NOT NULL,
    net_salary NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Performance Reviews Table
CREATE TABLE IF NOT EXISTS public.performance_reviews (
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_perf_status CHECK (status IN ('DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'SIGNED_OFF'))
);

-- 12. MPP Plans Table (Manpower Planning & Budgeting)
CREATE TABLE IF NOT EXISTS public.mpp_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,
    allocated_budget NUMERIC(15, 2) NOT NULL,
    current_headcount INTEGER DEFAULT 0 NOT NULL,
    target_additions INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_mpp_status CHECK (status IN ('DRAFT', 'APPROVED', 'REJECTED'))
);

-- 13. Job Requisitions Table (FPTK)
CREATE TABLE IF NOT EXISTS public.job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mpp_plan_id UUID REFERENCES public.mpp_plans(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    target_quarter VARCHAR(5) NOT NULL, -- Q1, Q2, Q3, Q4
    estimated_salary NUMERIC(15, 2) NOT NULL,
    recruitment_cost NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    status VARCHAR(30) DEFAULT 'DRAFT' NOT NULL, -- DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, SOURCING, ONBOARDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT chk_requisition_status CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SOURCING', 'ONBOARDED'))
);

-- 14. Audit Logs Table (GDPR & ISO 27001)
CREATE TABLE IF NOT EXISTS public.audit_logs (
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

-- Indices for performance and filtering
CREATE INDEX IF NOT EXISTS idx_emp_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_emp_auth ON public.employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_att_emp_date ON public.attendance_logs(employee_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leave_emp ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_run ON public.payroll_details(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_company ON public.audit_logs(company_id);

-- Trigger function to update updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_logs_updated_at BEFORE UPDATE ON public.attendance_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_overtime_requests_updated_at BEFORE UPDATE ON public.overtime_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_policies_updated_at BEFORE UPDATE ON public.leave_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_details_updated_at BEFORE UPDATE ON public.payroll_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON public.performance_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mpp_plans_updated_at BEFORE UPDATE ON public.mpp_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_requisitions_updated_at BEFORE UPDATE ON public.job_requisitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_company_id UUID;
    current_user_id UUID;
    old_val JSONB := NULL;
    new_val JSONB := NULL;
    rec_id UUID;
BEGIN
    -- Determine current company context
    SELECT company_id INTO current_company_id FROM public.employees WHERE auth_user_id = auth.uid() LIMIT 1;
    current_user_id := auth.uid();
    
    IF (TG_OP = 'DELETE') THEN
        old_val := to_jsonb(OLD);
        rec_id := OLD.id;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
        rec_id := NEW.id;
    ELSIF (TG_OP = 'INSERT') THEN
        new_val := to_jsonb(NEW);
        rec_id := NEW.id;
    END IF;

    INSERT INTO public.audit_logs (company_id, user_id, action, table_name, record_id, old_values, new_values)
    VALUES (current_company_id, current_user_id, TG_OP, TG_TABLE_NAME, rec_id, old_val, new_val);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit Log Triggers
CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE TRIGGER audit_attendance_logs AFTER INSERT OR UPDATE OR DELETE ON public.attendance_logs FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE TRIGGER audit_leave_requests AFTER INSERT OR UPDATE OR DELETE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
CREATE TRIGGER audit_payroll_details AFTER INSERT OR UPDATE OR DELETE ON public.payroll_details FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();
