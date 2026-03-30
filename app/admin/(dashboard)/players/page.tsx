'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Player {
  id: string
  full_name: string | null
  email: string
  currency: string
  kyc_status: string
  vip_level: number
  created_at: string
  wallet?: {
    cash_balance: number
    bonus_balance: number
    pending_withdrawal: number
  } | null
}

const KYC_COLORS: Record<string, string> = {
  not_submitted: '#5A7090',
  pending: '#F5A623',
  verified: '#5DE898',
  rejected: '#E84D1C',
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')

  const LIMIT = 25

  const load = useCallback(async (p = 1, query = search) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
    if (query) params.set('q', query)
    const res = await fetch(`/api/admin/players?${params}`)
    const json = await res.json()
    setPlayers(json.players ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [search])

  useEffect(() => { load(1) }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(q)
    setPage(1)
    load(1, q)
  }

  return (
    <div className="p-6" style={{ background: '#0D1117', minHeight: '100vh' }}>
      <div className="mb-5">
        <h1 className="text-xl font-black text-white">Players</h1>
        <p className="text-xs mt-0.5" style={{ color: '#5A7090' }}>{total.toLocaleString()} total</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search name or phone…"
          className="flex-1 max-w-sm rounded-lg border border-white/10 bg-[#1A2332] px-3 py-2 text-sm text-white outline-none placeholder-white/20"
        />
        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-sm font-bold"
          style={{ background: '#1A5C38', color: 'white' }}
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setQ(''); setSearch(''); setPage(1); load(1, '') }}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#7A95B0' }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#131B24' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Email', 'Cash Balance', 'Currency', 'KYC', 'VIP', 'Joined', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#5A7090' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: '#5A7090' }}>Loading…</td></tr>
              )}
              {!loading && players.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: '#5A7090' }}>No players found</td></tr>
              )}
              {!loading && players.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{p.full_name || '—'}</td>
                  <td className="px-4 py-3 text-xs max-w-[180px] truncate" style={{ color: '#7A95B0' }}>{p.email}</td>
                  <td className="px-4 py-3 font-bold text-white">
                    {p.wallet ? Number(p.wallet.cash_balance).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#7A95B0' }}>{p.currency}</td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-bold capitalize"
                      style={{ background: `${KYC_COLORS[p.kyc_status] ?? '#5A7090'}18`, color: KYC_COLORS[p.kyc_status] ?? '#5A7090' }}>
                      {p.kyc_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-center" style={{ color: '#7A95B0' }}>{p.vip_level}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#5A7090' }}>{fmt(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/players/${p.id}`}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#7A95B0' }}
                    >
                      View
                    </Link>
                  </td>
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
                onClick={() => { const p = page - 1; setPage(p); load(p) }}
                disabled={page === 1}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#7A95B0' }}
              >
                Prev
              </button>
              <button
                onClick={() => { const p = page + 1; setPage(p); load(p) }}
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
