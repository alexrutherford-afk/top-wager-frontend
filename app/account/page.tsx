'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type Tab = 'profile' | 'security' | 'responsible';

const INPUT = 'w-full rounded-xl border border-white/[0.08] bg-[#1A2332] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#F5A623]/40 transition-colors';

export default function AccountPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-black">Sign in to view your account</h2>
        <Link href="/login" className="mt-2 rounded-xl px-8 py-3 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>Sign in</Link>
      </div>
    );
  }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const TABS: { value: Tab; label: string }[] = [
    { value: 'profile',     label: 'Profile' },
    { value: 'security',    label: 'Security' },
    { value: 'responsible', label: 'Resp. Gambling' },
  ];

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117', minHeight: '100vh' }}>

      {/* Profile header */}
      <div className="px-4 py-5 border-b border-white/[0.06]" style={{ background: '#131B24' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black border" style={{ background: 'linear-gradient(135deg,#2D7A50,#1A5C38)', color: '#F5A623', borderColor: 'rgba(245,166,35,0.25)' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="font-black text-white">{user.firstName} {user.lastName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="rounded-full px-2 py-0.5 text-[9px] font-black" style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>{user.vipLevel}</span>
                <span className="rounded-full px-2 py-0.5 text-[9px] font-black" style={{ background: 'rgba(26,92,56,0.25)', color: '#3A9E67' }}>✓ Verified</span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/5">Sign out</button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Cash',         value: `€${user.balance.cash.toFixed(2)}`, gold: true },
            { label: 'Total wagered', value: `€${user.wageredTotal.toLocaleString()}` },
            { label: 'Member since',  value: new Date(user.memberSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center border border-white/[0.06]" style={{ background: '#1A2332' }}>
              <p className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: '#5A7090' }}>{s.label}</p>
              <p className="text-sm font-black" style={s.gold ? { color: '#F5A623' } : { color: 'white' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]" style={{ background: '#131B24' }}>
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className="flex-1 py-3 text-xs font-bold transition-colors"
            style={{ color: tab === t.value ? '#F5A623' : '#5A7090', borderBottom: tab === t.value ? '2px solid #F5A623' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Profile tab */}
        {tab === 'profile' && (
          <>
            <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: '#131B24' }}>
              <p className="text-sm font-black text-white">Personal information</p>
              {/* TODO: Backend — PATCH /api/user/profile to save changes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>First name</label>
                  <input defaultValue={user.firstName} className={INPUT} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Last name</label>
                  <input defaultValue={user.lastName} className={INPUT} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Email address</label>
                <input defaultValue={user.email} type="email" className={INPUT} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Phone number</label>
                <input placeholder="+44 7700 900000" className={INPUT} />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} className="rounded-xl px-6 py-2.5 text-sm font-black text-[#0A0E14] transition-colors"
                  style={{ background: saved ? '#3A9E67' : '#F5A623' }}>
                  {saved ? '✓ Saved' : 'Save changes'}
                </button>
              </div>
            </div>

            {/* KYC */}
            <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: '#131B24' }}>
              <p className="text-sm font-black text-white mb-3">Identity verification (KYC)</p>
              {/* TODO: Backend — GET /api/user/kyc for real status */}
              <div className="flex items-start gap-3 rounded-xl px-4 py-3 border" style={{ background: 'rgba(26,92,56,0.1)', borderColor: 'rgba(45,122,80,0.3)' }}>
                <span style={{ color: '#3A9E67' }}>✓</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#3A9E67' }}>Account fully verified</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5A7090' }}>Your identity has been confirmed. No further action needed.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <>
            <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: '#131B24' }}>
              <p className="text-sm font-black text-white">Change password</p>
              {/* TODO: Backend — POST /api/auth/change-password */}
              {['Current password', 'New password', 'Confirm new password'].map((l) => (
                <div key={l}>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>{l}</label>
                  <input type="password" placeholder="••••••••" className={INPUT} />
                </div>
              ))}
              <button className="rounded-xl px-6 py-2.5 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>Update password</button>
            </div>

            <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3" style={{ background: '#131B24' }}>
              <p className="text-sm font-black text-white">Two-factor authentication</p>
              <p className="text-sm" style={{ color: '#5A7090' }}>Add an extra layer of security to your account.</p>
              {/* TODO: Backend — POST /api/auth/2fa/setup */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3" style={{ background: '#1A2332' }}>
                <div>
                  <p className="text-sm font-semibold text-white">Authenticator app</p>
                  <p className="text-xs" style={{ color: '#5A7090' }}>Not enabled</p>
                </div>
                <button className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/5">Enable</button>
              </div>
            </div>
          </>
        )}

        {/* Responsible gambling tab */}
        {tab === 'responsible' && (
          <>
            <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: '#131B24' }}>
              <p className="text-sm font-black text-white">Deposit limits</p>
              <p className="text-sm" style={{ color: '#5A7090' }}>Limits reduce immediately. Increases take 24 hours.</p>
              {/* TODO: Backend — PATCH /api/user/limits { daily, weekly, monthly } */}
              {['Daily limit', 'Weekly limit', 'Monthly limit'].map((l) => (
                <div key={l}>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>{l}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: '#5A7090' }}>€</span>
                    <input type="number" placeholder="No limit" className={INPUT + ' pl-8'} />
                  </div>
                </div>
              ))}
              <button className="rounded-xl px-6 py-2.5 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>Save limits</button>
            </div>

            <div className="rounded-2xl border border-red-500/20 p-5 space-y-3" style={{ background: 'rgba(232,77,28,0.04)' }}>
              <p className="text-sm font-black text-red-400">Self-exclusion</p>
              <p className="text-sm" style={{ color: '#7A95B0' }}>Exclude yourself from TopWager for a set period if gambling is becoming a problem.</p>
              {/* TODO: Backend — POST /api/user/self-exclude { period } */}
              <button className="rounded-xl border border-red-500/30 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/5">Request self-exclusion</button>
              <p className="text-xs" style={{ color: '#5A7090' }}>Need help? <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: '#F5A623' }}>BeGambleAware.org</a></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
