/**
 * GET  /api/admin/banners  — list all banners
 * POST /api/admin/banners  — create a banner (image already uploaded to Storage, pass URL)
 *
 * Accessible to: content_manager, super_admin
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
    await requireAdmin(['content_manager'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banners: data ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['content_manager'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, image_url, link_url, position, market_scope, sort_order } = body

  if (!title || !image_url || !position) {
    return NextResponse.json(
      { error: 'title, image_url, and position are required' },
      { status: 400 }
    )
  }

  const VALID_POSITIONS = ['lobby_hero', 'lobby_promo', 'deposit_page']
  if (!VALID_POSITIONS.includes(position)) {
    return NextResponse.json(
      { error: `position must be one of: ${VALID_POSITIONS.join(', ')}` },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('banners')
    .insert({
      title,
      image_url,
      link_url: link_url || null,
      position,
      market_scope: market_scope || null,
      sort_order: sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banner: data }, { status: 201 })
}
