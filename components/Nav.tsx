'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const TABS = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/slots', icon: '🎰', label: 'Slots' },
  { href: '/live', icon: '🃏', label: 'Live' },
  { href: '/crash', icon: '✈️', label: 'Crash', badge: 'HOT', badgeOrange: true },
  { href: '/jackpots', icon: '🏆', label: 'Jackpots' },
  { href: '/bonuses', icon: '🎁', label: 'Promos', badge: 'NEW', badgeOrange: false },
  { href: '/refer', icon: '🤝', label: 'Refer', badge: '500%', badgeOrange: false },
];

export function Nav() {
  const { isLoggedIn, user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────── */}
      <header>

        {/* Top bar: logo + actions */}
        <div
          className="flex items-center justify-between px-3 py-2 border-b border-white/5"
          style={{ background: 'linear-gradient(180deg, #0D1117 0%, #131B24 100%)' }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black border"
              style={{
                background: 'linear-gradient(135deg, #1A5C38, #2D7A50)',
                color: '#F5A623',
                borderColor: 'rgba(245,166,35,0.2)',
                boxShadow: '0 3px 10px rgba(26,92,56,0.5)',
              }}
            >
              TW
            </div>
            <div className="leading-none">
              <span className="block text-xs font-black tracking-widest" style={{ color: '#F5A623' }}>TOP</span>
              <span className="block text-xs font-black tracking-widest text-white">WAGER</span>
              <span className="block text-[8px] font-semibold tracking-widest uppercase" style={{ color: '#5A7090' }}>Casino</span>
            </div>
          </Link>

          {/* Right actions */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/deposit"
                className="rounded-full px-3 py-1.5 text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #1A5C38, #2D7A50)', boxShadow: '0 3px 10px rgba(26,92,56,0.4)' }}
              >
                + Deposit
              </Link>
              <Link href="/account" className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2"
                  style={{
                    background: 'linear-gradient(135deg, #2D7A50, #1A5C38)',
                    color: '#F5A623',
                    borderColor: 'rgba(245,166,35,0.3)',
                    boxShadow: '0 0 10px rgba(26,92,56,0.4)',
                  }}
                >
                  {user.name.split(' ').map((n:string)=>n[0]).join('')}
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E84D1C] border-2 border-[#131B24]" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full px-3 py-1.5 text-xs font-black text-[#0A0E14]"
                style={{ background: 'linear-gradient(135deg, #F5A623, #E8950F)', boxShadow: '0 3px 10px rgba(245,166,35,0.35)' }}
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* Balance bar (logged in only) */}
        {isLoggedIn && user && (
          <div
            className="grid grid-cols-3 border-b border-white/5"
            style={{ background: '#131B24' }}
          >
            <div className="flex flex-col px-3 py-1.5 border-r border-white/[0.07]">
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>💰 Main</span>
              <span className="text-sm font-black text-white">€{user.cashBalance.toLocaleString("en-GB",{minimumFractionDigits:2})}</span>
            </div>
            <div className="flex flex-col px-3 py-1.5 border-r border-white/[0.07]">
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>🎁 Bonus</span>
              <span className="text-sm font-black" style={{ color: '#F5A623' }}>€{user.bonusBalance.toFixed(2)}</span>
            </div>
            <Link
              href="/withdraw"
              className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-black transition-colors hover:opacity-80"
              style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
            >
              ⚡ Withdraw
            </Link>
          </div>
        )}

        {/* Main nav tabs */}
        <div
          className="no-scrollbar flex overflow-x-auto border-b border-white/5"
          style={{ background: '#131B24' }}
        >
          {TABS.map((tab) => {
            const active = isActive(tab.href) || (tab.href === '/' && pathname === '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex shrink-0 flex-col items-center gap-0.5 px-3 py-2 text-[9px] font-bold uppercase tracking-wide transition-colors"
                style={{
                  color: active ? '#F5A623' : '#5A7090',
                  borderBottom: active ? '2.5px solid #F5A623' : '2.5px solid transparent',
                }}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className="absolute top-1 right-0.5 rounded text-[6px] font-black px-1 py-px"
                    style={{ background: tab.badgeOrange ? '#E84D1C' : '#1A5C38', color: 'white' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ── Fixed bottom nav (mobile) ──────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-white/[0.07] pb-4 pt-1 md:hidden"
        style={{ background: '#131B24' }}
      >
        <Link href="/" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${pathname === '/' ? 'text-[#F5A623]' : 'text-[#5A7090]'}`}>
          <span className="text-[19px]">🏠</span>
          <span className="text-[8.5px] font-semibold">Home</span>
        </Link>
        {/* Replaced Casino/Slots (accessible via top nav tabs) with Refer —
            Bring a Mate is a key revenue driver and needs to be one tap away */}
        <Link href="/refer" className={`flex flex-col items-center gap-0.5 px-3 py-1 ${pathname === '/refer' ? 'text-[#F5A623]' : 'text-[#5A7090]'}`}>
          <span className="text-[19px]">🤝</span>
          <span className="text-[8.5px] font-semibold">Refer</span>
        </Link>
        {/* Centre button */}
        <div className="flex flex-col items-center gap-0.5 -mt-4">
          <Link
            href="/"
            className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border-[3px] border-[#131B24]"
            style={{
              background: 'linear-gradient(135deg, #1A5C38, #2D7A50)',
              color: '#F5A623',
              boxShadow: '0 4px 16px rgba(26,92,56,0.6)',
            }}
          >
            TW
          </Link>
          <span className="text-[8.5px] font-bold" style={{ color: '#3A9E67' }}>Play</span>
        </div>
        <Link
          href="/wallet"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isLoggedIn ? 'text-[#5A7090]' : 'text-[#5A7090] opacity-40 pointer-events-none'}`}
        >
          <span className="text-[19px]">💳</span>
          <span className="text-[8.5px] font-semibold">Wallet</span>
          {isLoggedIn && user && (
            <span className="text-[7.5px] font-bold" style={{ color: '#F5A623' }}>€{user.cashBalance.toFixed(0)}</span>
          )}
        </Link>
        <Link
          href="/account"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${isLoggedIn ? 'text-[#5A7090]' : 'text-[#5A7090] opacity-40 pointer-events-none'}`}
        >
          <span className="text-[19px]">👤</span>
          <span className="text-[8.5px] font-semibold">Account</span>
        </Link>
      </nav>
    </>
  );
}
