import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface MPPPlan {
  id: string;
  company_id: string;
  department_id: string;
  year: number;
  current_headcount: number;
  target_addition: number;
  allocated_budget: number;
  status: string;
  created_at: string;
  departments?: { name: string } | null;
}

export interface JobRequisition {
  id: string;
  mpp_plan_id: string;
  title: string;
  department_id: string;
  target_quarter: string;
  estimated_salary: number;
  headcount_requested: number;
  headcount_filled: number;
  approval_status: string;
  created_at: string;
  departments?: { name: string } | null;
  mpp_plans?: { year: number; departments: { name: string } | null } | null;
}

/**
 * Calculate prorated months based on target quarter
 */
function getProratedMonths(quarter: string): number {
  const map: Record<string, number> = {
    'Q1': 12, 'Q2': 9, 'Q3': 6, 'Q4': 3,
  };
  return map[quarter] || 12;
}

/**
 * Calculate projected annual cost for a position
 */
export function calculateProjectedCost(
  estimatedSalary: number,
  targetQuarter: string,
  headcount: number = 1
): { annualSalary: number; proratedCost: number; overheadBPJS: number; totalCost: number } {
  const months = getProratedMonths(targetQuarter);
  const annualSalary = estimatedSalary * 12 * headcount;
  const proratedCost = estimatedSalary * months * headcount;
  // BPJS & Tunjangan overhead: ~20% of basic salary
  const overheadBPJS = Math.round(proratedCost * 0.20);
  const totalCost = proratedCost + overheadBPJS;
  return { annualSalary, proratedCost, overheadBPJS, totalCost };
}

/**
 * Check if FPTK is within MPP plan budget
 */
export function checkBudgetAvailability(
  plan: MPPPlan,
  existingRequisitions: JobRequisition[],
  newEstimatedSalary: number,
  newQuarter: string,
  newHeadcount: number = 1
): { withinBudget: boolean; budgetRemaining: number; projectedTotal: number; message: string } {
  const totalExistingCost = existingRequisitions.reduce((sum, r) => {
    const cost = calculateProjectedCost(r.estimated_salary, r.target_quarter, r.headcount_requested);
    return sum + cost.totalCost;
  }, 0);

  const newCost = calculateProjectedCost(newEstimatedSalary, newQuarter, newHeadcount);
  const projectedTotal = totalExistingCost + newCost.totalCost;
  const budgetRemaining = plan.allocated_budget - projectedTotal;

  return {
    withinBudget: budgetRemaining >= 0,
    budgetRemaining,
    projectedTotal,
    message: budgetRemaining >= 0
      ? 'FPTK dalam batas anggaran MPP'
      : `Melebihi anggaran sebesar Rp ${Math.abs(budgetRemaining).toLocaleString('id-ID')}`,
  };
}

export function useMPPPlans() {
  const { employeeCompanyId } = useAuth();
  const [plans, setPlans] = useState<MPPPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('mpp_plans')
        .select('*, departments(name)')
        .order('year', { ascending: false });

      if (employeeCompanyId) {
        query = query.eq('company_id', employeeCompanyId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setPlans(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeCompanyId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const createPlan = async (plan: {
    department_id: string; year: number; current_headcount: number;
    target_addition: number; allocated_budget: number;
  }) => {
    if (!employeeCompanyId) return { error: 'Company ID tidak ditemukan' };
    try {
      const { error: insertError } = await supabase.from('mpp_plans').insert({
        company_id: employeeCompanyId,
        ...plan,
        status: 'DRAFT',
      });
      if (insertError) throw insertError;
      await fetchPlans();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error: updateError } = await supabase.from('mpp_plans').update({ status }).eq('id', id);
      if (updateError) throw updateError;
      await fetchPlans();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { plans, loading, error, createPlan, updateStatus, refetch: fetchPlans };
}

export function useJobRequisitions(mppPlanId?: string) {
  const { employeeCompanyId } = useAuth();
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequisitions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('job_requisitions')
        .select(`*, departments(name), mpp_plans(year, departments(name))`)
        .order('created_at', { ascending: false });

      if (mppPlanId) {
        query = query.eq('mpp_plan_id', mppPlanId);
      } else if (employeeCompanyId) {
        query = query.eq('mpp_plans.company_id', employeeCompanyId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setRequisitions(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeCompanyId, mppPlanId]);

  useEffect(() => { fetchRequisitions(); }, [fetchRequisitions]);

  const createRequisition = async (req: {
    mpp_plan_id: string; title: string; department_id: string;
    target_quarter: string; estimated_salary: number; headcount_requested: number;
  }) => {
    try {
      const { error: insertError } = await supabase.from('job_requisitions').insert({
        ...req,
        headcount_filled: 0,
        approval_status: 'PENDING',
      });
      if (insertError) throw insertError;
      await fetchRequisitions();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateApprovalStatus = async (id: string, approval_status: string) => {
    try {
      const { error: updateError } = await supabase.from('job_requisitions').update({ approval_status }).eq('id', id);
      if (updateError) throw updateError;
      await fetchRequisitions();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { requisitions, loading, error, createRequisition, updateApprovalStatus, refetch: fetchRequisitions };
}
