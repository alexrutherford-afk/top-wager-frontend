'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MOCK_BONUSES } from '@/data/mockUser';

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function WageringBar({ wagered, required }: { wagered: number; required: number }) {
  const pct = required > 0 ? Math.min((wagered / required) * 100, 100) : 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1.5" style={{ color: '#666666' }}>
        <span>Wagering progress</span>
        <span>€{wagered.toLocaleString()} / €{required.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#161616' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0778BD, #1A9FE0)' }} />
      </div>
      <p className="mt-1 text-[10px]" style={{ color: '#666666' }}>{pct.toFixed(0)}% complete</p>
    </div>
  );
}

const TYPE_ICONS: Record<string, string> = { deposit_match: '💰', reload: '🔄', free_spins: '🎰', cashback: '💸' };

export default function BonusesPage() {
  const { isLoggedIn } = useAuth();
  const active    = MOCK_BONUSES.filter((b) => b.status === 'active');
  const available = MOCK_BONUSES.filter((b) => b.status === 'available');
  const expired   = MOCK_BONUSES.filter((b) => b.status === 'expired');

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0A0A0A', minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-4 py-5 border-b border-white/[0.06]" style={{ background: '#111111' }}>
        <h1 className="text-2xl font-black text-white">Promotions</h1>
        <p className="mt-1 text-sm" style={{ color: '#666666' }}>Your active offers, available bonuses and history</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Active bonuses */}
        {active.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-wider" style={{ color: '#F5A623' }}>Active bonuses</p>
            <div className="space-y-3">
              {active.map((b) => (
                <div key={b.id} className="rounded-2xl border p-5 space-y-4" style={{ background: '#111111', borderColor: 'rgba(245,166,35,0.2)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{TYPE_ICONS[b.type]}</span>
                      <div>
                        <p className="font-black text-white">{b.title}</p>
                        <p className="text-sm" style={{ color: '#888888' }}>{b.description}</p>
                        {b.game && <p className="mt-1 text-xs" style={{ color: '#666666' }}>Game: {b.game}</p>}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full px-3 py-1 text-xs font-black" style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>Active</span>
                  </div>
                  <WageringBar wagered={b.wageredAmount} required={b.wageringRequirement} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#666666' }}>Bonus balance</p>
                      <p className="text-base font-black" style={{ color: '#F5A623' }}>€{b.bonusAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs mb-0.5" style={{ color: '#666666' }}>Expires</p>
                      <p className="text-sm font-semibold text-white">{formatExpiry(b.expiresAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available offers */}
        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-wider" style={{ color: '#1A9FE0' }}>Available offers</p>
          <div className="space-y-3">
            {available.map((b) => (
              <div key={b.id} className="rounded-2xl border p-5" style={{ background: '#111111', borderColor: 'rgba(45,122,80,0.25)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{TYPE_ICONS[b.type]}</span>
                    <div>
                      <p className="font-black text-white">{b.title}</p>
                      <p className="text-sm" style={{ color: '#888888' }}>{b.description}</p>
                      {b.game && <p className="mt-1 text-xs" style={{ color: '#666666' }}>Game: {b.game}</p>}
                      <p className="mt-1 text-xs" style={{ color: '#666666' }}>Expires: {formatExpiry(b.expiresAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: 'rgba(7,120,189,0.25)', color: '#1A9FE0' }}>Available</span>
                    <Link
                      href={isLoggedIn ? '/wallet' : '/register'}
                      className="rounded-lg px-4 py-1.5 text-xs font-black text-[#0A0E14]"
                      style={{ background: '#F5A623' }}
                    >
                      {isLoggedIn ? 'Claim' : 'Register'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Welcome offer (guest) */}
        {!isLoggedIn && (
          <div className="rounded-2xl p-6 text-center border" style={{ background: 'linear-gradient(135deg,#060F0A,#0F2318)', borderColor: 'rgba(7,120,189,0.3)' }}>
            <p className="text-3xl mb-3">🎁</p>
            <h3 className="text-xl font-black text-white mb-1">100% Welcome Bonus</h3>
            <p className="text-sm mb-4" style={{ color: '#888888' }}>Up to €500 on your first deposit. No complicated rules.</p>
            <Link href="/register" className="inline-block rounded-xl px-8 py-3 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>
              Claim now →
            </Link>
          </div>
        )}

        {/* Expired */}
        {expired.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-black uppercase tracking-wider" style={{ color: '#666666' }}>Expired</p>
            <div className="space-y-2 opacity-50">
              {expired.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] px-4 py-3" style={{ background: '#111111' }}>
                  <span className="text-xl">{TYPE_ICONS[b.type]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#888888' }}>{b.title}</p>
                    <p className="text-xs" style={{ color: '#666666' }}>{b.description}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: '#666666' }}>Expired</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="text-xs border-t border-white/[0.05] pt-4" style={{ color: '#666666' }}>
          All bonuses subject to wagering requirements. 18+ only. Please gamble responsibly.
        </p>
      </div>
    </div>
  );
}
