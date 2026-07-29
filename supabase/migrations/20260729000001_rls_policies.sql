-- Migration: 20260729000001_rls_policies.sql
-- Description: Define Row Level Security (RLS) policies for all HRIS tables

-- Ensure RLS is enabled on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
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

-- Helper functions for RLS checks (executed with SECURITY DEFINER to bypass RLS internally)
CREATE OR REPLACE FUNCTION public.get_auth_employee_id()
RETURNS UUID AS $$
    SELECT id FROM public.employees WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_employee_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM public.employees WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_employee_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.employees WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. COMPANIES POLICIES
CREATE POLICY company_select_member ON public.companies
    FOR SELECT USING (id = public.get_auth_employee_company_id());

CREATE POLICY company_super_admin ON public.companies
    FOR ALL USING (public.get_auth_employee_role() = 'super_admin');

-- 2. DEPARTMENTS POLICIES
CREATE POLICY dept_select_member ON public.departments
    FOR SELECT USING (company_id = public.get_auth_employee_company_id());

CREATE POLICY dept_all_admin ON public.departments
    FOR ALL USING (
        company_id = public.get_auth_employee_company_id() 
        AND public.get_auth_employee_role() IN ('hr_attendance', 'hr_payroll', 'super_admin')
    );

-- 3. EMPLOYEES POLICIES
CREATE POLICY emp_select_own ON public.employees
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY emp_select_same_company ON public.employees
    FOR SELECT USING (
        company_id = public.get_auth_employee_company_id() 
        AND public.get_auth_employee_role() IN ('manager', 'hr_attendance', 'hr_payroll', 'super_admin')
    );

CREATE POLICY emp_all_hr_or_admin ON public.employees
    FOR ALL USING (
        company_id = public.get_auth_employee_company_id()
        AND public.get_auth_employee_role() IN ('hr_payroll', 'super_admin')
    );

-- 4. SHIFTS POLICIES
CREATE POLICY shift_select_company ON public.shifts
    FOR SELECT USING (company_id = public.get_auth_employee_company_id());

CREATE POLICY shift_all_hr_or_admin ON public.shifts
    FOR ALL USING (
        company_id = public.get_auth_employee_company_id()
        AND public.get_auth_employee_role() IN ('hr_attendance', 'super_admin')
    );

-- 5. ATTENDANCE LOGS POLICIES
CREATE POLICY att_select_own ON public.attendance_logs
    FOR SELECT USING (employee_id = public.get_auth_employee_id());

CREATE POLICY att_insert_own ON public.attendance_logs
    FOR INSERT WITH CHECK (employee_id = public.get_auth_employee_id());

CREATE POLICY att_select_manager_and_hr ON public.attendance_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = attendance_logs.employee_id 
            AND e.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('manager', 'hr_attendance', 'super_admin')
    );

CREATE POLICY att_all_hr_or_admin ON public.attendance_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = attendance_logs.employee_id 
            AND e.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('hr_attendance', 'super_admin')
    );

-- 6. OVERTIME REQUESTS POLICIES
CREATE POLICY ot_select_insert_own ON public.overtime_requests
    FOR ALL USING (employee_id = public.get_auth_employee_id());

CREATE POLICY ot_all_manager_and_hr ON public.overtime_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = overtime_requests.employee_id 
            AND e.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('manager', 'hr_attendance', 'super_admin')
    );

-- 7. LEAVE POLICIES
CREATE POLICY leave_policy_select ON public.leave_policies
    FOR SELECT USING (company_id = public.get_auth_employee_company_id());

CREATE POLICY leave_policy_all_hr ON public.leave_policies
    FOR ALL USING (
        company_id = public.get_auth_employee_company_id()
        AND public.get_auth_employee_role() IN ('hr_attendance', 'super_admin')
    );

-- 8. LEAVE REQUESTS POLICIES
CREATE POLICY leave_req_select_insert_own ON public.leave_requests
    FOR ALL USING (employee_id = public.get_auth_employee_id());

CREATE POLICY leave_req_all_manager_and_hr ON public.leave_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = leave_requests.employee_id 
            AND e.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('manager', 'hr_attendance', 'super_admin')
    );

-- 9. PAYROLL RUNS POLICIES
CREATE POLICY payroll_run_all_hr ON public.payroll_runs
    FOR ALL USING (
        company_id = public.get_auth_employee_company_id()
        AND public.get_auth_employee_role() IN ('hr_payroll', 'super_admin')
    );

-- 10. PAYROLL DETAILS POLICIES
CREATE POLICY payroll_detail_select_own ON public.payroll_details
    FOR SELECT USING (employee_id = public.get_auth_employee_id());

CREATE POLICY payroll_detail_all_hr ON public.payroll_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = payroll_details.employee_id 
            AND e.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('hr_payroll', 'super_admin')
    );

-- 11. PERFORMANCE REVIEWS POLICIES
CREATE POLICY perf_select_own ON public.performance_reviews
    FOR SELECT USING (employee_id = public.get_auth_employee_id());

CREATE POLICY perf_update_own ON public.performance_reviews
    FOR UPDATE USING (
        employee_id = public.get_auth_employee_id()
        AND status = 'SELF_ASSESSMENT'
    );

CREATE POLICY perf_all_manager_and_hr ON public.performance_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.employees e 
            WHERE e.id = performance_reviews.employee_id 
            AND e.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('manager', 'hr_payroll', 'super_admin')
    );

-- 12. MPP PLANS POLICIES
CREATE POLICY mpp_select_all ON public.mpp_plans
    FOR SELECT USING (company_id = public.get_auth_employee_company_id());

CREATE POLICY mpp_all_hr_or_manager ON public.mpp_plans
    FOR ALL USING (
        company_id = public.get_auth_employee_company_id()
        AND public.get_auth_employee_role() IN ('manager', 'hr_payroll', 'super_admin')
    );

-- 13. JOB REQUISITIONS POLICIES
CREATE POLICY job_req_select_all ON public.job_requisitions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.mpp_plans p
            WHERE p.id = job_requisitions.mpp_plan_id
            AND p.company_id = public.get_auth_employee_company_id()
        )
    );

CREATE POLICY job_req_all_hr_or_manager ON public.job_requisitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.mpp_plans p
            WHERE p.id = job_requisitions.mpp_plan_id
            AND p.company_id = public.get_auth_employee_company_id()
        )
        AND public.get_auth_employee_role() IN ('manager', 'hr_payroll', 'super_admin')
    );

-- 14. AUDIT LOGS POLICIES
CREATE POLICY audit_select_own_company ON public.audit_logs
    FOR SELECT USING (
        company_id = public.get_auth_employee_company_id()
        AND public.get_auth_employee_role() IN ('hr_payroll', 'super_admin')
    );
