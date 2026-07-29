import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface PayrollRun {
  id: string;
  company_id: string;
  month: number;
  year: number;
  status: string;
  executed_by: string | null;
  created_at: string;
}

export interface PayrollDetail {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  basic_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  overtime_pay: number;
  bonus: number;
  bpjs_health_company: number;
  bpjs_health_employee: number;
  bpjs_ketenagakerjaan_company: number;
  bpjs_ketenagakerjaan_employee: number;
  pph21_tax: number;
  pph21_category: string;
  pph21_rate: number;
  gross_salary: number;
  net_salary: number;
  employees?: { full_name: string; nik: string; position: string; department_id: string } | null;
}

// PPh 21 TER Rate lookup (PMK 168/2023)
function getTERRate(category: 'A' | 'B' | 'C', grossSalary: number): number {
  if (category === 'A') {
    if (grossSalary <= 5400000) return 0;
    if (grossSalary <= 5650000) return 0.25;
    if (grossSalary <= 5950000) return 0.5;
    if (grossSalary <= 6300000) return 0.75;
    if (grossSalary <= 6750000) return 1.0;
    if (grossSalary <= 7500000) return 1.25;
    if (grossSalary <= 8500000) return 1.5;
    if (grossSalary <= 9500000) return 1.75;
    if (grossSalary <= 10500000) return 2.0;
    if (grossSalary <= 12500000) return 3.0;
    if (grossSalary <= 15000000) return 4.0;
    if (grossSalary <= 20000000) return 5.0;
    return 6.0;
  } else if (category === 'B') {
    if (grossSalary <= 6200000) return 0;
    if (grossSalary <= 6500000) return 0.25;
    if (grossSalary <= 6850000) return 0.5;
    if (grossSalary <= 7300000) return 0.75;
    if (grossSalary <= 7800000) return 1.0;
    if (grossSalary <= 8800000) return 1.25;
    if (grossSalary <= 9800000) return 1.5;
    if (grossSalary <= 10900000) return 1.75;
    if (grossSalary <= 11200000) return 2.0;
    if (grossSalary <= 13900000) return 3.0;
    if (grossSalary <= 16500000) return 4.0;
    if (grossSalary <= 22000000) return 5.0;
    return 6.5;
  } else {
    if (grossSalary <= 7200000) return 0;
    if (grossSalary <= 7600000) return 0.25;
    if (grossSalary <= 8000000) return 0.5;
    if (grossSalary <= 8500000) return 0.75;
    if (grossSalary <= 9000000) return 1.0;
    if (grossSalary <= 10000000) return 1.25;
    if (grossSalary <= 11000000) return 1.5;
    if (grossSalary <= 12000000) return 1.75;
    if (grossSalary <= 13500000) return 2.0;
    if (grossSalary <= 15000000) return 3.0;
    if (grossSalary <= 18000000) return 4.0;
    if (grossSalary <= 25000000) return 5.0;
    return 7.0;
  }
}

function getTERCategory(ptkp: string): 'A' | 'B' | 'C' {
  if (['TK/0', 'TK/1', 'K/0'].includes(ptkp)) return 'A';
  if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(ptkp)) return 'B';
  return 'C';
}

export interface PayrollSimulationInput {
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  bonus: number;
  ptkpStatus: string;
}

export interface PayrollSimulationResult {
  grossSalary: number;
  terCategory: string;
  terRate: number;
  pph21Tax: number;
  bpjsHealthEmp: number;
  bpjsHealthComp: number;
  bpjsJhtEmp: number;
  bpjsJhtComp: number;
  bpjsJpEmp: number;
  bpjsJpComp: number;
  bpjsJkk: number;
  bpjsJkm: number;
  totalDeductions: number;
  netSalary: number;
  totalCompanyCost: number;
}

export function calculatePayroll(input: PayrollSimulationInput): PayrollSimulationResult {
  const gross = input.basicSalary + input.allowance + input.overtimePay + input.bonus;
  const terCat = getTERCategory(input.ptkpStatus);
  const terRate = getTERRate(terCat, gross);
  const pph21 = gross * (terRate / 100);

  const bpjsBase = Math.min(input.basicSalary, 12000000);
  const bHealthEmp = bpjsBase * 0.01;
  const bHealthComp = bpjsBase * 0.04;
  const bJhtEmp = input.basicSalary * 0.02;
  const bJhtComp = input.basicSalary * 0.037;
  const jpBase = Math.min(input.basicSalary, 10042300);
  const bJpEmp = jpBase * 0.01;
  const bJpComp = jpBase * 0.02;
  const bJkk = input.basicSalary * 0.0024;
  const bJkm = input.basicSalary * 0.003;

  const totalDed = bHealthEmp + bJhtEmp + bJpEmp + pph21;
  const netSalary = gross - totalDed;
  const totalCompany = gross + bHealthComp + bJhtComp + bJpComp + bJkk + bJkm;

  return {
    grossSalary: gross, terCategory: `TER ${terCat}`, terRate,
    pph21Tax: pph21, bpjsHealthEmp: bHealthEmp, bpjsHealthComp: bHealthComp,
    bpjsJhtEmp: bJhtEmp, bpjsJhtComp: bJhtComp, bpjsJpEmp: bJpEmp, bpjsJpComp: bJpComp,
    bpjsJkk: bJkk, bpjsJkm: bJkm, totalDeductions: totalDed, netSalary, totalCompanyCost: totalCompany,
  };
}

// Hook: Payroll Runs
export function usePayrollRuns() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('payroll_runs')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (fetchError) throw fetchError;
      setRuns(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  const createRun = async (month: number, year: number, companyId: string, executedById: string) => {
    try {
      const { error: insertError } = await supabase.from('payroll_runs').insert({
        company_id: companyId, month, year, status: 'DRAFT', executed_by: executedById,
      });
      if (insertError) throw insertError;
      await fetchRuns();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { runs, loading, error, createRun, refetch: fetchRuns };
}

// Hook: Payroll Details
export function usePayrollDetails(runId?: string) {
  const [details, setDetails] = useState<PayrollDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!runId) return;
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('payroll_details')
        .select(`*, employees(full_name, nik, position, department_id)`)
        .eq('payroll_run_id', runId)
        .order('net_salary', { ascending: false });

      if (fetchError) throw fetchError;
      setDetails(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  return { details, loading, error, refetch: fetchDetails };
}
