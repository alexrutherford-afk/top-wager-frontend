/**
 * app/api/cron/expire-bonuses/route.ts
 *
 * Expires all active player bonuses whose expires_at is in the past.
 * Designed to be called by Vercel Cron or any external cron service.
 *
 * Authentication: Authorization: Bearer <CRON_SECRET>
 * Set CRON_SECRET in Vercel environment variables.
 *
 * To schedule in Vercel, add to vercel.json:
 * {
 *   "crons": [{ "path": "/api/cron/expire-bonuses", "schedule": "0 * * * *" }]
 * }
 * (runs hourly — adjust as needed)
 *
 * Single failures do not stop the batch. Each bonus is processed
 * independently; errors are collected and returned in the response.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { completeBonus } from '@/lib/bonus/completeBonus'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  // --- Authenticate cron caller ---
  const authHeader  = req.headers.get('Authorization')
  const cronSecret  = process.env.CRON_SECRET

  if (!cronSecret) {
    // CRON_SECRET not configured — refuse to run to avoid accidental open execution
    console.error('[expire-bonuses] CRON_SECRET env var is not set')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  // --- Query expired active bonuses ---
  const { data: expiredBonuses, error: queryError } = await supabase
    .from('player_bonuses')
    .select('id')
    .eq('status', 'active')
    .not('expires_at', 'is', null)
    .lt('expires_at', new Date().toISOString())

  if (queryError) {
    console.error('[expire-bonuses] Query failed:', queryError.message)
    return NextResponse.json({ error: 'Query failed', detail: queryError.message }, { status: 500 })
  }

  const bonuses = expiredBonuses ?? []
  const errors: { id: string; error: string }[] = []

  // --- Process each expired bonus independently ---
  for (const bonus of bonuses) {
    try {
      const result = await completeBonus({ playerBonusId: bonus.id, reason: 'expired' })
      if (!result.success) {
        errors.push({ id: bonus.id, error: result.error ?? 'Unknown error' })
        console.error(`[expire-bonuses] Failed to expire bonus ${bonus.id}: ${result.error}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ id: bonus.id, error: message })
      console.error(`[expire-bonuses] Unexpected error for bonus ${bonus.id}:`, message)
    }
  }

  return NextResponse.json({
    processed: bonuses.length - errors.length,
    total:     bonuses.length,
    errors,
  })
}
