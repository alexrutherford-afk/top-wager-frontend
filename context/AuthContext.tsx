'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  // Wallet fields — populated from profiles table once backend is wired
  cashBalance: number;
  bonusBalance: number;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  session: null,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
  loading: true,
});

function supabaseUserToAuthUser(supabaseUser: User): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split('@')[0] ?? 'Player',
    // TODO: Backend — fetch real balances from profiles table
    // GET /api/player/balance
    cashBalance: 0,
    bonusBalance: 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? supabaseUserToAuthUser(session.user) : null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? supabaseUserToAuthUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const register = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        // TODO: Backend — set emailRedirectTo to your production domain
        // emailRedirectTo: 'https://topwager.com/auth/callback'
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!user,
      user,
      session,
      login,
      register,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
