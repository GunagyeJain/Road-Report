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
      setLoading(false);
    });

    // Listen for auth changes - Fixed TypeScript error here
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
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
