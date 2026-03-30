/**
 * GET /api/admin/players
 *
 * Search and list players with wallet balances.
 *
 * Query params:
 *   q      — search email or full_name (case-insensitive)
 *   page   — default 1
 *   limit  — default 25, max 100
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

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(['operations', 'support', 'finance'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')))
  const offset = (page - 1) * limit

  const supabase = getServiceClient()

  // Profiles joined with wallets
  let query = supabase
    .from('profiles')
    .select(
      `id, full_name, email:id, currency, kyc_status, vip_level, created_at,
       wallets!wallets_player_id_fkey(cash_balance, bonus_balance, pending_withdrawal)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch emails from auth.users via the admin API
  // profiles.id = auth.users.id, but email is stored in auth.users not profiles
  // We return auth user emails separately via a service-role lookup
  const playerIds = (data ?? []).map(p => p.id)
  let emailMap: Record<string, string> = {}

  if (playerIds.length > 0) {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    emailMap = Object.fromEntries(
      (users ?? [])
        .filter(u => playerIds.includes(u.id))
        .map(u => [u.id, u.email ?? ''])
    )
  }

  const players = (data ?? []).map(p => ({
    ...p,
    email: emailMap[p.id] ?? '',
    wallet: Array.isArray(p.wallets) ? p.wallets[0] : p.wallets,
  }))

  return NextResponse.json({ players, total: count ?? 0, page, limit })
}
