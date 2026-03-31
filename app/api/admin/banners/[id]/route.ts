/**
 * PATCH  /api/admin/banners/[id]  — update (toggle active, change sort order)
 * DELETE /api/admin/banners/[id]  — delete banner + image from Storage
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(['content_manager'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // Only allow safe fields to be updated
  const allowed = ['title', 'link_url', 'position', 'is_active', 'sort_order', 'market_scope']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ banner: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(['content_manager'])
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getServiceClient()

  // Get image URL before deleting so we can remove from Storage
  const { data: banner } = await supabase
    .from('banners')
    .select('image_url')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Remove from Storage if it's a Supabase Storage URL
  if (banner?.image_url) {
    const url = banner.image_url as string
    const match = url.match(/\/storage\/v1\/object\/public\/banners\/(.+)/)
    if (match) {
      await supabase.storage.from('banners').remove([match[1]])
    }
  }

  return NextResponse.json({ success: true })
}
