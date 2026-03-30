/**
 * GET  /api/admin/bonuses     — list all bonus templates
 * POST /api/admin/bonuses     — create a bonus template
 *
 * Accessible to: operations, super_admin
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
    await requireAdmin(['operations'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('bonus_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ templates: data ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['operations'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    name, trigger, trigger_amount, reward_type, reward_value, reward_max,
    wagering_requirement, game_restrictions, activation_expiry_hours,
    wagering_expiry_hours, max_withdrawal, min_deposit, market_scope,
  } = body

  if (!name || !trigger || !reward_type || reward_value == null || wagering_requirement == null) {
    return NextResponse.json(
      { error: 'name, trigger, reward_type, reward_value, wagering_requirement are required' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('bonus_templates')
    .insert({
      name, trigger, trigger_amount: trigger_amount ?? null,
      reward_type, reward_value, reward_max: reward_max ?? null,
      wagering_requirement, game_restrictions: game_restrictions ?? null,
      activation_expiry_hours: activation_expiry_hours ?? null,
      wagering_expiry_hours: wagering_expiry_hours ?? null,
      max_withdrawal: max_withdrawal ?? null,
      min_deposit: min_deposit ?? null,
      market_scope: market_scope ?? null,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ template: data }, { status: 201 })
}
