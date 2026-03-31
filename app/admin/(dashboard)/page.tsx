import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function startOf(period: 'day' | 'week' | 'month'): string {
  const d = new Date()
  if (period === 'day') { d.setHours(0, 0, 0, 0) }
  else if (period === 'week') { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0) }
  else { d.setDate(1); d.setHours(0, 0, 0, 0) }
  return d.toISOString()
}

function fmt(n: number, currency = '') {
  if (n >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${currency}${(n / 1_000).toFixed(1)}K`
  return `${currency}${n.toLocaleString()}`
}

export default async function AdminDashboard() {
  const supabase = getServiceClient()

  const [dep, depW, depM, wd, wdM, wdPending, newToday, totalPlayers, bonusLiability] =
    await Promise.all([
      supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'completed').gte('created_at', startOf('day')),
      supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'completed').gte('created_at', startOf('week')),
      supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'completed').gte('created_at', startOf('month')),
      supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'completed').gte('created_at', startOf('day')),
      supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'completed').gte('created_at', startOf('month')),
      supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'pending'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOf('day')),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('wallets').select('bonus_balance'),
    ])

  const sum = (rows: { amount: string | number }[] | null) =>
    (rows ?? []).reduce((a, r) => a + Number(r.amount), 0)

  const depositsTodayTotal = sum(dep.data)
  const depositsWeekTotal  = sum(depW.data)
  const depositsMonthTotal = sum(depM.data)
  const wdTodayTotal       = sum(wd.data)
  const wdMonthTotal       = sum(wdM.data)
  const wdPendingTotal     = sum(wdPending.data)
  const bonusTotal         = (bonusLiability.data ?? []).reduce((a, r) => a + Number(r.bonus_balance), 0)

  const ggrToday  = depositsTodayTotal - wdTodayTotal
  const ggrMonth  = depositsMonthTotal - wdMonthTotal

  const CARD = 'rounded-2xl border border-white/[0.06] p-5'
  const LABEL = 'text-xs font-bold uppercase tracking-wide mb-1'
  const BIG = 'text-2xl font-black text-white'
  const SUB = 'text-xs mt-1'

  return (
    <div className="p-6 space-y-6" style={{ background: '#0D1117', minHeight: '100vh' }}>
      <div>
        <h1 className="text-xl font-black text-white">Dashboard</h1>
        <p className="text-xs mt-0.5" style={{ color: '#5A7090' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* GGR Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#5A7090' }}>
          GGR (Deposits − Withdrawals)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className={CARD} style={{ background: '#131B24' }}>
            <p className={LABEL} style={{ color: '#5A7090' }}>Today</p>
            <p className={BIG} style={{ color: ggrToday >= 0 ? '#5DE898' : '#E84D1C' }}>
              {fmt(ggrToday)}
            </p>
            <p className={SUB} style={{ color: '#5A7090' }}>
              {dep.data?.length ?? 0} deposits · {wd.data?.length ?? 0} withdrawals
            </p>
          </div>
          <div className={CARD} style={{ background: '#131B24' }}>
            <p className={LABEL} style={{ color: '#5A7090' }}>This Month</p>
            <p className={BIG} style={{ color: ggrMonth >= 0 ? '#5DE898' : '#E84D1C' }}>
              {fmt(ggrMonth)}
            </p>
            <p className={SUB} style={{ color: '#5A7090' }}>
              {depM.data?.length ?? 0} deposits · {wdM.data?.length ?? 0} withdrawals
            </p>
          </div>
        </div>
      </div>

      {/* Deposits Row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#5A7090' }}>Deposits</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Today', total: depositsTodayTotal, count: dep.data?.length ?? 0 },
            { label: 'This Week', total: depositsWeekTotal, count: depW.data?.length ?? 0 },
            { label: 'This Month', total: depositsMonthTotal, count: depM.data?.length ?? 0 },
          ].map(s => (
            <div key={s.label} className={CARD} style={{ background: '#131B24' }}>
              <p className={LABEL} style={{ color: '#5A7090' }}>{s.label}</p>
              <p className={BIG}>{fmt(s.total)}</p>
              <p className={SUB} style={{ color: '#5A7090' }}>{s.count} transactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawals + Pending */}
      <div className="grid grid-cols-3 gap-3">
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className={LABEL} style={{ color: '#5A7090' }}>Withdrawals Today</p>
          <p className={BIG}>{fmt(wdTodayTotal)}</p>
          <p className={SUB} style={{ color: '#5A7090' }}>{wd.data?.length ?? 0} processed</p>
        </div>
        <div className={CARD} style={{ background: '#131B24', borderColor: wdPending.data?.length ? 'rgba(245,166,35,0.25)' : undefined }}>
          <p className={LABEL} style={{ color: '#5A7090' }}>Pending Withdrawals</p>
          <p className={BIG} style={{ color: wdPending.data?.length ? '#F5A623' : 'white' }}>
            {fmt(wdPendingTotal)}
          </p>
          <p className={SUB} style={{ color: '#5A7090' }}>{wdPending.data?.length ?? 0} awaiting</p>
        </div>
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className={LABEL} style={{ color: '#5A7090' }}>Bonus Liability</p>
          <p className={BIG}>{fmt(bonusTotal)}</p>
          <p className={SUB} style={{ color: '#5A7090' }}>active bonus balances</p>
        </div>
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-3">
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className={LABEL} style={{ color: '#5A7090' }}>Total Players</p>
          <p className={BIG}>{(totalPlayers.count ?? 0).toLocaleString()}</p>
          <p className={SUB} style={{ color: '#5A7090' }}>registered accounts</p>
        </div>
        <div className={CARD} style={{ background: '#131B24' }}>
          <p className={LABEL} style={{ color: '#5A7090' }}>New Today</p>
          <p className={BIG}>{newToday.count ?? 0}</p>
          <p className={SUB} style={{ color: '#5A7090' }}>registrations</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.04] px-4 py-2.5 text-xs" style={{ background: '#131B24', color: '#5A7090' }}>
        <span className="font-semibold" style={{ color: '#7A95B0' }}>GGR note:</span> currently shown as deposits minus withdrawals. This is a proxy until game integration is live, at which point it will be calculated from actual game rounds (total bets minus total wins).
      </div>
    </div>
  )
}
