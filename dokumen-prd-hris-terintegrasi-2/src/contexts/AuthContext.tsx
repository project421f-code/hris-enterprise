import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  employeeRole: string | null;
  employeeCompanyId: string | null;
  employeeId: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeRole, setEmployeeRole] = useState<string | null>(null);
  const [employeeCompanyId, setEmployeeCompanyId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchEmployeeData(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchEmployeeData(newSession.user.id);
      } else {
        setEmployeeRole(null);
        setEmployeeCompanyId(null);
        setEmployeeId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEmployeeData = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, role, company_id')
        .eq('auth_user_id', authUserId)
        .single();

      if (data && !error) {
        setEmployeeRole(data.role);
        setEmployeeCompanyId(data.company_id);
        setEmployeeId(data.id);
      }
    } catch (err) {
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const callSignupFunction = async (authUserId: string, email: string, fullName: string): Promise<{ companyId?: string; error?: string }> => {
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-signup`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          auth_user_id: authUserId,
          email,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Gagal memproses registrasi' };
      }

      if (data.status === 'exists' || data.status === 'success') {
        return { companyId: data.company_id };
      }

      return { companyId: data.company_id };
    } catch (err: any) {
      console.error('Error calling signup function:', err);
      return { error: err.message || 'Gagal terhubung ke server registrasi' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      // Call the Edge Function to create company + employee (bypasses RLS)
      const result = await callSignupFunction(data.user.id, email, fullName);

      if (result.error) {
        console.error('Signup function error:', result.error);
        return { error: 'Gagal membuat company default. Silakan hubungi admin.' };
      }
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setEmployeeRole(null);
    setEmployeeCompanyId(null);
    setEmployeeId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        employeeRole,
        employeeCompanyId,
        employeeId,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
