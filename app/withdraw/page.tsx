'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import { detectUgandaCarrier, type UgandaCarrier } from '@/lib/ugandaCarrier';
import { PAYMENT_METHODS } from '@/data/mockUser';

// ── Uganda MoMo withdraw ──────────────────────────────────────────────────────

const UGX_QUICK = [5_000, 10_000, 50_000, 100_000, 500_000];
type MomoStep = 'form' | 'processing' | 'success';

function UgandaWithdraw({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const detectedCarrier = user.phone ? detectUgandaCarrier(user.phone) : null;
  const [carrier, setCarrier] = useState<UgandaCarrier | null>(detectedCarrier);
  const [phone, setPhone]     = useState(user.phone ?? '');
  const [amount, setAmount]   = useState('');
  const [step, setStep]       = useState<MomoStep>('form');

  const amountNum  = parseInt(amount, 10) || 0;
  const available  = user.cashBalance;
  const isValid    = carrier !== null && phone.trim().length >= 9 && amountNum >= 1_000 && amountNum <= 5_000_000 && amountNum <= available;

  const handleSubmit = async () => {
    setStep('processing');
    // TODO: Backend — POST /api/payments/momo-withdraw { carrier, phone, amount, playerId: user.id }
    // Check wallet cash_balance >= amount before initiating (server-side guard).
    // MTN:   Disbursement API — https://momodeveloper.mtn.com/docs
    //        Env vars: MTN_MOMO_SUBSCRIPTION_KEY, MTN_MOMO_API_USER, MTN_MOMO_API_KEY, MTN_MOMO_ENV
    // Airtel: Airtel Money withdrawal API — https://developers.airtel.africa/payment
    //        Env vars: AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET, AIRTEL_ENV
    // Deduct pending_withdrawal from wallet on initiation; confirm on webhook/callback.
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
        <h2 className="mb-2 text-xl font-black text-white">Withdrawal initiated!</h2>
        <p className="mb-1 text-sm" style={{ color: '#7A95B0' }}>
          Funds arrive within 24 hours
        </p>
        <p className="mb-1 text-xs" style={{ color: '#5A7090' }}>
          {carrier} Mobile Money · {phone}
        </p>
        <p className="mb-6 text-xs" style={{ color: '#5A7090' }}>
          Amount: USh {amountNum.toLocaleString()}
        </p>
        <div className="flex gap-3">
          <Link href="/wallet" className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5 text-center transition-colors">
            View wallet
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl py-3 text-sm font-black text-center transition-opacity hover:opacity-90"
            style={{ background: '#F5A623', color: '#0A0E14' }}
          >
            Back to lobby
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
        <p className="mt-1 text-xs" style={{ color: '#5A7090' }}>Initiating your withdrawal</p>
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
                borderColor: carrier === c
                  ? (c === 'MTN' ? '#FFCC00' : '#E40000')
                  : 'rgba(255,255,255,0.1)',
                background: carrier === c
                  ? (c === 'MTN' ? 'rgba(255,204,0,0.08)' : 'rgba(228,0,0,0.08)')
                  : '#1A2332',
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
                <p className="text-xs" style={{ color: '#5A7090' }}>Within 24 hours</p>
              </div>
              {carrier === c && (
                <span className="ml-auto text-xs font-black" style={{ color: c === 'MTN' ? '#FFCC00' : '#E40000' }}>✓</span>
              )}
            </button>
          ))}
        </div>
        {detectedCarrier && (
          <p className="mt-2 text-xs" style={{ color: '#3A9E67' }}>
            Auto-detected from your registered phone number
          </p>
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>
            Amount (UGX)
          </label>
          <span className="text-xs" style={{ color: '#5A7090' }}>
            Available: <span className="font-bold text-white">USh {available.toLocaleString()}</span>
          </span>
        </div>
        <div className="relative mb-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: '#5A7090' }}>
            USh
          </span>
          <input
            type="number"
            min={1_000}
            max={Math.min(5_000_000, available)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-[#1A2332] pl-14 pr-4 py-3 text-base font-black text-white placeholder-white/20 outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-1.5">
          {UGX_QUICK.filter((a) => a <= available).map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="rounded-lg py-2 text-[10px] font-bold transition-colors"
              style={{
                background: amount === String(a) ? '#F5A623' : '#1A2332',
                color:      amount === String(a) ? '#0A0E14' : '#7A95B0',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {a >= 1_000 ? `${a / 1_000}K` : a}
            </button>
          ))}
          <button
            onClick={() => setAmount(String(available))}
            className="rounded-lg py-2 text-[10px] font-bold transition-colors"
            style={{
              background: amount === String(available) ? '#F5A623' : '#1A2332',
              color:      amount === String(available) ? '#0A0E14' : '#7A95B0',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Max
          </button>
        </div>
        {amountNum > available && (
          <p className="text-xs text-red-400">Amount exceeds your available balance</p>
        )}
        <p className="text-xs" style={{ color: '#5A7090' }}>Min. USh 1,000 · Max. USh 5,000,000</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full rounded-xl py-3.5 text-sm font-black disabled:opacity-40 transition-opacity hover:opacity-90"
        style={{ background: '#F5A623', color: '#0A0E14' }}
      >
        Withdraw USh {amountNum > 0 ? amountNum.toLocaleString() : '0'}
      </button>
    </div>
  );
}

// ── Standard withdraw (non-UG) ────────────────────────────────────────────────

const EUR_QUICK = [50, 100, 200, 500];
type WithdrawStep = 'method' | 'amount' | 'confirm' | 'success';

function StandardWithdraw({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const [step, setStep]                     = useState<WithdrawStep>('method');
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [amount, setAmount]                 = useState('');
  const [loading, setLoading]               = useState(false);

  const method       = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;
  const amountNum    = parseFloat(amount) || 0;
  const availableCash = user.cashBalance;

  const handleWithdraw = async () => {
    setLoading(true);
    // TODO: Backend — POST /api/payments/withdraw { methodId, amount, currency: user.currency }
    // Check wallet cash_balance >= amount before processing (server-side guard).
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Withdrawal requested!</h2>
        <p className="text-white/50 text-sm mb-1">€{amountNum.toFixed(2)} withdrawal is being processed</p>
        <p className="text-white/30 text-xs mb-1">to {method.label}{method.last4 ? ` •••• ${method.last4}` : ''}</p>
        <p className="text-white/30 text-xs mb-6">Expected: 1–3 business days</p>
        <div className="flex gap-3">
          <Link href="/wallet" className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/70 hover:bg-white/5 text-center transition-colors">View wallet</Link>
          <Link href="/" className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 text-center transition-colors">Back to lobby</Link>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#13141f] p-6 space-y-4">
        <h2 className="text-base font-semibold">Confirm withdrawal</h2>
        <div className="space-y-2 rounded-xl bg-white/5 p-4">
          {[
            { label: 'Amount',          value: `€${amountNum.toFixed(2)}` },
            { label: 'To',              value: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ''}` },
            { label: 'Processing time', value: '1–3 business days' },
            { label: 'Fees',            value: 'None' },
            { label: 'Balance after',   value: `€${(availableCash - amountNum).toFixed(2)}` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-white/40">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setStep('amount')} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">Back</button>
          <button onClick={handleWithdraw} disabled={loading} className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-60 transition-colors">
            {loading ? 'Processing…' : 'Confirm withdrawal'}
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
          <button onClick={() => setStep('method')} className="ml-auto text-xs text-amber-400 hover:underline">Change</button>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Withdrawal amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/50">€</span>
            <input
              type="number"
              min="10"
              max={availableCash}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-base font-bold text-white placeholder-white/20 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <p className="mt-1.5 text-xs text-white/30">Min. €10 · Max. €{availableCash.toFixed(2)} (your available balance)</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {EUR_QUICK.filter((a) => a <= availableCash).map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                amount === String(a) ? 'bg-amber-500 text-black' : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              €{a}
            </button>
          ))}
          <button
            onClick={() => setAmount(String(availableCash))}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
              amount === String(availableCash) ? 'bg-amber-500 text-black' : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Max
          </button>
        </div>
        {amountNum > availableCash && (
          <p className="text-xs text-red-400">Amount exceeds your available balance</p>
        )}
        <button
          onClick={() => amountNum >= 10 && amountNum <= availableCash && setStep('confirm')}
          disabled={amountNum < 10 || amountNum > availableCash}
          className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40 transition-colors"
        >
          Continue — Withdraw €{amountNum > 0 ? amountNum.toFixed(2) : '0.00'}
        </button>
      </div>
    );
  }

  // method step
  return (
    <div className="rounded-2xl border border-white/10 bg-[#13141f] p-6 space-y-4">
      <h2 className="text-base font-semibold">Withdraw to</h2>
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
              <p className="text-xs text-white/40">{pm.type === 'card' ? 'Up to 5 business days' : pm.type === 'bank' ? '1–3 business days' : 'Instant'}</p>
            </div>
            {selectedMethod === pm.id && <span className="text-amber-400 text-sm">✓</span>}
          </button>
        ))}
      </div>
      <button onClick={() => setStep('amount')} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-colors">
        Continue
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WithdrawPage() {
  const { isLoggedIn, user } = useAuth();
  const { countryCode }      = useGeo();

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold">Sign in to withdraw</h2>
        <Link href="/login" className="mt-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-colors">Sign in</Link>
      </div>
    );
  }

  const isUganda = countryCode === 'UG';

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Withdraw</h1>
        <p className="mt-1 text-sm text-white/40">
          {isUganda ? 'Transfer your winnings via Mobile Money' : 'Transfer your winnings to your bank or card'}
        </p>
      </div>

      {/* Balance */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-[#13141f] px-4 py-3">
          <p className="text-xs text-white/40 mb-0.5">Available to withdraw</p>
          <p className="text-lg font-bold text-white">
            {isUganda ? 'USh' : '€'}{user.cashBalance.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#13141f] px-4 py-3">
          <p className="text-xs text-white/40 mb-0.5">Bonus balance</p>
          <p className="text-lg font-bold text-white/40">
            {isUganda ? 'USh' : '€'}{user.bonusBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {isUganda ? <UgandaWithdraw user={user} /> : <StandardWithdraw user={user} />}
    </div>
  );
}
