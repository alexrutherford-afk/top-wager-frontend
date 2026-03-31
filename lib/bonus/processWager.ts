/**
 * lib/bonus/processWager.ts — server-side only
 *
 * ⚠️  NEVER import from client components or pages.
 *
 * Called after every completed game round. Updates wagering progress
 * toward the active bonus wagering requirement (WR).
 *
 * Wire this to the game callback in Phase 3 (game integration —
 * app/api/games/callback). For now, export the function for testing.
 *
 * Silently returns (no throw) if:
 *   - Player has no active bonus
 *   - Wager was from cash wallet (cash wagers don't count toward WR)
 *   - Game is not on the whitelist (contribution = 0 is expected)
 */

import { createClient } from '@supabase/supabase-js'
import { completeBonus } from '@/lib/bonus/completeBonus'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface ProcessWagerParams {
  playerId:    string
  gameRoundId: string
  gameId:      string
  wagerAmount: number
  walletType:  'cash' | 'bonus'
}

export async function processWager(params: ProcessWagerParams): Promise<void> {
  const { playerId, gameId, wagerAmount, walletType } = params
  const supabase = getServiceClient()

  // Cash wagers do not contribute toward the bonus WR
  if (walletType === 'cash') return

  // Look up the player's active bonus (only bonuses with a WR matter)
  const { data: activeBonus } = await supabase
    .from('player_bonuses')
    .select('id, amount, wagering_requirement, wagered_amount')
    .eq('player_id', playerId)
    .eq('status', 'active')
    .gt('wagering_requirement', 0)
    .maybeSingle()

  // No active bonus — no-op
  if (!activeBonus) return

  // Look up this game's contribution rate from the whitelist
  const { data: whitelistEntry } = await supabase
    .from('game_whitelist')
    .select('contribution_rate, is_active')
    .eq('game_id', gameId)
    .maybeSingle()

  // Not on whitelist, or inactive, or rate is 0 — all mean no contribution
  if (!whitelistEntry || !whitelistEntry.is_active || Number(whitelistEntry.contribution_rate) === 0) {
    return
  }

  const contributionRate = Number(whitelistEntry.contribution_rate)
  const contribution     = Math.round(wagerAmount * contributionRate * 100) / 100

  const newWagered     = Number(activeBonus.wagered_amount) + contribution
  const wageringTarget = Number(activeBonus.wagering_requirement) * Number(activeBonus.amount)

  // Persist updated wagered_amount
  const { error: updateError } = await supabase
    .from('player_bonuses')
    .update({ wagered_amount: newWagered })
    .eq('id', activeBonus.id)

  if (updateError) {
    console.error(
      `[processWager] Failed to update wagered_amount for bonus ${activeBonus.id}: ${updateError.message}`
    )
    return
  }

  // Check if WR target is now met
  if (newWagered >= wageringTarget) {
    await completeBonus({ playerBonusId: activeBonus.id, reason: 'wr_complete' })
  }
}
