'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function DemoBanner() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs"
      style={{ background: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <p style={{ color: '#5A7090' }}>🚀 TopWager — real accounts now live</p>
      {isLoggedIn ? (
        <button onClick={logout}
          className="rounded-full border px-3 py-1 text-[10px] font-bold"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#7A95B0' }}>
          Sign out
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full border px-3 py-1 text-[10px] font-bold"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#7A95B0' }}>
            Sign in
          </Link>
          <Link href="/register" className="rounded-full px-3 py-1 text-[10px] font-black text-[#0A0E14]"
            style={{ background: '#F5A623' }}>
            Join free →
          </Link>
        </div>
      )}
    </div>
  );
}
