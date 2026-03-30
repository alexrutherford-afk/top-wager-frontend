'use client';

/**
 * /refer — Bring a Mate player dashboard.
 *
 * All data is MOCK/STATIC.
 * TODO: replace every MOCK_* constant with a real API call once
 *       the affiliate + bonus backend is live.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: replace with GET /api/affiliates/me

const MOCK_REF_CODE = 'ALEX500';

const MOCK_REFEREES = [
  { id: 'P-001', status: 'Rewarded',    joinedAt: '2026-03-01' },
  { id: 'P-002', status: 'Playing',     joinedAt: '2026-03-08' },
  { id: 'P-003', status: 'Deposited',   joinedAt: '2026-03-14' },
  { id: 'P-004', status: 'Registered',  joinedAt: '2026-03-22' },
  { id: 'P-005', status: 'Playing',     joinedAt: '2026-03-27' },
];

const MOCK_EARNINGS = {
  allTime:       45_000,    // UGX
  thisMonth:     18_500,
  pending:        9_000,
  flatReward:    30_000,
  revenueShare:  15_000,
};

const MOCK_BONUS_WR = {
  label:    'Welcome Bonus',
  amount:   50_000,         // UGX
  wagered:  112_400,
  target:   250_000,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type StatusKey = 'Registered' | 'Deposited' | 'Playing' | 'Rewarded';

const STATUS_STYLE: Record<StatusKey, { bg: string; color: string }> = {
  Registered: { bg: 'rgba(90,112,144,0.2)',   color: '#7A95B0' },
  Deposited:  { bg: 'rgba(96,165,250,0.15)',  color: '#60A5FA' },
  Playing:    { bg: 'rgba(58,158,103,0.2)',   color: '#5DE898' },
  Rewarded:   { bg: 'rgba(245,166,35,0.2)',   color: '#F5A623' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status as StatusKey] ?? STATUS_STYLE.Registered;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReferPage() {
  const { isLoggedIn, user, loading } = useAuth();
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!loading && !isLoggedIn) router.replace('/login');
  }, [loading, isLoggedIn, router]);

  if (loading || !isLoggedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0D1117' }}>
        <p className="text-sm font-semibold" style={{ color: '#5A7090' }}>Loading...</p>
      </div>
    );
  }

  // TODO: replace with actual user referral code from API
  const refCode  = MOCK_REF_CODE;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${refCode}`
    : `https://topwager.com/join/${refCode}`;

  const waText = encodeURIComponent(
    `Join me on TopWager — best casino in Uganda!\nSign up with my link and claim a 500% bonus:\n${shareUrl}`
  );

  const copyCode = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wrPct = Math.min(100, Math.round((MOCK_BONUS_WR.wagered / MOCK_BONUS_WR.target) * 100));

  const CARD = 'rounded-2xl p-4' as const;
  const CARD_BG = { background: '#131B24' } as const;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: '#0D1117' }}>

      {/* Page header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-black text-white">Bring a Mate</h1>
        <p className="mt-0.5 text-xs" style={{ color: '#5A7090' }}>
          Earn 500% bonus cash for every friend who deposits
        </p>
      </div>

      <div className="space-y-3 px-4">

        {/* ── 1. Referral code + share ─────────────────────────────────────── */}
        <div className={CARD} style={CARD_BG}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5A7090' }}>
            Your referral link
          </p>

          {/* URL display + copy */}
          <div
            className="mb-3 flex items-center gap-2 rounded-xl px-3 py-3 border"
            style={{ background: '#0D1117', borderColor: 'rgba(245,166,35,0.25)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#5A7090' }}>
                Your link
              </p>
              <p className="text-xs font-semibold truncate" style={{ color: '#F5A623' }}>
                {shareUrl}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-black transition-opacity hover:opacity-80"
              style={{ background: copied ? '#1A5C38' : 'rgba(245,166,35,0.15)', color: copied ? '#5DE898' : '#F5A623' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Share row */}
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </a>

            {/* QR code */}
            <div
              className="shrink-0 rounded-xl p-2"
              style={{ background: 'white' }}
              title="Scan to register with your code"
            >
              <QRCodeSVG
                value={shareUrl}
                size={56}
                bgColor="white"
                fgColor="#0D1117"
                level="M"
              />
            </div>
          </div>

          <p className="mt-2 text-center text-[9.5px]" style={{ color: '#3A4A5A' }}>
            Share your link — friends get a welcome bonus, you earn cash
          </p>
        </div>

        {/* ── 2. Earnings summary ──────────────────────────────────────────── */}
        <div className={CARD} style={CARD_BG}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5A7090' }}>
            Your earnings {/* TODO: replace with API call */}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'All time',    value: MOCK_EARNINGS.allTime,   color: '#F5A623' },
              { label: 'This month',  value: MOCK_EARNINGS.thisMonth, color: '#5DE898' },
              { label: 'Pending',     value: MOCK_EARNINGS.pending,   color: '#60A5FA' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3 text-center"
                style={{ background: '#0D1117' }}
              >
                <p className="text-sm font-black" style={{ color: item.color }}>
                  {item.value.toLocaleString()} UGX
                </p>
                <p className="mt-0.5 text-[9px] font-semibold" style={{ color: '#5A7090' }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5">
            {[
              { label: 'Flat reward (per deposit)', value: MOCK_EARNINGS.flatReward },
              { label: 'Revenue share',             value: MOCK_EARNINGS.revenueShare },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#5A7090' }}>{row.label}</span>
                <span className="text-xs font-black text-white">{row.value.toLocaleString()} UGX</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Bonus wagering progress ───────────────────────────────────── */}
        <div className={CARD} style={CARD_BG}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5A7090' }}>
              Active bonus {/* TODO: replace with real bonus from /api/bonuses/active */}
            </p>
            <Link href="/bonuses" className="text-[10px] font-semibold" style={{ color: '#F5A623' }}>
              Details
            </Link>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-black text-white">{MOCK_BONUS_WR.label}</span>
            <span className="text-sm font-black" style={{ color: '#F5A623' }}>
              {MOCK_BONUS_WR.amount.toLocaleString()} UGX
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ background: '#1A2332' }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${wrPct}%`,
                background: 'linear-gradient(90deg, #1A5C38, #3A9E67)',
                boxShadow: '0 0 8px rgba(58,158,103,0.5)',
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px]" style={{ color: '#5A7090' }}>
              {MOCK_BONUS_WR.wagered.toLocaleString()} of {MOCK_BONUS_WR.target.toLocaleString()} UGX wagered
            </span>
            <span className="text-[10px] font-black" style={{ color: '#5DE898' }}>{wrPct}%</span>
          </div>
        </div>

        {/* ── 4. Referee pipeline table ────────────────────────────────────── */}
        <div className={CARD} style={CARD_BG}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5A7090' }}>
            Your referrals ({MOCK_REFEREES.length}) {/* TODO: replace with /api/affiliates/referrals */}
          </p>

          {MOCK_REFEREES.length === 0 ? (
            <p className="py-4 text-center text-sm" style={{ color: '#3A4A5A' }}>
              No referrals yet — share your link to get started
            </p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 pb-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#3A4A5A' }}>Player</span>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#3A4A5A' }}>Status</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-right" style={{ color: '#3A4A5A' }}>Joined</span>
              </div>
              {MOCK_REFEREES.map((ref) => (
                <div key={ref.id} className="grid grid-cols-3 gap-2 items-center py-1">
                  <span className="text-xs font-black text-white">{ref.id}</span>
                  <StatusBadge status={ref.status} />
                  <span className="text-xs text-right" style={{ color: '#5A7090' }}>{formatDate(ref.joinedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help text */}
        <div
          className="rounded-2xl border p-4"
          style={{ background: 'rgba(245,166,35,0.06)', borderColor: 'rgba(245,166,35,0.15)' }}
        >
          <p className="text-xs font-black text-white mb-1">How it works</p>
          <ol className="space-y-1 text-[11px] leading-relaxed" style={{ color: '#7A95B0' }}>
            <li>1. Share your unique link with friends</li>
            <li>2. They sign up and make their first deposit</li>
            <li>3. You both receive a 500% bonus on their deposit</li>
            <li>4. You keep earning revenue share on every bet they place</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
