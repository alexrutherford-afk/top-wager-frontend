'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import { detectUgandaCarrier, type UgandaCarrier } from '@/lib/ugandaCarrier';
import { MOCK_TRANSACTIONS, PAYMENT_METHODS } from '@/data/mockUser';

// ── Shared styles ─────────────────────────────────────────────────────────────
const INPUT = 'w-full rounded-xl border border-white/10 bg-[#1A2332] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#F5A623]/50 transition-colors';
const BTN_PRIMARY = 'w-full rounded-xl py-3.5 text-sm font-black text-[#0A0E14] transition-opacity hover:opacity-90';
const BTN_SECONDARY = 'flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors';

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

// ── Uganda Payment Methods card ───────────────────────────────────────────────

const CARRIER_STYLE: Record<UgandaCarrier, { bg: string; color: string; label: string }> = {
  MTN:    { bg: '#FFCC00', color: '#1a1a00', label: 'MTN Mobile Money' },
  Airtel: { bg: '#E40000', color: '#ffffff', label: 'Airtel Money'     },
};

function UgandaPaymentMethods({ phone }: { phone?: string }) {
  const carrier = phone ? detectUgandaCarrier(phone) : null;
  const carriers: UgandaCarrier[] = carrier ? [carrier] : ['MTN', 'Airtel'];

  return (
    <div className="px-4 pb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>
        Payment Methods
      </p>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#131B24' }}>
        {carriers.map((c, i) => {
          const s = CARRIER_STYLE[c];
          return (
            <div
              key={c}
              className={`flex items-center gap-4 px-4 py-4 ${i < carriers.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              {/* Carrier badge */}
              <div
                className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xs font-black"
                style={{ background: s.bg, color: s.color }}
              >
                {c}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{s.label}</p>
                <p className="text-xs" style={{ color: '#5A7090' }}>
                  {carrier ? 'Detected from your phone number' : 'Uganda Mobile Money'}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ background: 'rgba(93,232,152,0.12)', color: '#5DE898' }}
              >
                Active
              </span>
            </div>
          );
        })}

        {/* Deposit / Withdraw shortcuts */}
        <div className="flex gap-3 border-t border-white/[0.05] px-4 py-3">
          <Link
            href="/deposit"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-opacity hover:opacity-90"
            style={{ background: '#F5A623', color: '#0A0E14' }}
          >
            Deposit
          </Link>
          <Link
            href="/withdraw"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-white/70 hover:bg-white/5 transition-colors"
          >
            Withdraw
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Deposit tab ───────────────────────────────────────────────────────────────
function DepositTab() {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const amountNum = parseFloat(amount) || 0;
  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;

  const handleConfirm = async () => {
    setLoading(true);
    // TODO: Backend — POST /api/payments/deposit { methodId, amount, currency }
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') return (
    <div className="flex flex-col items-center py-10 text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(26,92,56,0.2)', border: '2px solid #2D7A50' }}>
        <span className="text-3xl">✅</span>
      </div>
      <h3 className="text-xl font-black text-white mb-1">Deposit successful!</h3>
      <p className="text-sm mb-1" style={{ color: '#7A95B0' }}>€{amountNum.toFixed(2)} added to your account</p>
      <p className="text-xs mb-6" style={{ color: '#5A7090' }}>via {method.label}{method.last4 ? ` •••• ${method.last4}` : ''}</p>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={() => { setStep('form'); setAmount(''); }} className={BTN_SECONDARY}>Deposit again</button>
        <Link href="/" className="flex-1 rounded-xl py-3 text-sm font-black text-center text-[#0A0E14]" style={{ background: '#F5A623' }}>Play now</Link>
      </div>
    </div>
  );

  if (step === 'confirm') return (
    <div className="space-y-4 p-4">
      <h3 className="font-black text-white">Confirm deposit</h3>
      <div className="rounded-xl p-4 space-y-2.5" style={{ background: '#1A2332' }}>
        {[
          { label: 'Amount', value: `€${amountNum.toFixed(2)}` },
          { label: 'Payment method', value: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ''}` },
          { label: 'Processing time', value: 'Instant' },
          { label: 'Fee', value: 'Free' },
        ].map((r) => (
          <div key={r.label} className="flex justify-between text-sm">
            <span style={{ color: '#5A7090' }}>{r.label}</span>
            <span className="font-semibold text-white">{r.value}</span>
          </div>
        ))}
      </div>
      {/* Bonus callout */}
      <div className="rounded-xl px-4 py-3 border" style={{ background: 'rgba(245,166,35,0.05)', borderColor: 'rgba(245,166,35,0.2)' }}>
        <p className="text-xs font-semibold" style={{ color: '#F5A623' }}>🎁 100% welcome bonus will be applied automatically</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep('form')} className={BTN_SECONDARY}>Back</button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 rounded-xl py-3 text-sm font-black text-[#0A0E14] disabled:opacity-50"
          style={{ background: '#F5A623' }}
        >
          {loading ? 'Processing…' : 'Confirm deposit'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 p-4">
      {/* Payment methods */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>Payment method</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setSelectedMethod(pm.id)}
              className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
              style={{
                background: selectedMethod === pm.id ? 'rgba(26,92,56,0.2)' : '#1A2332',
                borderColor: selectedMethod === pm.id ? '#2D7A50' : 'rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-xl">{pm.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{pm.label}</p>
                {pm.last4 && <p className="text-[10px]" style={{ color: '#5A7090' }}>•••• {pm.last4}</p>}
              </div>
              {selectedMethod === pm.id && <span className="ml-auto text-xs font-black" style={{ color: '#3A9E67' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>Amount</p>
        <div className="relative mb-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: '#5A7090' }}>€</span>
          <input
            type="number"
            min={10}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={INPUT + ' pl-8 text-lg font-black'}
          />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="rounded-lg py-2 text-xs font-bold transition-colors"
              style={{
                background: amount === String(a) ? '#F5A623' : '#1A2332',
                color: amount === String(a) ? '#0A0E14' : '#7A95B0',
                border: amount === String(a) ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              €{a}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs" style={{ color: '#5A7090' }}>Min. €10 · Max. €10,000</p>
      </div>

      {/* Promo code */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>Promo code (optional)</p>
        {/* TODO: Backend — validate promo code via POST /api/promos/validate */}
        <input type="text" placeholder="Enter promo code" className={INPUT} />
      </div>

      <button
        onClick={() => amountNum >= 10 && setStep('confirm')}
        disabled={amountNum < 10}
        className={BTN_PRIMARY + ' disabled:opacity-40'}
        style={{ background: '#F5A623' }}
      >
        Deposit €{amountNum > 0 ? amountNum.toFixed(2) : '0.00'}
      </button>
    </div>
  );
}

// ── Withdraw tab ──────────────────────────────────────────────────────────────
function WithdrawTab() {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const amountNum = parseFloat(amount) || 0;
  const available = user?.cashBalance ?? 0;
  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;

  const handleConfirm = async () => {
    setLoading(true);
    // TODO: Backend — POST /api/payments/withdraw { methodId, amount, currency }
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') return (
    <div className="flex flex-col items-center py-10 text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(26,92,56,0.2)', border: '2px solid #2D7A50' }}>
        <span className="text-3xl">✅</span>
      </div>
      <h3 className="text-xl font-black text-white mb-1">Withdrawal requested!</h3>
      <p className="text-sm mb-1" style={{ color: '#7A95B0' }}>€{amountNum.toFixed(2)} is being processed</p>
      <p className="text-xs mb-1" style={{ color: '#5A7090' }}>to {method.label}{method.last4 ? ` •••• ${method.last4}` : ''}</p>
      <p className="text-xs mb-6" style={{ color: '#5A7090' }}>Expected in 1–3 business days</p>
      <button onClick={() => { setStep('form'); setAmount(''); }} className="rounded-xl border border-white/10 px-6 py-2.5 text-sm text-white/60 hover:bg-white/5">
        Done
      </button>
    </div>
  );

  if (step === 'confirm') return (
    <div className="space-y-4 p-4">
      <h3 className="font-black text-white">Confirm withdrawal</h3>
      <div className="rounded-xl p-4 space-y-2.5" style={{ background: '#1A2332' }}>
        {[
          { label: 'Amount', value: `€${amountNum.toFixed(2)}` },
          { label: 'To', value: `${method.label}${method.last4 ? ` •••• ${method.last4}` : ''}` },
          { label: 'Processing time', value: '1–3 business days' },
          { label: 'Fee', value: 'Free' },
          { label: 'Balance after', value: `€${(available - amountNum).toFixed(2)}` },
        ].map((r) => (
          <div key={r.label} className="flex justify-between text-sm">
            <span style={{ color: '#5A7090' }}>{r.label}</span>
            <span className="font-semibold text-white">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep('form')} className={BTN_SECONDARY}>Back</button>
        <button onClick={handleConfirm} disabled={loading} className="flex-1 rounded-xl py-3 text-sm font-black text-[#0A0E14] disabled:opacity-50" style={{ background: '#F5A623' }}>
          {loading ? 'Processing…' : 'Confirm'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 p-4">
      {/* KYC status */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border" style={{ background: 'rgba(26,92,56,0.1)', borderColor: 'rgba(45,122,80,0.3)' }}>
        <span className="text-sm" style={{ color: '#3A9E67' }}>✓</span>
        <p className="text-xs font-semibold" style={{ color: '#3A9E67' }}>
          Identity verified · Withdrawals enabled
          {/* TODO: Backend — show real KYC status from /api/user/kyc */}
        </p>
      </div>

      {/* Withdraw to */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>Withdraw to</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setSelectedMethod(pm.id)}
              className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
              style={{
                background: selectedMethod === pm.id ? 'rgba(26,92,56,0.2)' : '#1A2332',
                borderColor: selectedMethod === pm.id ? '#2D7A50' : 'rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-xl">{pm.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{pm.label}</p>
                <p className="text-[10px]" style={{ color: '#5A7090' }}>
                  {pm.type === 'bank' ? '1–3 days' : pm.type === 'card' ? 'Up to 5 days' : 'Instant'}
                </p>
              </div>
              {selectedMethod === pm.id && <span className="ml-auto text-xs font-black" style={{ color: '#3A9E67' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>Amount</p>
          <p className="text-xs" style={{ color: '#5A7090' }}>Available: <span className="font-bold text-white">€{available.toFixed(2)}</span></p>
        </div>
        <div className="relative mb-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black" style={{ color: '#5A7090' }}>€</span>
          <input type="number" min={10} max={available} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={INPUT + ' pl-8 text-lg font-black'} />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[50, 100, 200].filter(a => a <= available).map((a) => (
            <button key={a} onClick={() => setAmount(String(a))} className="rounded-lg py-2 text-xs font-bold" style={{ background: amount === String(a) ? '#F5A623' : '#1A2332', color: amount === String(a) ? '#0A0E14' : '#7A95B0', border: '1px solid rgba(255,255,255,0.08)' }}>€{a}</button>
          ))}
          <button onClick={() => setAmount(String(available))} className="rounded-lg py-2 text-xs font-bold" style={{ background: amount === String(available) ? '#F5A623' : '#1A2332', color: amount === String(available) ? '#0A0E14' : '#7A95B0', border: '1px solid rgba(255,255,255,0.08)' }}>Max</button>
        </div>
        {amountNum > available && <p className="mt-1 text-xs text-red-400">Exceeds available balance</p>}
      </div>

      <button
        onClick={() => amountNum >= 10 && amountNum <= available && setStep('confirm')}
        disabled={amountNum < 10 || amountNum > available}
        className={BTN_PRIMARY + ' disabled:opacity-40'}
        style={{ background: '#F5A623' }}
      >
        Withdraw €{amountNum > 0 ? amountNum.toFixed(2) : '0.00'}
      </button>
    </div>
  );
}

// ── Transactions tab ──────────────────────────────────────────────────────────
const TX_ICON: Record<string, string> = { deposit: '⬇️', withdrawal: '⬆️', bonus: '🎁' };
const TX_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: '#3A9E67', bg: 'rgba(26,92,56,0.2)' },
  pending:   { label: 'Pending',   color: '#F5A623', bg: 'rgba(245,166,35,0.15)' },
  failed:    { label: 'Failed',    color: '#E84D1C', bg: 'rgba(232,77,28,0.15)' },
};

function TransactionsTab() {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'bonus'>('all');
  // TODO: Backend — fetch from GET /api/transactions?type=filter&page=1
  const list = MOCK_TRANSACTIONS.filter((t) => filter === 'all' || t.type === filter);

  return (
    <div className="p-4 space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'deposit', 'withdrawal', 'bonus'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors"
            style={{ background: filter === f ? '#F5A623' : '#1A2332', color: filter === f ? '#0A0E14' : '#5A7090', border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ background: '#131B24' }}>
        {list.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: '#5A7090' }}>No transactions found</div>
        ) : (
          list.map((tx, i) => {
            const s = TX_STATUS[tx.status];
            return (
              <div key={tx.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < list.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg" style={{ background: '#1A2332' }}>
                  {TX_ICON[tx.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tx.method}</p>
                  <p className="text-[10px]" style={{ color: '#5A7090' }}>
                    {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black ${tx.amount > 0 ? '' : 'text-white'}`} style={tx.amount > 0 ? { color: '#3A9E67' } : {}}>
                    {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type WalletTab = 'deposit' | 'withdraw' | 'transactions';

const TABS: { value: WalletTab; label: string; icon: string }[] = [
  { value: 'deposit',      label: 'Deposit',      icon: '⬇️' },
  { value: 'withdraw',     label: 'Withdraw',     icon: '⬆️' },
  { value: 'transactions', label: 'Transactions', icon: '📋' },
];

export default function WalletPage() {
  const { isLoggedIn, user } = useAuth();
  const { countryCode }      = useGeo();
  const [activeTab, setActiveTab] = useState<WalletTab>('deposit');

  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-black">Sign in to access your wallet</h2>
        <p className="text-sm" style={{ color: '#5A7090' }}>You need to be logged in to deposit, withdraw or view transactions.</p>
        <Link href="/login" className="mt-2 rounded-xl px-8 py-3 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117', minHeight: '100vh' }}>

      {/* Balance summary */}
      <div className="px-4 py-5" style={{ background: 'linear-gradient(180deg, #131B24, #0D1117)' }}>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>Total balance</p>
        <p className="text-4xl font-black text-white">
          €{(user.cashBalance + user.bonusBalance).toLocaleString("en-GB",{minimumFractionDigits:2})}
        </p>

        {/* Balance breakdown */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Cash',    value: `€${user.cashBalance.toFixed(2)}`,    color: 'text-white',       note: 'Withdrawable' },
            { label: 'Bonus',   value: `€${user.bonusBalance.toFixed(2)}`,   color: '',                 note: 'Wagering req.', gold: true },
            { label: 'Pending', value: `€${0..toFixed(2)}`, color: '',                 note: 'Processing', amber: true },
          ].map((b) => (
            <div key={b.label} className="rounded-xl p-3 border border-white/[0.06]" style={{ background: '#1A2332' }}>
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#5A7090' }}>{b.label}</p>
              <p className={`text-base font-black ${b.color}`} style={b.gold ? { color: '#F5A623' } : b.amber ? { color: '#F5A623', opacity: 0.7 } : {}}>
                {b.value}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: '#5A7090' }}>{b.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Uganda payment methods */}
      {countryCode === 'UG' && <UgandaPaymentMethods phone={user.phone} />}

      {/* Tab nav */}
      <div className="sticky top-0 z-10 flex border-b border-white/[0.06]" style={{ background: '#131B24' }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="flex flex-1 flex-col items-center gap-0.5 py-3 text-[11px] font-bold transition-colors"
            style={{
              color: activeTab === tab.value ? '#F5A623' : '#5A7090',
              borderBottom: activeTab === tab.value ? '2px solid #F5A623' : '2px solid transparent',
            }}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'deposit'      && <DepositTab />}
      {activeTab === 'withdraw'     && <WithdrawTab />}
      {activeTab === 'transactions' && <TransactionsTab />}
    </div>
  );
}
