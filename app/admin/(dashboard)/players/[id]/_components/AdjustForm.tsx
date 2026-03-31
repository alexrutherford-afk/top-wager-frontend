'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  playerId: string
}

export function AdjustForm({ playerId }: Props) {
  const router = useRouter()
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit')
  const [balanceType, setBalanceType] = useState<'cash' | 'bonus'>('cash')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const SELECT = 'w-full rounded-lg border border-white/10 bg-[#1A2332] px-3 py-2 text-sm text-white outline-none'
  const INPUT = 'w-full rounded-lg border border-white/10 bg-[#1A2332] px-3 py-2 text-sm text-white outline-none placeholder-white/20'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('Enter a valid amount.')
      return
    }
    if (!reason.trim() || reason.trim().length < 3) {
      setError('Reason is required (min 3 characters).')
      return
    }

    setLoading(true)
    const res = await fetch(`/api/admin/players/${playerId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, balanceType, amount: amt, reason: reason.trim() }),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error ?? 'Adjustment failed.')
      return
    }

    setSuccess(`${direction === 'credit' ? 'Credited' : 'Debited'} ${amt.toLocaleString()} successfully.`)
    setAmount('')
    setReason('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg px-3 py-2.5 text-xs space-y-1" style={{ background: 'rgba(255,255,255,0.03)', color: '#5A7090' }}>
        <p><span className="font-semibold" style={{ color: '#7A95B0' }}>Credit</span> — adds funds to the player's balance.</p>
        <p><span className="font-semibold" style={{ color: '#7A95B0' }}>Debit</span> — removes funds. Will fail if balance is insufficient.</p>
        <p><span className="font-semibold" style={{ color: '#7A95B0' }}>Cash vs Bonus</span> — cash is real money. Bonus funds have wagering requirements attached.</p>
        <p style={{ color: '#3A4A5A' }}>Every adjustment is logged with your name, the amount, and the reason. Reason is required.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold" style={{ color: '#5A7090' }}>Direction</label>
          <select value={direction} onChange={e => setDirection(e.target.value as 'credit' | 'debit')} className={SELECT}>
            <option value="credit">Credit (+)</option>
            <option value="debit">Debit (−)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold" style={{ color: '#5A7090' }}>Balance</label>
          <select value={balanceType} onChange={e => setBalanceType(e.target.value as 'cash' | 'bonus')} className={SELECT}>
            <option value="cash">Cash</option>
            <option value="bonus">Bonus</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold" style={{ color: '#5A7090' }}>Amount</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          className={INPUT}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold" style={{ color: '#5A7090' }}>Reason (required)</label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Goodwill gesture, failed deposit correction…"
          className={INPUT}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
      )}
      {success && (
        <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs" style={{ color: '#5DE898' }}>{success}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-2.5 text-sm font-black disabled:opacity-50"
        style={{ background: direction === 'credit' ? '#1A5C38' : '#7C1A1A', color: 'white' }}
      >
        {loading ? 'Processing…' : `${direction === 'credit' ? 'Credit' : 'Debit'} balance`}
      </button>
    </form>
  )
}
