/**
 * GET /api/admin/players/[id]
 *
 * Full player detail: profile, wallet, recent transactions, active bonuses.
 *
 * Accessible to: operations, support, finance, super_admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(['operations', 'support', 'finance'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getServiceClient()

  const [profileRes, walletRes, transactionsRes, bonusesRes, authUserRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single(),

    supabase
      .from('wallets')
      .select('*')
      .eq('player_id', id)
      .single(),

    supabase
      .from('transactions')
      .select('id, type, amount, currency, status, provider, notes, created_at')
      .eq('player_id', id)
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('player_bonuses')
      .select('id, type, reward_type, amount, wagering_requirement, wagered_amount, status, created_at, expires_at')
      .eq('player_id', id)
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false }),

    supabase.auth.admin.getUserById(id),
  ])

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: profileRes.data,
    email: authUserRes.data.user?.email ?? '',
    wallet: walletRes.data,
    transactions: transactionsRes.data ?? [],
    bonuses: bonusesRes.data ?? [],
  })
}
