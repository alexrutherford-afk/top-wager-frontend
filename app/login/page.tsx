'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const INPUT = 'w-full rounded-xl border border-white/10 bg-[#1A2332] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    // TODO: Backend — POST /api/auth/login { email, password } → returns session token
    await new Promise((r) => setTimeout(r, 800));
    login();
    router.push('/');
  };

  const demoLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    login();
    router.push('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10" style={{ background: '#0D1117' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-base font-black border"
            style={{ background: 'linear-gradient(135deg,#1A5C38,#2D7A50)', color: '#F5A623', borderColor: 'rgba(245,166,35,0.2)', boxShadow: '0 4px 20px rgba(26,92,56,0.5)' }}
          >
            TW
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: '#5A7090' }}>Sign in to your TopWager account</p>
        </div>

        {/* Demo banner */}
        <div className="mb-5 rounded-xl border px-4 py-3" style={{ background: 'rgba(245,166,35,0.06)', borderColor: 'rgba(245,166,35,0.2)' }}>
          <p className="mb-2 text-xs font-semibold" style={{ color: '#F5A623' }}>🎮 Demo mode — no real account needed</p>
          <button
            onClick={demoLogin}
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-black text-[#0A0E14] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#F5A623' }}
          >
            {loading ? 'Loading…' : 'View logged-in experience →'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.07]" /></div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs" style={{ background: '#0D1117', color: '#5A7090' }}>or sign in with email</span>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: '#131B24' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Email address</label>
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={INPUT} style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold" style={{ color: '#5A7090' }}>Password</label>
                <a href="#" className="text-xs font-semibold" style={{ color: '#F5A623' }}>Forgot password?</a>
              </div>
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={INPUT} style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl py-3 text-sm font-black text-[#0A0E14] disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: '#F5A623' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: '#5A7090' }}>
          Don&rsquo;t have an account?{' '}
          <Link href="/register" className="font-black" style={{ color: '#F5A623' }}>Register free</Link>
        </p>
      </div>
    </div>
  );
}
