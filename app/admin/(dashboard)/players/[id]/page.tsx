import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { AdjustForm } from './_components/AdjustForm'

interface Props {
  params: Promise<{ id: string }>
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#5DE898', pending: '#F5A623', failed: '#E84D1C', reversed: '#7A95B0',
}
const TYPE_COLORS: Record<string, string> = {
  deposit: '#5DE898', withdrawal: '#F5A623', game_debit: '#60A5FA',
  game_credit: '#60A5FA', bonus_credit: '#A78BFA', bonus_debit: '#A78BFA',
  manual_credit: '#5DE898', manual_debit: '#E84D1C',
}

function fmt(date: string) {
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = getServiceClient()

  const [profileRes, walletRes, transactionsRes, bonusesRes, authUserRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('wallets').select('*').eq('player_id', id).single(),
    supabase.from('transactions').select('id, type, amount, currency, status, notes, created_at')
      .eq('player_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('player_bonuses')
      .select('id, type, amount, wagered_amount, wagering_requirement, status, expires_at')
      .eq('player_id', id).in('status', ['pending', 'active']).order('created_at', { ascending: false }),
    supabase.auth.admin.getUserById(id),
  ])

  if (profileRes.error || !profileRes.data) notFound()

  const profile = profileRes.data
  const wallet = walletRes.data
  const transactions = transactionsRes.data ?? []
  const bonuses = bonusesRes.data ?? []
  const email = authUserRes.data.user?.email ?? ''

  const CARD = 'rounded-2xl border border-white/[0.06] p-5'
  const LABEL = 'text-xs font-bold uppercase tracking-wide mb-0.5'
  const VAL = 'text-sm font-semibold text-white'

  return (
    <div className="p-6 space-y-5" style={{ background: '#0D1117', minHeight: '100vh' }}>

      <Link href="/admin/players" className="text-xs font-semibold" style={{ color: '#5A7090' }}>
        ← Players
      </Link>

      <div>
        <h1 className="text-xl font-black text-white">{profile.full_name || 'Unnamed player'}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#7A95B0' }}>{email}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Profile */}
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: '#5A7090' }}>Profile</p>
          <div className="space-y-3">
            {[
              { label: 'Phone', val: profile.phone || '—' },
              { label: 'Currency', val: profile.currency },
              { label: 'Date of Birth', val: profile.date_of_birth || '—' },
              { label: 'KYC Status', val: profile.kyc_status.replace('_', ' ') },
              { label: 'VIP Level', val: String(profile.vip_level) },
              { label: 'Joined', val: fmt(profile.created_at) },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className={LABEL} style={{ color: '#5A7090' }}>{label}</p>
                <p className={VAL}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet */}
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: '#5A7090' }}>Wallet</p>
          {wallet ? (
            <div className="space-y-4">
              {[
                { label: 'Cash Balance', val: Number(wallet.cash_balance).toLocaleString(), color: '#5DE898' },
                { label: 'Bonus Balance', val: Number(wallet.bonus_balance).toLocaleString(), color: '#A78BFA' },
                { label: 'Pending Withdrawal', val: Number(wallet.pending_withdrawal).toLocaleString(), color: '#F5A623' },
              ].map(({ label, val, color }) => (
                <div key={label}>
                  <p className={LABEL} style={{ color: '#5A7090' }}>{label}</p>
                  <p className="text-xl font-black" style={{ color }}>{val} {profile.currency}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#5A7090' }}>No wallet found</p>
          )}
        </div>

        {/* Manual Adjustment */}
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: '#5A7090' }}>Manual Adjustment</p>
          <AdjustForm playerId={id} />
        </div>

      </div>

      {/* Active Bonuses */}
      {bonuses.length > 0 && (
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: '#5A7090' }}>Active Bonuses</p>
          <div className="space-y-2">
            {bonuses.map((b: { id: string; type: string; amount: number; wagered_amount: number; wagering_requirement: number; status: string; expires_at: string | null }) => {
              const target = b.amount * b.wagering_requirement
              const pct = target > 0 ? Math.min(100, (b.wagered_amount / target) * 100) : 0
              return (
                <div key={b.id} className="rounded-xl border border-white/[0.06] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white capitalize">{b.type.replace('_', ' ')}</p>
                    <span className="text-xs font-bold capitalize" style={{ color: '#F5A623' }}>{b.status}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: '#5A7090' }}>
                    Wagered {Number(b.wagered_amount).toLocaleString()} / {target.toLocaleString()} ({pct.toFixed(0)}%)
                  </p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#A78BFA' }} />
                  </div>
                  {b.expires_at && (
                    <p className="text-xs mt-1.5" style={{ color: '#3A4A5A' }}>Expires {fmt(b.expires_at)}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className={CARD} style={{ background: '#131B24' }}>
        <p className="text-xs font-black uppercase tracking-wide mb-4" style={{ color: '#5A7090' }}>
          Recent Transactions
        </p>
        {transactions.length === 0 ? (
          <p className="text-sm" style={{ color: '#5A7090' }}>No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Date', 'Type', 'Amount', 'Status', 'Notes'].map(h => (
                    <th key={h} className="pb-2 text-left text-xs font-bold uppercase tracking-wide pr-4" style={{ color: '#5A7090' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: { id: string; type: string; amount: number; currency: string; status: string; notes: string | null; created_at: string }) => (
                  <tr key={t.id} className="border-b border-white/[0.04]">
                    <td className="py-2 text-xs whitespace-nowrap pr-4" style={{ color: '#5A7090' }}>{fmt(t.created_at)}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                        style={{ background: `${TYPE_COLORS[t.type] ?? '#7A95B0'}18`, color: TYPE_COLORS[t.type] ?? '#7A95B0' }}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-bold text-white whitespace-nowrap">
                      {Number(t.amount).toLocaleString()} {t.currency}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                        style={{ background: `${STATUS_COLORS[t.status] ?? '#7A95B0'}18`, color: STATUS_COLORS[t.status] ?? '#7A95B0' }}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2 text-xs max-w-[200px] truncate" style={{ color: '#5A7090' }} title={t.notes ?? ''}>
                      {t.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
