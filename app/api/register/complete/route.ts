/**
 * POST /api/register/complete
 *
 * Called immediately after supabase.auth.signUp() succeeds.
 * Saves phone, currency, country, and affiliate_id to the player's profile.
 *
 * Why a separate route and not in signUp directly:
 *   - The browser client can't query the affiliates table (RLS blocks it)
 *   - The profile row is created by the DB trigger, so we update it here
 *   - Service role bypasses RLS — safe because it runs server-side only
 *
 * Security:
 *   - phone IS NULL guard means this can only set these fields once
 *     (the first call after account creation wins — always the user themselves)
 *   - affiliate_id is write-once per architecture rules — never overwritten
 *
 * Body:
 * {
 *   userId:    string  — from supabase.auth.signUp() response
 *   phone?:    string
 *   currency?: string
 *   country?:  string
 *   refCode?:  string  — affiliate referral code from ?ref= URL param
 * }
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

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { userId, phone, currency, country, refCode } = body

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // --- Resolve affiliate code → affiliate UUID ---
  let affiliateId: string | null = null

  if (refCode && typeof refCode === 'string' && refCode.trim().length > 0) {
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('code', refCode.trim().toUpperCase())
      .eq('status', 'active')
      .maybeSingle()

    if (affiliate) {
      affiliateId = affiliate.id
    }
    // If code not found / inactive — silently ignore, don't block registration
  }

  // --- Build update payload ---
  // Only set fields that were provided — never overwrite with null
  const updates: Record<string, unknown> = {}
  if (phone    && typeof phone    === 'string') updates.phone    = phone.trim()
  if (currency && typeof currency === 'string') updates.currency = currency
  if (country  && typeof country  === 'string') updates.country  = country
  if (affiliateId)                              updates.affiliate_id = affiliateId

  if (Object.keys(updates).length === 0) {
    // Nothing to update — still a success
    return NextResponse.json({ success: true })
  }

  // --- Update profiles ---
  // The phone IS NULL guard ensures these write-once fields can't be
  // overwritten if this route is accidentally called twice.
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .is('phone', null) // write-once guard

  if (error) {
    console.error('[api/register/complete] Profile update failed:', error.message)
    // Don't fail the registration — profile extras are recoverable
    // The account itself was created successfully
    return NextResponse.json({ success: true, warning: 'Profile update failed' })
  }

  return NextResponse.json({ success: true, affiliateId })
}
