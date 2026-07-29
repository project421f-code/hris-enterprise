import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface PerformanceReview {
  id: string;
  employee_id: string;
  period: string;
  kpi_score: number;
  competency_score: number;
  final_rating: string;
  nine_box_quadrant: string;
  bonus_multiplier: number;
  self_review: string | null;
  manager_review: string | null;
  peer_review_avg: number | null;
  status: string;
  created_at: string;
  employees?: { full_name: string; nik: string; position: string; department_id: string } | null;
}

export interface NineBoxData {
  name: string;
  performance: number; // 1-3 (Low, Medium, High)
  potential: number;   // 1-3 (Low, Medium, High)
  quadrant: string;
  rating: string;
  employee_id: string;
}

function calculateNineBox(kpiScore: number, competencyScore: number): { quadrant: string; rating: string; perfLevel: number; potLevel: number } {
  const avgScore = (kpiScore + competencyScore) / 2;
  
  let performance: number;
  if (avgScore >= 85) performance = 3; // High
  else if (avgScore >= 70) performance = 2; // Medium
  else performance = 1; // Low

  // For demo, use competency as potential indicator
  let potential: number;
  if (competencyScore >= 80) potential = 3;
  else if (competencyScore >= 65) potential = 2;
  else potential = 1;

  const matrix: Record<string, { quadrant: string; rating: string }> = {
    '3-3': { quadrant: 'Star / High Flyer', rating: 'A' },
    '3-2': { quadrant: 'Future Star', rating: 'A' },
    '3-1': { quadrant: 'Rising Talent', rating: 'B+' },
    '2-3': { quadrant: 'Core Performer', rating: 'B' },
    '2-2': { quadrant: 'Core Player', rating: 'B' },
    '2-1': { quadrant: 'Average Performer', rating: 'B-' },
    '1-3': { quadrant: 'Enigma / Potential', rating: 'C+' },
    '1-2': { quadrant: 'Underperformer', rating: 'C' },
    '1-1': { quadrant: 'Low Performer - PIP', rating: 'D' },
  };

  const key = `${performance}-${potential}`;
  const result = matrix[key] || { quadrant: 'Unrated', rating: 'N/A' };

  return { ...result, perfLevel: performance, potLevel: potential };
}

export function usePerformanceReviews() {
  const { employeeCompanyId } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('performance_reviews')
        .select(`*, employees!inner(full_name, nik, position, department_id, company_id)`)
        .order('created_at', { ascending: false });

      if (employeeCompanyId) {
        query = query.eq('employees.company_id', employeeCompanyId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setReviews(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeCompanyId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const createReview = async (review: {
    employee_id: string; period: string; kpi_score: number;
    competency_score: number; self_review?: string;
  }) => {
    const nineBox = calculateNineBox(review.kpi_score, review.competency_score);
    try {
      const { error: insertError } = await supabase.from('performance_reviews').insert({
        ...review,
        final_rating: nineBox.rating,
        nine_box_quadrant: nineBox.quadrant,
        bonus_multiplier: nineBox.rating === 'A' ? 1.5 : nineBox.rating === 'B' ? 1.0 : 0,
        status: 'DRAFT',
      });
      if (insertError) throw insertError;
      await fetchReviews();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error: updateError } = await supabase.from('performance_reviews').update({ status }).eq('id', id);
      if (updateError) throw updateError;
      await fetchReviews();
      return { error: undefined };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { reviews, loading, error, createReview, updateStatus, refetch: fetchReviews, calculateNineBox };
}
