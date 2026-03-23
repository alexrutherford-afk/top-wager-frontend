'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export function DemoBanner() {
  const { isLoggedIn, login, logout } = useAuth();

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2 text-xs"
      style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <p style={{ color: '#666666' }}>
        🎮 Demo prototype — all data is mocked
      </p>
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block" style={{ color: '#1A9FE0' }}>✓ Viewing logged-in state</span>
          <button
            onClick={logout}
            className="rounded-full border px-3 py-1 text-[10px] font-bold"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#888888' }}
          >
            Switch to guest →
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block" style={{ color: '#666666' }}>Viewing as guest</span>
          <button
            onClick={login}
            className="rounded-full px-3 py-1 text-[10px] font-black text-[#0A0E14]"
            style={{ background: '#F5A623' }}
          >
            Preview logged-in →
          </button>
        </div>
      )}
    </div>
  );
}
