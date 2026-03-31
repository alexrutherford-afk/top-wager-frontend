/**
 * GET /api/banners?position=lobby_hero
 *
 * Public route — returns active banners for a given position.
 * Called by frontend pages to display banners.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const position = request.nextUrl.searchParams.get('position')

  if (!position) {
    return NextResponse.json({ error: 'position is required' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('banners')
    .select('id, title, image_url, link_url, position, sort_order')
    .eq('position', position)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banners: data ?? [] })
}
