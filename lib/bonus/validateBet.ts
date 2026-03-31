/**
 * lib/bonus/validateBet.ts — server-side only
 *
 * ⚠️  NEVER import from client components or pages.
 *
 * Called by the game session/wager API route before accepting any bet.
 * Enforces the max_bet_limit snapshotted on the active player_bonus.
 *
 * Wire this to app/api/games/ in Phase 3 (game integration).
 *
 * Returns { allowed: false, reason: 'max_bet_exceeded' } when the bet
 * exceeds the limit. The game route must reject the wager in that case.
 *
 * Silently allows if:
 *   - Player has no active bonus
 *   - Active bonus has no max_bet_limit set (template didn't configure one)
 */

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface ValidateBetResult {
  allowed:      boolean
  reason?:      'max_bet_exceeded'
  maxBetLimit?: number
}

export async function validateBet(
  playerId:  string,
  betAmount: number
): Promise<ValidateBetResult> {
  const supabase = getServiceClient()

  const { data: activeBonus } = await supabase
    .from('player_bonuses')
    .select('max_bet_limit')
    .eq('player_id', playerId)
    .eq('status', 'active')
    .maybeSingle()

  // No active bonus — bet allowed
  if (!activeBonus) {
    return { allowed: true }
  }

  // Active bonus but no max_bet_limit configured — bet allowed
  if (activeBonus.max_bet_limit == null) {
    return { allowed: true }
  }

  const maxBetLimit = Number(activeBonus.max_bet_limit)

  if (betAmount > maxBetLimit) {
    return { allowed: false, reason: 'max_bet_exceeded', maxBetLimit }
  }

  return { allowed: true, maxBetLimit }
}
