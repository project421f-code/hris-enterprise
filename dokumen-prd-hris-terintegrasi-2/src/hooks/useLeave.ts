import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface LeavePolicy {
  id: string;
  company_id: string;
  name: string;
  total_days: number;
  accrual_type: string;
  carry_over_limit: number;
  carry_over_expiry_months: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_policy_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
  employees?: { full_name: string; nik: string; position: string } | null;
  leave_policies?: { name: string; total_days: number } | null;
}

// Hook for leave policies
export function useLeavePolicies() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('leave_policies')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setPolicies(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  return { policies, loading, error, refetch: fetchPolicies };
}

// Hook for leave requests
export function useLeaveRequests(filters?: { status?: string; employeeId?: string }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leave_requests')
        .select(`*, employees(full_name, nik, position), leave_policies(name, total_days)`)
        .order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setRequests(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.employeeId]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const createRequest = async (req: {
    employee_id: string;
    leave_policy_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }) => {
    try {
      const { error: insertError } = await supabase.from('leave_requests').insert(req);
      if (insertError) throw insertError;
      await fetchRequests();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const approveRequest = async (id: string, level: 'l1' | 'l2' | 'final', approverId: string) => {
    try {
      const updates: any = {};
      if (level === 'l1') { updates.status = 'APPROVED_L1'; updates.approver_l1_id = approverId; }
      else if (level === 'l2') { updates.status = 'APPROVED_L2'; updates.approver_l2_id = approverId; }
      else { updates.status = 'APPROVED'; updates.final_approver_id = approverId; }

      const { error: updateError } = await supabase.from('leave_requests').update(updates).eq('id', id);
      if (updateError) throw updateError;
      await fetchRequests();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      const { error: updateError } = await supabase.from('leave_requests').update({ status: 'REJECTED' }).eq('id', id);
      if (updateError) throw updateError;
      await fetchRequests();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { requests, loading, error, createRequest, approveRequest, rejectRequest, refetch: fetchRequests };
}
