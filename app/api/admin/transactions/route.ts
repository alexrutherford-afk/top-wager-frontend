/**
 * GET /api/admin/transactions
 *
 * Paginated, filterable transaction log.
 *
 * Query params:
 *   type        — deposit | withdrawal | game_debit | game_credit | bonus_credit | bonus_debit | manual_credit | manual_debit
 *   status      — pending | completed | failed | reversed
 *   player_id   — filter by player UUID
 *   from        — ISO date string (created_at >=)
 *   to          — ISO date string (created_at <=)
 *   page        — default 1
 *   limit       — default 50, max 200
 *
 * Accessible to: finance, operations, support, super_admin
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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(['finance', 'operations', 'support'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const playerId = searchParams.get('player_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const offset = (page - 1) * limit

  const supabase = getServiceClient()

  let query = supabase
    .from('transactions')
    .select(
      `id, player_id, type, amount, currency, status, provider,
       provider_reference, notes, created_at,
       profiles!transactions_player_id_fkey(email, full_name)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)
  if (playerId) query = query.eq('player_id', playerId)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    transactions: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}
