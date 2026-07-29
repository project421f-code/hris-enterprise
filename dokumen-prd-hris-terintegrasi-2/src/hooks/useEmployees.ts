import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface EmployeeRecord {
  id: string;
  company_id: string;
  department_id: string | null;
  nik: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string;
  role: string;
  status: string;
  join_date: string;
  resign_date: string | null;
  ptkp_status: string;
  basic_salary: number;
  bank_name: string | null;
  bank_account_no: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  departments?: { name: string } | null;
}

export interface EmployeeFormData {
  nik: string;
  full_name: string;
  email: string;
  phone: string;
  department_id: string;
  position: string;
  role: string;
  status: string;
  join_date: string;
  ptkp_status: string;
  basic_salary: number;
  bank_name: string;
  bank_account_no: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      // Use LEFT JOIN (no !inner) so employees without departments still appear
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select(`
          *,
          departments(name)
        `)
        .is('deleted_at', null)
        .order('full_name', { ascending: true });

      if (fetchError) throw fetchError;
      setEmployees(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const getEmployee = async (id: string): Promise<EmployeeRecord | null> => {
    try {
      // Use LEFT JOIN so department info is optional
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select(`
          *,
          departments(name)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const createEmployee = async (formData: EmployeeFormData, companyId: string): Promise<{ error?: string }> => {
    try {
      const { error: insertError } = await supabase.from('employees').insert({
        ...formData,
        company_id: companyId,
        phone: formData.phone || null,
      });

      if (insertError) throw insertError;
      await fetchEmployees();
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateEmployee = async (id: string, formData: Partial<EmployeeFormData>): Promise<{ error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchEmployees();
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const softDeleteEmployee = async (id: string): Promise<{ error?: string }> => {
    try {
      const { error: deleteError } = await supabase
        .from('employees')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchEmployees();
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
  };
}
