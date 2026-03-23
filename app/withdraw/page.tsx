'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PAYMENT_METHODS } from '@/data/mockUser';

const QUICK_AMOUNTS = [50, 100, 200, 500];
type Step = 'method' | 'amount' | 'confirm' | 'success';

export default function WithdrawPage() {
  const { isLoggedIn, user } = useAuth();
  const [step, setStep] = useState<Step>('method');
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold">Sign in to withdraw</h2>
        <Link href="/login" className="mt-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-colors">Sign in</Link>
      </div>
    );
  }

  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;
  const amountNum = parseFloat(amount) || 0;
  const availableCash = user.cashBalance;

  const handleWithdraw = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Withdraw</h1>
        <p className="mt-1 text-sm text-white/40">Transfer your winnings to your bank or card</p>
      </div>

      {/* Balance */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-[#13141f] px-4 py-3">
          <p className="text-xs text-white/40 mb-0.5">Available to withdraw</p>
          <p className="text-lg font-bold text-white">€{availableCash.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#13141f] px-4 py-3">
          <p className="text-xs text-white/40 mb-0.5">Bonus balance</p>
          <p className="text-lg font-bold text-white/40">€{user.bonusBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* KYC notice */}
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
        <span className="text-emerald-400 mt-0.5">✓</span>
        <div>
          <p className="text-xs font-semibold text-emerald-400">Identity verified</p>
          <p className="text-xs text-white/40">Your account is fully verified. Withdrawals process in 1–3 business days.</p>
        </div>
      </div>

      {step === 'success' ? (
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
      ) : step === 'confirm' ? (
        <div className="rounded-2xl border border-white/10 bg-[#13141f] p-6 space-y-4">
          <h2 className="text-base font-semibold">Confirm withdrawal</h2>
          <div className="space-y-2 rounded-xl bg-white/5 p-4">
            {[
              { label: 'Amount', value: `€${amountNum.toFixed(2)}` },
              { label: 'To', value: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ''}` },
              { label: 'Processing time', value: '1–3 business days' },
              { label: 'Fees', value: 'None' },
              { label: 'Balance after', value: `€${(availableCash - amountNum).toFixed(2)}` },
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
      ) : step === 'amount' ? (
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
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-4 py-3 text-lg font-bold text-white placeholder-white/20 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <p className="mt-1.5 text-xs text-white/30">Min. €10 · Max. €{availableCash.toFixed(2)} (your available balance)</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.filter((a) => a <= availableCash).map((a) => (
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
      ) : (
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
                    : 'border-white/10 bg-white/5 hover:bg-white/8'
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
      )}
    </div>
  );
}
