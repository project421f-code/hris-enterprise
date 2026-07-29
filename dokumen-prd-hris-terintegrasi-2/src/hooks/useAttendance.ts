import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AttendanceLog {
  id: string;
  employee_id: string;
  shift_id: string | null;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
  is_late: boolean;
  late_minutes: number;
  selfie_image_url: string | null;
  source: string;
  wfh_notes: string | null;
  created_at: string;
  employees?: { full_name: string; nik: string; position: string; department_id: string } | null;
  shifts?: { name: string; start_time: string; end_time: string } | null;
}

interface AttendanceStats {
  totalClockedIn: number;
  lateCount: number;
  onTimeCount: number;
  wfhCount: number;
  fingerprintCount: number;
}

export function useAttendance(date?: string) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClockedIn: 0, lateCount: 0, onTimeCount: 0,
    wfhCount: 0, fingerprintCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetDate = date || new Date().toISOString().split('T')[0];
  const startOfDay = `${targetDate}T00:00:00Z`;
  const endOfDay = `${targetDate}T23:59:59Z`;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          employees(full_name, nik, position, department_id),
          shifts(name, start_time, end_time)
        `)
        .gte('clock_in', startOfDay)
        .lte('clock_in', endOfDay)
        .order('clock_in', { ascending: false });

      if (fetchError) throw fetchError;

      const logsData = data || [];
      setLogs(logsData);

      setStats({
        totalClockedIn: logsData.length,
        lateCount: logsData.filter(l => l.is_late).length,
        onTimeCount: logsData.filter(l => !l.is_late).length,
        wfhCount: logsData.filter(l => l.source === 'WFH_REMOTE').length,
        fingerprintCount: logsData.filter(l => l.source === 'FINGERPRINT').length,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, stats, loading, error, refetch: fetchLogs };
}

export function useAttendanceHistory(employeeId?: string, limit = 50) {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance_logs')
        .select(`
          *,
          employees(full_name, nik, position),
          shifts(name, start_time, end_time)
        `)
        .order('clock_in', { ascending: false })
        .limit(limit);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setLogs(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { logs, loading, error, refetch: fetchHistory };
}
