import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase.js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isModerator: boolean;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ error: any; data?: any }>;
  signUp: (credentials: { email: string; password: string; options?: any }) => Promise<{ error: any; data?: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any; data?: any }>;
  updatePassword: (password: string) => Promise<{ error: any; data?: any }>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: false,
  isModerator: false,
  signInWithPassword: async () => ({ error: new Error('AuthProvider not found') }),
  signUp: async () => ({ error: new Error('AuthProvider not found') }),
  signInWithGoogle: async () => ({ error: new Error('AuthProvider not found') }),
  signOut: async () => {},
  resetPasswordForEmail: async () => ({ error: new Error('AuthProvider not found') }),
  updatePassword: async () => ({ error: new Error('AuthProvider not found') }),
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const signInWithPassword = async (credentials: { email: string; password: string }) => {
    return supabase.auth.signInWithPassword(credentials);
  };

  const signUp = async (credentials: { email: string; password: string; options?: any }) => {
    return supabase.auth.signUp(credentials);
  };

  const signInWithGoogle = async () => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/history` : undefined;
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  };

  const resetPasswordForEmail = async (email: string) => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  };

  const updatePassword = async (password: string) => {
    return supabase.auth.updateUser({ password });
  };

  const role =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    'user';
  const isModerator = role === 'moderator';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isModerator,
        signInWithPassword,
        signUp,
        signInWithGoogle,
        signOut,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}

