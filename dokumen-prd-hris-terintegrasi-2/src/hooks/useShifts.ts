import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface ShiftRecord {
  id: string;
  company_id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  created_at: string;
  updated_at: string;
}

export function useShifts() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      setShifts(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (shift: Omit<ShiftRecord, 'id' | 'company_id' | 'created_at' | 'updated_at'>, companyId: string) => {
    try {
      const { error: insertError } = await supabase
        .from('shifts')
        .insert({ ...shift, company_id: companyId });

      if (insertError) throw insertError;
      await fetchShifts();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateShift = async (id: string, shift: Partial<Omit<ShiftRecord, 'id' | 'company_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { error: updateError } = await supabase
        .from('shifts')
        .update(shift)
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchShifts();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const deleteShift = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchShifts();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { shifts, loading, error, createShift, updateShift, deleteShift, refetch: fetchShifts };
}
