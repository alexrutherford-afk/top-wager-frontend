/**
 * POST /api/admin/players/[id]/adjust
 *
 * Manual balance adjustment. Logs the admin who made it and requires a reason.
 *
 * Body:
 *   direction   — 'credit' | 'debit'
 *   balanceType — 'cash' | 'bonus'
 *   amount      — positive number
 *   reason      — required text (logged in transactions.notes)
 *
 * Accessible to: operations, super_admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { credit, debit } from '@/lib/wallet'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let admin
  try {
    admin = await requireAdmin(['operations'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: playerId } = await params
  const body = await request.json()
  const { direction, balanceType, amount, reason } = body

  if (!direction || !['credit', 'debit'].includes(direction)) {
    return NextResponse.json({ error: 'direction must be credit or debit' }, { status: 400 })
  }
  if (!balanceType || !['cash', 'bonus'].includes(balanceType)) {
    return NextResponse.json({ error: 'balanceType must be cash or bonus' }, { status: 400 })
  }
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }
  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    return NextResponse.json({ error: 'reason is required (min 3 characters)' }, { status: 400 })
  }

  // Get player's currency for the transaction log
  const supabase = getServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', playerId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const type = direction === 'credit' ? 'manual_credit' : 'manual_debit'
  const fn = direction === 'credit' ? credit : debit

  const result = await fn({
    playerId,
    amount,
    currency: profile.currency,
    type,
    balanceType,
    notes: `Manual ${direction} by admin ${admin.email}: ${reason.trim()}`,
    operatedBy: admin.id,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, transactionId: result.transactionId, balance: result.balance })
}
