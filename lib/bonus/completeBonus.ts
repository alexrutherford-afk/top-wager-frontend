/**
 * lib/bonus/completeBonus.ts — server-side only
 *
 * ⚠️  NEVER import from client components or pages.
 *
 * Handles all bonus end states:
 *   wr_complete — wagering requirement met. Transfer winnings to cash,
 *                 capped by max_withdrawal (snapshotted on player_bonus).
 *   expired     — WR expiry elapsed. Void remaining bonus balance.
 *   forfeited   — Player withdrew before WR met. Void remaining bonus balance.
 *
 * Always emits a bonus_events row. The affiliate commission engine reads
 * from bonus_events — it does not call into this module.
 *
 * All balance operations go through lib/wallet.ts. This module never
 * writes to wallets or transactions directly.
 */

import { createClient } from '@supabase/supabase-js'
import { credit, debit, getBalance } from '@/lib/wallet'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export type CompletionReason = 'wr_complete' | 'expired' | 'forfeited'

export interface CompleteBonusParams {
  playerBonusId: string
  reason: CompletionReason
}

export interface CompleteBonusResult {
  success: boolean
  error?: string
}

export async function completeBonus(params: CompleteBonusParams): Promise<CompleteBonusResult> {
  const { playerBonusId, reason } = params
  const supabase = getServiceClient()

  // --- Load player_bonus snapshot (never re-reads bonus_templates) ---
  const { data: playerBonus, error: loadError } = await supabase
    .from('player_bonuses')
    .select('*')
    .eq('id', playerBonusId)
    .single()

  if (loadError || !playerBonus) {
    console.error(`[completeBonus] Could not load player_bonus ${playerBonusId}`)
    return { success: false, error: 'Player bonus not found' }
  }

  if (playerBonus.status !== 'active') {
    console.warn(
      `[completeBonus] Bonus ${playerBonusId} status is '${playerBonus.status}' — skipping`
    )
    return { success: false, error: `Bonus is not active (${playerBonus.status})` }
  }

  const playerId    = playerBonus.player_id
  const currency    = playerBonus.currency ?? 'USD'
  const bonusAmount = Number(playerBonus.amount)
  const wageredAmount = Number(playerBonus.wagered_amount ?? 0)
  const now         = new Date().toISOString()

  // Current bonus wallet balance
  const balance = await getBalance(playerId)
  const currentBonusBalance = balance.bonusBalance

  let finalStatus: 'completed' | 'expired' | 'forfeited'

  if (reason === 'wr_complete') {
    finalStatus = 'completed'

    // max_withdrawal is an absolute cap snapshotted from the template.
    // If null, the entire bonus_balance converts to cash with no cap.
    const maxWithdrawal = playerBonus.max_withdrawal != null
      ? Number(playerBonus.max_withdrawal)
      : null

    const transferAmount = maxWithdrawal !== null
      ? Math.min(currentBonusBalance, maxWithdrawal)
      : currentBonusBalance

    const voidAmount = currentBonusBalance - transferAmount

    // Transfer eligible amount: bonus_balance → cash_balance
    if (transferAmount > 0) {
      const debitResult = await debit({
        playerId,
        amount:      transferAmount,
        currency,
        type:        'bonus_debit',
        balanceType: 'bonus',
        notes:       `Bonus WR complete — transferring ${transferAmount} to cash (bonus ${playerBonusId})`,
        metadata:    { playerBonusId, reason },
      })

      if (!debitResult.success) {
        console.error(
          `[completeBonus] Bonus debit failed for ${playerBonusId}: ${debitResult.error}`
        )
        return { success: false, error: debitResult.error }
      }

      const creditResult = await credit({
        playerId,
        amount:      transferAmount,
        currency,
        type:        'manual_credit',
        balanceType: 'cash',
        notes:       `Bonus WR complete — ${transferAmount} credited from bonus (bonus ${playerBonusId})`,
        metadata:    { playerBonusId, reason },
      })

      if (!creditResult.success) {
        // Bonus balance debited but cash credit failed — requires ops investigation.
        // Do not proceed to void the excess or mark completed.
        console.error(
          `[completeBonus] Cash credit failed after bonus debit for ${playerBonusId}: ${creditResult.error}`
        )
        return {
          success: false,
          error: 'Bonus debit succeeded but cash credit failed — requires ops investigation',
        }
      }
    }

    // Void any amount above the max_withdrawal cap
    if (voidAmount > 0) {
      const voidResult = await debit({
        playerId,
        amount:      voidAmount,
        currency,
        type:        'bonus_void',
        balanceType: 'bonus',
        notes:       `Bonus WR complete — voiding ${voidAmount} above max_withdrawal cap (bonus ${playerBonusId})`,
        metadata:    { playerBonusId, reason },
      })

      if (!voidResult.success) {
        // Non-fatal — excess balance left in bonus wallet. Log for ops.
        console.warn(
          `[completeBonus] Excess void failed for bonus ${playerBonusId}: ${voidResult.error}`
        )
      }
    }
  } else {
    // expired or forfeited — void entire remaining bonus balance
    finalStatus = reason === 'expired' ? 'expired' : 'forfeited'

    if (currentBonusBalance > 0) {
      const voidResult = await debit({
        playerId,
        amount:      currentBonusBalance,
        currency,
        type:        'bonus_void',
        balanceType: 'bonus',
        notes:       `Bonus ${reason} — voiding ${currentBonusBalance} remaining bonus balance (bonus ${playerBonusId})`,
        metadata:    { playerBonusId, reason },
      })

      if (!voidResult.success) {
        console.error(
          `[completeBonus] Void failed for bonus ${playerBonusId}: ${voidResult.error}`
        )
        return { success: false, error: `Failed to void bonus balance: ${voidResult.error}` }
      }
    }
  }

  // --- Update player_bonuses status ---
  const { error: statusError } = await supabase
    .from('player_bonuses')
    .update({ status: finalStatus, completed_at: now })
    .eq('id', playerBonusId)

  if (statusError) {
    // Balance operations already complete — status stuck. Log for ops.
    console.error(
      `[completeBonus] Status update failed for ${playerBonusId}: ${statusError.message}`
    )
  }

  // --- Emit bonus_events for affiliate commission engine ---
  // gross_gaming_revenue is approximated as total_wagered × 0.04 (4% blended house edge).
  // TODO (Phase 3): Replace with actual per-game-round revenue once game integration is live.
  const grossGamingRevenue = Math.round(wageredAmount * 0.04 * 100) / 100
  const bonusCost          = bonusAmount  // original amount credited to the player
  const ngr                = grossGamingRevenue - bonusCost

  const { error: eventError } = await supabase
    .from('bonus_events')
    .insert({
      player_bonus_id:      playerBonusId,
      player_id:            playerId,
      event_type:           reason === 'wr_complete' ? 'completed' : reason,
      bonus_amount:         bonusAmount,
      total_wagered:        wageredAmount,
      bonus_cost:           bonusCost,
      gross_gaming_revenue: grossGamingRevenue,
      ngr,
    })

  if (eventError) {
    // Non-fatal. Affiliate engine won't see this event without manual backfill.
    console.error(
      `[completeBonus] bonus_events insert failed for ${playerBonusId}: ${eventError.message}`
    )
  }

  return { success: true }
}
