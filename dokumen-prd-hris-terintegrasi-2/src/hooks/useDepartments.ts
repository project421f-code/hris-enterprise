import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface DepartmentRecord {
  id: string;
  company_id: string;
  name: string;
  parent_id: string | null;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  employee_count?: number;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      // Get employee counts per department
      const departmentsWithCounts = await Promise.all(
        (data || []).map(async (dept) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .is('deleted_at', null);

          return { ...dept, employee_count: count || 0 };
        })
      );

      setDepartments(departmentsWithCounts);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const createDepartment = async (name: string, companyId: string): Promise<{ error?: string }> => {
    try {
      const { error: insertError } = await supabase.from('departments').insert({
        company_id: companyId,
        name,
      });

      if (insertError) throw insertError;
      await fetchDepartments();
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateDepartment = async (id: string, name: string): Promise<{ error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('departments')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchDepartments();
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteDepartment = async (id: string): Promise<{ error?: string }> => {
    try {
      const { error: deleteError } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchDepartments();
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
