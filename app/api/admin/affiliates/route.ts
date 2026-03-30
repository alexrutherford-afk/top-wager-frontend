/**
 * GET  /api/admin/affiliates  — list all affiliates with attributed player count
 * POST /api/admin/affiliates  — create a new affiliate
 *
 * Accessible to: affiliate_manager, operations, super_admin
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

export async function GET() {
  try {
    await requireAdmin(['affiliate_manager', 'operations'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get player counts per affiliate
  const affiliateIds = (data ?? []).map(a => a.id)
  let playerCounts: Record<string, number> = {}

  if (affiliateIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('affiliate_id')
      .in('affiliate_id', affiliateIds)

    playerCounts = (profileRows ?? []).reduce<Record<string, number>>((acc, p) => {
      if (p.affiliate_id) acc[p.affiliate_id] = (acc[p.affiliate_id] ?? 0) + 1
      return acc
    }, {})
  }

  const affiliates = (data ?? []).map(a => ({
    ...a,
    player_count: playerCounts[a.id] ?? 0,
  }))

  return NextResponse.json({ affiliates })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['affiliate_manager', 'operations'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { code, name, email, revenue_share_pct, notes } = body

  if (!code || !name || revenue_share_pct == null) {
    return NextResponse.json(
      { error: 'code, name, and revenue_share_pct are required' },
      { status: 400 }
    )
  }

  if (revenue_share_pct < 0 || revenue_share_pct > 100) {
    return NextResponse.json({ error: 'revenue_share_pct must be 0–100' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('affiliates')
    .insert({
      code: code.toUpperCase().trim(),
      name,
      email: email ?? null,
      revenue_share_pct,
      notes: notes ?? null,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    const msg = error.code === '23505' ? 'Affiliate code already exists' : error.message
    return NextResponse.json({ error: msg }, { status: error.code === '23505' ? 409 : 500 })
  }

  return NextResponse.json({ affiliate: data }, { status: 201 })
}
