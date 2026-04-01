'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import { detectUgandaCarrier, type UgandaCarrier } from '@/lib/ugandaCarrier';
import { PAYMENT_METHODS } from '@/data/mockUser';

// ── Preset amounts per currency ───────────────────────────────────────────────
const PRESET_AMOUNTS: Record<string, number[]> = {
  UGX: [5_000, 10_000, 20_000, 50_000],
  KES: [200, 500, 1_000, 2_000],
  MWK: [2_000, 5_000, 10_000, 20_000],
  TZS: [2_000, 5_000, 10_000, 20_000],
  ZMW: [20, 50, 100, 200],
};
const DEFAULT_PRESETS = [2, 5, 10, 20]; // USD fallback

// ── Bonus caps per currency (500% match) ─────────────────────────────────────
const BONUS_CAPS: Record<string, number> = {
  UGX: 2_000_000,
  KES: 50_000,
  MWK: 1_000_000,
  TZS: 1_000_000,
  ZMW: 5_000,
  USD: 15,
  EUR: 500,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  UGX: 'USh ', KES: 'KSh ', MWK: 'MK ', TZS: 'TSh ', ZMW: 'K', USD: '$', EUR: '€',
};

// ── Bonus math display ────────────────────────────────────────────────────────
function BonusMath({ amount, currency }: { amount: number; currency: string }) {
  const cap    = BONUS_CAPS[currency] ?? 15;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '';
  const bonusAmount = Math.min(amount * 5, cap);
  const total       = amount + bonusAmount;
  const capped      = amount * 5 > cap;

  if (amount <= 0) return null;

  const fmt = (n: number) => `${symbol}${n.toLocaleString()}`;

  return (
    <div
      className="rounded-xl border p-3 space-y-1.5"
      style={{ borderColor: 'rgba(58,158,103,0.25)', background: 'rgba(26,92,56,0.08)' }}
    >
      <div className="flex justify-between text-sm">
        <span style={{ color: '#7A95B0' }}>Deposit</span>
        <span className="font-bold text-white">{fmt(amount)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span style={{ color: '#7A95B0' }}>Your bonus</span>
        <span className="font-bold" style={{ color: '#5DE898' }}>{fmt(bonusAmount)}</span>
      </div>
      <div className="flex justify-between border-t border-white/[0.06] pt-1.5">
        <span className="text-sm font-black text-white">Total balance</span>
        <span className="text-base font-black" style={{ color: '#F5A623' }}>{fmt(total)}</span>
      </div>
      {capped && (
        <p className="text-[10px]" style={{ color: '#5A7090' }}>
          Bonus capped at {fmt(cap)}. Additional deposit goes to your cash balance.
        </p>
      )}
    </div>
  );
}

// ── Trust signals ─────────────────────────────────────────────────────────────
function TrustSignals() {
  return (
    <div className="flex items-center justify-between gap-1 py-2">
      {[
        { icon: '🔒', label: 'Secure payment' },
        { icon: '🛡️', label: 'Licensed & regulated' },
        { icon: '✓', label: 'Instant deposit' },
      ].map((t) => (
        <div key={t.label} className="flex items-center gap-1">
          <span className="text-[11px]">{t.icon}</span>
          <span className="text-[9px] font-semibold" style={{ color: '#5A7090' }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Uganda MoMo deposit ───────────────────────────────────────────────────────
type MomoStep = 'form' | 'processing' | 'success';

function UgandaDeposit({
  user,
  showBonusMath,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  showBonusMath: boolean;
}) {
  const detectedCarrier = user.phone ? detectUgandaCarrier(user.phone) : null;
  const [carrier, setCarrier] = useState<UgandaCarrier | null>(detectedCarrier);
  const [phone, setPhone]     = useState(user.phone ?? '');
  const [amount, setAmount]   = useState('');
  const [step, setStep]       = useState<MomoStep>('form');

  const amountNum = parseInt(amount, 10) || 0;
  const isValid   = carrier !== null && phone.trim().length >= 9 && amountNum >= 1_000 && amountNum <= 5_000_000;
  const presets   = PRESET_AMOUNTS.UGX;

  const handleSubmit = async () => {
    setStep('processing');
    // TODO: Backend — POST /api/payments/momo-deposit { carrier, phone, amount, playerId: user.id }
    // MTN:    Collection API — https://momodeveloper.mtn.com/docs
    // Airtel: Airtel Money API — https://developers.airtel.africa/payment
    await new Promise((r) => setTimeout(r, 1800));
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ borderColor: 'rgba(93,232,152,0.2)', background: 'rgba(26,92,56,0.08)' }}
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(26,92,56,0.2)', border: '2px solid #2D7A50' }}
        >
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="mb-2 text-xl font-black text-white">Deposit initiated!</h2>
        <p className="mb-1 text-sm" style={{ color: '#7A95B0' }}>
          You'll receive a push prompt on your phone shortly
        </p>
        <p className="mb-1 text-xs" style={{ color: '#5A7090' }}>{carrier} Mobile Money · {phone}</p>
        <p className="mb-6 text-xs" style={{ color: '#5A7090' }}>Amount: USh {amountNum.toLocaleString()}</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep('form'); setAmount(''); }}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
          >
            Deposit again
          </button>
          <Link
            href="/"
            className="flex-1 rounded-xl py-3 text-sm font-black text-center transition-opacity hover:opacity-90"
            style={{ background: '#F5A623', color: '#0A0E14' }}
          >
            Play now
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10"
          style={{ borderTopColor: '#F5A623' }}
        />
        <p className="text-sm font-semibold text-white">Processing…</p>
        <p className="mt-1 text-xs" style={{ color: '#5A7090' }}>Initiating your deposit</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 space-y-5 p-6" style={{ background: '#131B24' }}>
      {/* Carrier selection */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>
          Mobile Money Network
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['MTN', 'Airtel'] as UgandaCarrier[]).map((c) => (
            <button
              key={c}
              onClick={() => setCarrier(c)}
              className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors"
              style={{
                borderColor: carrier === c ? (c === 'MTN' ? '#FFCC00' : '#E40000') : 'rgba(255,255,255,0.1)',
                background:  carrier === c ? (c === 'MTN' ? 'rgba(255,204,0,0.08)' : 'rgba(228,0,0,0.08)') : '#1A2332',
              }}
            >
              <div
                className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black"
                style={{ background: c === 'MTN' ? '#FFCC00' : '#E40000', color: c === 'MTN' ? '#1a1a00' : '#fff' }}
              >
                {c}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{c === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'}</p>
                <p className="text-xs" style={{ color: '#5A7090' }}>Instant</p>
              </div>
              {carrier === c && (
                <span className="ml-auto text-xs font-black" style={{ color: c === 'MTN' ? '#FFCC00' : '#E40000' }}>✓</span>
              )}
            </button>
          ))}
        </div>
        {detectedCarrier && (
          <p className="mt-2 text-xs" style={{ color: '#3A9E67' }}>Auto-detected from your registered phone number</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>
          Mobile Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+256 7XX XXX XXX"
          className="w-full rounded-xl border border-white/10 bg-[#1A2332] px-4 py-3 text-base text-white placeholder-white/20 outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>
          Amount (UGX)
        </label>
        <div className="relative mb-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: '#5A7090' }}>
            USh
          </span>
          <input
            type="number"
            min={1_000}
            max={5_000_000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-[#1A2332] pl-14 pr-4 py-3 text-base font-black text-white placeholder-white/20 outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mb-1.5">
          {presets.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="rounded-lg py-2 text-[11px] font-bold transition-colors"
              style={{
                background: amount === String(a) ? '#F5A623' : '#1A2332',
                color:      amount === String(a) ? '#0A0E14' : '#7A95B0',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {a >= 1_000 ? `${a / 1_000}K` : a}
            </button>
          ))}
        </div>
        <p className="mb-3 text-xs" style={{ color: '#5A7090' }}>Min. USh 1,000 · Max. USh 5,000,000</p>

        {showBonusMath && <BonusMath amount={amountNum} currency="UGX" />}
      </div>

      <TrustSignals />

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full rounded-xl py-3.5 text-sm font-black disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: '#F5A623', color: '#0A0E14' }}
      >
        Deposit USh {amountNum > 0 ? amountNum.toLocaleString() : '0'}
      </button>
    </div>
  );
}

// ── Standard deposit (non-UG) ─────────────────────────────────────────────────
type DepositStep = 'method' | 'amount' | 'confirm' | 'success';

function StandardDeposit({
  user,
  showBonusMath,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  showBonusMath: boolean;
}) {
  const [step, setStep]                     = useState<DepositStep>('method');
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [amount, setAmount]                 = useState('');
  const [loading, setLoading]               = useState(false);

  const method    = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;
  const amountNum = parseFloat(amount) || 0;
  const currency  = user.currency || 'USD';
  const presets   = PRESET_AMOUNTS[currency] ?? DEFAULT_PRESETS;
  const symbol    = CURRENCY_SYMBOLS[currency] ?? '';

  const handleDeposit = async () => {
    setLoading(true);
    // TODO: Backend — POST /api/payments/deposit { methodId, amount, currency: user.currency }
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Deposit successful!</h2>
        <p className="text-white/50 text-sm mb-1">
          {symbol}{amountNum.toFixed(2)} has been added to your account
        </p>
        <p className="text-white/30 text-xs mb-6">
          via {method.label}{method.last4 ? ` •••• ${method.last4}` : ''}
        </p>
        <div className="flex gap-3">
          <Link href="/wallet" className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/70 hover:bg-white/5 text-center transition-colors">
            View wallet
          </Link>
          <Link href="/" className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 text-center transition-colors">
            Play now
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#13141f] p-6 space-y-4">
        <h2 className="text-base font-semibold">Confirm deposit</h2>
        <div className="space-y-2 rounded-xl bg-white/5 p-4">
          {[
            { label: 'Amount',          value: `${symbol}${amountNum.toFixed(2)}` },
            { label: 'Method',          value: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ''}` },
            { label: 'Processing time', value: 'Instant' },
            { label: 'Fees',            value: 'None' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-white/40">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-400 font-medium">
            🎁 500% match bonus up to {symbol}{(BONUS_CAPS[currency] ?? 15).toLocaleString()} will be applied automatically
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setStep('amount')}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Processing…' : 'Confirm deposit'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'amount') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#13141f] p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span>{method.icon}</span>
          <span>{method.label}{method.last4 ? ` •••• ${method.last4}` : ''}</span>
          <button onClick={() => setStep('method')} className="ml-auto text-xs text-amber-400 hover:underline">
            Change
          </button>
        </div>

        {/* Amount input */}
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Deposit amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/50">{symbol || '$'}</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-base font-bold text-white placeholder-white/20 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Preset chips */}
        <div className="grid grid-cols-4 gap-2">
          {presets.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="rounded-lg py-2 text-[11px] font-semibold transition-colors"
              style={{
                background:  amount === String(a) ? '#F5A623' : '#1A2332',
                color:       amount === String(a) ? '#0A0E14' : '#7A95B0',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {symbol}{a >= 1_000 ? `${(a / 1_000).toFixed(a % 1_000 === 0 ? 0 : 1)}k` : a}
            </button>
          ))}
        </div>

        {showBonusMath && <BonusMath amount={amountNum} currency={currency} />}

        <TrustSignals />

        <button
          onClick={() => amountNum >= 1 && setStep('confirm')}
          disabled={amountNum < 1}
          className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 transition-colors"
        >
          Continue — Deposit {symbol}{amountNum > 0 ? amountNum.toFixed(2) : '0.00'}
        </button>
      </div>
    );
  }

  // method step
  return (
    <div className="rounded-2xl border border-white/10 bg-[#13141f] p-6 space-y-4">
      <h2 className="text-base font-semibold">Select payment method</h2>
      <div className="space-y-2">
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.id}
            onClick={() => setSelectedMethod(pm.id)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
              selectedMethod === pm.id
                ? 'border-amber-500/50 bg-amber-500/5'
                : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
            }`}
          >
            <span className="text-2xl">{pm.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{pm.label}{pm.last4 ? ` •••• ${pm.last4}` : ''}</p>
              <p className="text-xs text-white/40">{pm.type === 'card' || pm.type === 'wallet' ? 'Instant' : '1–3 days'}</p>
            </div>
            {selectedMethod === pm.id && <span className="text-amber-400 text-sm">✓</span>}
          </button>
        ))}
      </div>
      <button
        onClick={() => setStep('amount')}
        className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}

// ── Welcome banner ────────────────────────────────────────────────────────────
function WelcomeBanner({ currency, onDismiss }: { currency: string; onDismiss: () => void }) {
  const cap    = BONUS_CAPS[currency] ?? 15;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '';
  return (
    <div
      className="relative mb-5 rounded-2xl border p-4"
      style={{ borderColor: 'rgba(245,166,35,0.3)', background: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(26,92,56,0.1))' }}
    >
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-sm font-black"
        style={{ background: 'rgba(0,0,0,0.3)', color: '#5A7090' }}
        aria-label="Dismiss"
      >
        ×
      </button>
      <p className="text-base font-black text-white pr-8">Deposit now to activate your 500% bonus</p>
      <p className="mt-1 text-xs" style={{ color: '#7A95B0' }}>
        The more you deposit, the bigger your bonus — up to {symbol}{cap.toLocaleString()}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DepositPage() {
  const { isLoggedIn, user } = useAuth();
  const { countryCode }      = useGeo();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === '1') {
      const dismissed = sessionStorage.getItem('tw_welcome_deposit_dismissed');
      if (!dismissed) setShowWelcomeBanner(true);
    }
  }, []);

  const dismissWelcomeBanner = () => {
    sessionStorage.setItem('tw_welcome_deposit_dismissed', '1');
    setShowWelcomeBanner(false);
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold">Sign in to deposit</h2>
        <Link href="/login" className="mt-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-colors">
          Sign in
        </Link>
      </div>
    );
  }

  const isUganda      = countryCode === 'UG';
  const showBonusMath = !user.hasDeposited;
  const currency      = user.currency || (isUganda ? 'UGX' : 'USD');
  const symbol        = CURRENCY_SYMBOLS[currency] ?? '';

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Deposit</h1>
        <p className="mt-1 text-sm text-white/40">Add funds to your account instantly</p>
      </div>

      {/* Welcome banner (first visit after registration) */}
      {showWelcomeBanner && (
        <WelcomeBanner currency={currency} onDismiss={dismissWelcomeBanner} />
      )}

      {/* Balance reminder */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#13141f] px-4 py-3">
        <span className="text-sm text-white/50">Current balance</span>
        <span className="font-bold text-amber-400">
          {symbol}{user.cashBalance.toLocaleString()}
        </span>
      </div>

      {isUganda
        ? <UgandaDeposit user={user} showBonusMath={showBonusMath} />
        : <StandardDeposit user={user} showBonusMath={showBonusMath} />
      }
    </div>
  );
}
