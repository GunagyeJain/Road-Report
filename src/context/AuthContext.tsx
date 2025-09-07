import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: AuthError }>;
  register: (email: string, password: string) => Promise<{ error?: AuthError }>;
  logout: () => Promise<{ error?: AuthError }>;
  loginAnonymously: () => Promise<{ error?: AuthError }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not initialized. Check environment variables.' } as AuthError };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error || undefined };
  };

  const register = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase not initialized. Check environment variables.' } as AuthError };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error || undefined };
  };

  const logout = async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not initialized.' } as AuthError };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error: error || undefined };
  };

  const loginAnonymously = async () => {
    return { error: { message: 'Anonymous login not implemented yet' } as AuthError };
  };

  // Check admin status from database
  const checkAdminStatus = async (user: User) => {
    if (!supabase) {
      console.log('❌ Supabase not initialized');
      setIsAdmin(false);
      return;
    }

    try {
      console.log('🔍 Checking admin status for user:', user.email);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error checking admin status:', error);
        
        // Try checking by email as fallback
        const { data: emailData, error: emailError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('email', user.email)
          .single();

        if (emailError) {
          console.error('❌ Error checking admin status by email:', emailError);
          setIsAdmin(false);
        } else if (emailData) {
          const adminStatus = emailData.is_admin || false;
          console.log('✅ Admin status found by email for', user.email, ':', adminStatus);
          setIsAdmin(adminStatus);
        } else {
          console.log('⚠️ No profile found for user:', user.email);
          setIsAdmin(false);
        }
      } else if (data) {
        const adminStatus = data.is_admin || false;
        console.log('✅ Admin status for', user.email, ':', adminStatus);
        setIsAdmin(adminStatus);
      } else {
        console.log('⚠️ No profile data found for user:', user.email);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('❌ Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized - running in mock mode');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    login,
    register,
    logout,
    loginAnonymously,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
