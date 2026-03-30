/**
 * GET /api/admin/stats
 *
 * Returns aggregated dashboard stats.
 * Accessible to: finance, operations, super_admin
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
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
  if (period === 'day') {
    d.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0, 0, 0, 0)
  } else {
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
  }
  return d.toISOString()
}

export async function GET() {
  try {
    await requireAdmin(['finance', 'operations'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  const [
    depositsToday,
    depositsWeek,
    depositsMonth,
    withdrawalsToday,
    withdrawalsMonth,
    pendingWithdrawals,
    newPlayersToday,
    totalPlayers,
    bonusLiability,
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .gte('created_at', startOf('day')),

    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .gte('created_at', startOf('week')),

    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'deposit')
      .eq('status', 'completed')
      .gte('created_at', startOf('month')),

    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'withdrawal')
      .eq('status', 'completed')
      .gte('created_at', startOf('day')),

    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'withdrawal')
      .eq('status', 'completed')
      .gte('created_at', startOf('month')),

    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'withdrawal')
      .eq('status', 'pending'),

    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOf('day')),

    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('wallets')
      .select('bonus_balance'),
  ])

  const sum = (rows: { amount: string | number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + Number(r.amount), 0)

  const bonusLiabilityTotal = (bonusLiability.data ?? []).reduce(
    (acc, r) => acc + Number(r.bonus_balance),
    0
  )

  const depositsTodayTotal = sum(depositsToday.data)
  const depositsWeekTotal = sum(depositsWeek.data)
  const depositsMonthTotal = sum(depositsMonth.data)
  const withdrawalsTodayTotal = sum(withdrawalsToday.data)
  const withdrawalsMonthTotal = sum(withdrawalsMonth.data)
  const pendingWithdrawalsTotal = sum(pendingWithdrawals.data)
  const pendingWithdrawalsCount = pendingWithdrawals.data?.length ?? 0

  return NextResponse.json({
    deposits: {
      today: { total: depositsTodayTotal, count: depositsToday.data?.length ?? 0 },
      week: { total: depositsWeekTotal, count: depositsWeek.data?.length ?? 0 },
      month: { total: depositsMonthTotal, count: depositsMonth.data?.length ?? 0 },
    },
    withdrawals: {
      today: { total: withdrawalsTodayTotal, count: withdrawalsToday.data?.length ?? 0 },
      month: { total: withdrawalsMonthTotal, count: withdrawalsMonth.data?.length ?? 0 },
      pending: { total: pendingWithdrawalsTotal, count: pendingWithdrawalsCount },
    },
    // Proxy GGR: deposits - withdrawals (replace with game_rounds calc when games go live)
    ggr: {
      today: depositsTodayTotal - withdrawalsTodayTotal,
      month: depositsMonthTotal - withdrawalsMonthTotal,
    },
    players: {
      total: totalPlayers.count ?? 0,
      newToday: newPlayersToday.count ?? 0,
    },
    bonusLiability: bonusLiabilityTotal,
  })
}
