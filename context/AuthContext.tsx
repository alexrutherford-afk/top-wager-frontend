'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  currency: string;
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  vipLevel: number;
  cashBalance: number;
  bonusBalance: number;
  pendingWithdrawal: number;
  hasDeposited: boolean; // true if cashBalance > 0 at time of auth load; proxy until first_deposit_at added in Phase 2
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name: string, currency: string) => Promise<{ error: string | null; userId?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false, user: null, session: null, loading: true,
  login: async () => ({ error: null }),
  register: async () => ({ error: null, userId: undefined }),
  logout: async () => {},
  refreshUser: async () => {},
});

// Fetch profile + wallet from Supabase and merge into AuthUser
async function fetchPlayerData(userId: string, email: string): Promise<AuthUser | null> {
  const supabase = createClient();

  const [profileRes, walletRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('wallets').select('*').eq('player_id', userId).single(),
  ]);

  if (profileRes.error || !profileRes.data) return null;

  const profile = profileRes.data;
  const wallet  = walletRes.data;

  const cashBalance = wallet?.cash_balance ?? 0;
  return {
    id:                 userId,
    email,
    name:               profile.full_name ?? email.split('@')[0],
    phone:              profile.phone ?? undefined,
    currency:           profile.currency ?? 'EUR',
    kycStatus:          profile.kyc_status ?? 'not_submitted',
    vipLevel:           profile.vip_level ?? 0,
    cashBalance,
    bonusBalance:       wallet?.bonus_balance       ?? 0,
    pendingWithdrawal:  wallet?.pending_withdrawal  ?? 0,
    hasDeposited:       cashBalance > 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadUser = async (session: Session | null) => {
    if (!session?.user) { setUser(null); setLoading(false); return; }
    const player = await fetchPlayerData(session.user.id, session.user.email ?? '');
    setUser(player);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message };
    return { error: null };
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    currency: string = 'EUR'
  ): Promise<{ error: string | null; userId?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, currency },
        // TODO: set emailRedirectTo to production domain before go-live
        // emailRedirectTo: 'https://topwager.com/auth/callback'
      },
    });
    if (error) return { error: error.message };
    return { error: null, userId: data.user?.id };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    if (!session?.user) return;
    const player = await fetchPlayerData(session.user.id, session.user.email ?? '');
    setUser(player);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, session, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
