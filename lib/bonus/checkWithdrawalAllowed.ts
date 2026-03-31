/**
 * lib/bonus/checkWithdrawalAllowed.ts — server-side only
 *
 * ⚠️  NEVER import from client components or pages.
 *
 * Call this from the withdrawal API route before processing any withdrawal.
 * If the player has an active bonus, it is forfeited first and the bonus
 * balance is voided. The withdrawal then proceeds with cash balance only.
 *
 * NOT yet wired to any route — exported only.
 * Wire up in Phase 2 (payments) when the withdrawal API route is built:
 *   app/api/payments/withdraw/route.ts
 *
 * The withdrawal page should show the player a confirmation modal
 * when forfeited: true is returned, using the forfeitedBonusId to
 * display the bonus name/amount they're giving up.
 */

import { createClient } from '@supabase/supabase-js'
import { completeBonus } from '@/lib/bonus/completeBonus'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface WithdrawalAllowedResult {
  allowed:          boolean
  forfeited:        boolean
  forfeitedBonusId?: string
  error?:           string
}

export async function checkWithdrawalAllowed(
  playerId: string
): Promise<WithdrawalAllowedResult> {
  const supabase = getServiceClient()

  const { data: activeBonus } = await supabase
    .from('player_bonuses')
    .select('id')
    .eq('player_id', playerId)
    .eq('status', 'active')
    .maybeSingle()

  if (!activeBonus) {
    return { allowed: true, forfeited: false }
  }

  // Forfeit the active bonus before allowing withdrawal
  const result = await completeBonus({ playerBonusId: activeBonus.id, reason: 'forfeited' })

  if (!result.success) {
    return {
      allowed:   false,
      forfeited: false,
      error:     `Failed to forfeit active bonus: ${result.error}`,
    }
  }

  return { allowed: true, forfeited: true, forfeitedBonusId: activeBonus.id }
}
