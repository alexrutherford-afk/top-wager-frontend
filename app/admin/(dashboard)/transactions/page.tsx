'use client'

import { useState, useEffect, useCallback } from 'react'

interface Transaction {
  id: string
  player_id: string
  type: string
  amount: number
  currency: string
  status: string
  provider: string | null
  provider_reference: string | null
  notes: string | null
  created_at: string
  profiles?: { email?: string; full_name?: string } | null
}

const TYPE_OPTS = ['', 'deposit', 'withdrawal', 'game_debit', 'game_credit', 'bonus_credit', 'bonus_debit', 'manual_credit', 'manual_debit']
const STATUS_OPTS = ['', 'pending', 'completed', 'failed', 'reversed']

const STATUS_COLORS: Record<string, string> = {
  completed: '#5DE898',
  pending: '#F5A623',
  failed: '#E84D1C',
  reversed: '#7A95B0',
}

const TYPE_COLORS: Record<string, string> = {
  deposit: '#5DE898',
  withdrawal: '#F5A623',
  game_debit: '#60A5FA',
  game_credit: '#60A5FA',
  bonus_credit: '#A78BFA',
  bonus_debit: '#A78BFA',
  manual_credit: '#5DE898',
  manual_debit: '#E84D1C',
}

function fmt(date: string) {
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const LIMIT = 50

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
    if (type) params.set('type', type)
    if (status) params.set('status', status)
    if (from) params.set('from', new Date(from).toISOString())
    if (to) params.set('to', new Date(to + 'T23:59:59').toISOString())

    const res = await fetch(`/api/admin/transactions?${params}`)
    const json = await res.json()
    setTransactions(json.transactions ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [type, status, from, to])

  useEffect(() => { setPage(1); load(1) }, [load])

  const SELECT = 'rounded-lg border border-white/10 bg-[#1A2332] px-3 py-2 text-sm text-white outline-none'
  const INPUT = 'rounded-lg border border-white/10 bg-[#1A2332] px-3 py-2 text-sm text-white outline-none'

  return (
    <div className="p-6" style={{ background: '#0D1117', minHeight: '100vh' }}>
      <div className="mb-5">
        <h1 className="text-xl font-black text-white">Transactions</h1>
        <p className="text-xs mt-0.5" style={{ color: '#5A7090' }}>{total.toLocaleString()} total</p>
      </div>

      {/* Help */}
      <div className="mb-4 rounded-xl border border-white/[0.06] px-4 py-2.5 text-xs" style={{ background: '#131B24', color: '#5A7090' }}>
        Filter by type, status, and date range. <span className="text-white font-semibold">manual_credit / manual_debit</span> are ops adjustments made from the Players page. <span className="text-white font-semibold">game_debit / game_credit</span> will appear once game integration is live.
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={type} onChange={e => setType(e.target.value)} className={SELECT}>
          <option value="">All types</option>
          {TYPE_OPTS.filter(Boolean).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className={SELECT}>
          <option value="">All statuses</option>
          {STATUS_OPTS.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={INPUT} placeholder="From" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className={INPUT} placeholder="To" />
        <button
          onClick={() => { setType(''); setStatus(''); setFrom(''); setTo('') }}
          className="rounded-lg px-3 py-2 text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#7A95B0' }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#131B24' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Date', 'Player', 'Type', 'Amount', 'Status', 'Provider', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#5A7090' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#5A7090' }}>Loading…</td></tr>
              )}
              {!loading && transactions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#5A7090' }}>No transactions found</td></tr>
              )}
              {!loading && transactions.map(t => (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#7A95B0' }}>{fmt(t.created_at)}</td>
                  <td className="px-4 py-3 text-xs max-w-[140px] truncate" style={{ color: '#7A95B0' }}>
                    {t.profiles?.email || t.player_id.slice(0, 8) + '…'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-bold" style={{ background: `${TYPE_COLORS[t.type] ?? '#7A95B0'}18`, color: TYPE_COLORS[t.type] ?? '#7A95B0' }}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white whitespace-nowrap">
                    {Number(t.amount).toLocaleString()} {t.currency}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-bold" style={{ background: `${STATUS_COLORS[t.status] ?? '#7A95B0'}18`, color: STATUS_COLORS[t.status] ?? '#7A95B0' }}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#5A7090' }}>{t.provider ?? '—'}</td>
                  <td className="px-4 py-3 text-xs max-w-[180px] truncate" style={{ color: '#5A7090' }} title={t.notes ?? ''}>{t.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
            <p className="text-xs" style={{ color: '#5A7090' }}>
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setPage(p => p - 1); load(page - 1) }}
                disabled={page === 1}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#7A95B0' }}
              >
                Prev
              </button>
              <button
                onClick={() => { setPage(p => p + 1); load(page + 1) }}
                disabled={page * LIMIT >= total}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#7A95B0' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
