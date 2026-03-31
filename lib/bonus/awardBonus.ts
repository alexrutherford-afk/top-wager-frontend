/**
 * lib/bonus/awardBonus.ts — server-side only
 *
 * ⚠️  NEVER import from client components or pages.
 *
 * Awards a bonus to a player from a template. Snapshots all relevant
 * template parameters into the player_bonuses record at award time.
 * Runtime logic (processWager, completeBonus, validateBet) reads only
 * from player_bonuses — never re-reads bonus_templates.
 *
 * Hard-rejects (throws) for invalid state.
 * Soft-rejects (returns { success: false }) for business rule violations
 * (e.g. already has an active bonus) so callers can handle gracefully.
 */

import { createClient } from '@supabase/supabase-js'
import { credit } from '@/lib/wallet'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service credentials')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface AwardBonusParams {
  playerId: string
  templateId: string
  trigger: string          // must match template.trigger (e.g. 'register', 'first_deposit', 'referral_ftd', 'manual')
  depositAmount?: number   // required for deposit_match reward type
  triggeredBy?: string     // attribution record ID, payment txn ID, or 'manual'
}

export interface AwardBonusResult {
  success: boolean
  playerBonusId?: string
  error?: string
}

export async function awardBonus(params: AwardBonusParams): Promise<AwardBonusResult> {
  const { playerId, templateId, trigger, depositAmount, triggeredBy } = params
  const supabase = getServiceClient()

  // --- 1. Load and validate template ---
  const { data: template, error: templateError } = await supabase
    .from('bonus_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (templateError || !template) {
    throw new Error(`awardBonus: template ${templateId} not found`)
  }

  if (!template.is_active) {
    throw new Error(`awardBonus: template ${templateId} is not active`)
  }

  if (template.trigger !== trigger) {
    throw new Error(
      `awardBonus: trigger mismatch — template expects '${template.trigger}', got '${trigger}'`
    )
  }

  // --- 2. Check no active bonus with a WR exists for this player ---
  // Only one bonus with a wagering requirement can be active at a time.
  const { data: existingBonus } = await supabase
    .from('player_bonuses')
    .select('id')
    .eq('player_id', playerId)
    .eq('status', 'active')
    .gt('wagering_requirement', 0)
    .maybeSingle()

  if (existingBonus) {
    console.warn(
      `[awardBonus] Player ${playerId} already has active bonus ${existingBonus.id} with WR — not awarding`
    )
    return {
      success: false,
      error: 'Player already has an active bonus with a wagering requirement',
    }
  }

  // --- 3. Validate referral attribution (for referral-triggered bonuses) ---
  // If the trigger name contains 'referral', we require a valid attributed affiliate.
  // TODO: When a dedicated fraud/attribution table is added, check that table's
  // fraud_blocked status here instead of relying solely on affiliate.status.
  if (trigger.includes('referral')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('affiliate_id')
      .eq('id', playerId)
      .single()

    if (!profile?.affiliate_id) {
      console.warn(
        `[awardBonus] Referral bonus blocked for player ${playerId} — no affiliate_id on profile`
      )
      throw new Error(
        'awardBonus: referral bonus requires a valid attribution record (no affiliate_id found)'
      )
    }

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('status')
      .eq('id', profile.affiliate_id)
      .single()

    if (!affiliate || affiliate.status !== 'active') {
      console.warn(
        `[awardBonus] Referral bonus blocked for player ${playerId} — affiliate status: ${affiliate?.status ?? 'not found'}`
      )
      throw new Error(
        `awardBonus: referral attribution is not valid or is fraud-blocked (affiliate status: ${affiliate?.status ?? 'not found'})`
      )
    }
  }

  // --- 4. Get player currency ---
  const { data: profileData } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', playerId)
    .single()

  const currency = profileData?.currency ?? 'USD'

  // --- 5. Calculate bonus amount ---
  let bonusAmount: number

  if (template.reward_type === 'deposit_match') {
    if (!depositAmount || depositAmount <= 0) {
      throw new Error('awardBonus: depositAmount is required for deposit_match reward type')
    }
    if (template.min_deposit && depositAmount < template.min_deposit) {
      throw new Error(
        `awardBonus: deposit ${depositAmount} is below min_deposit ${template.min_deposit}`
      )
    }
    // reward_value is the match percentage (e.g. 100 = 100% match)
    bonusAmount = (depositAmount * template.reward_value) / 100
    if (template.reward_max) {
      bonusAmount = Math.min(bonusAmount, template.reward_max)
    }
  } else {
    // free_bonus_cash, free_spins credit value, etc.
    bonusAmount = template.reward_value
  }

  bonusAmount = Math.round(bonusAmount * 100) / 100  // round to 2dp

  // --- 6. Calculate expiry timestamp ---
  const expiresAt = template.wagering_expiry_hours
    ? new Date(Date.now() + template.wagering_expiry_hours * 60 * 60 * 1000).toISOString()
    : null

  // --- 7. Insert player_bonuses with status 'pending' ---
  // All template parameters snapshotted here. Runtime logic never touches bonus_templates again.
  const { data: playerBonus, error: insertError } = await supabase
    .from('player_bonuses')
    .insert({
      player_id:            playerId,
      template_id:          templateId,
      type:                 trigger,
      reward_type:          template.reward_type,
      amount:               bonusAmount,
      wagering_requirement: template.wagering_requirement,
      wagered_amount:       0,
      status:               'pending',
      max_withdrawal:       template.max_withdrawal   ?? null,
      max_bet_limit:        template.max_bet_limit    ?? null,
      game_restrictions:    template.game_restrictions ?? null,
      trigger:              trigger,
      triggered_by:         triggeredBy ?? 'manual',
      currency:             currency,
      expires_at:           expiresAt,
    })
    .select('id')
    .single()

  if (insertError || !playerBonus) {
    throw new Error(`awardBonus: failed to insert player_bonuses: ${insertError?.message}`)
  }

  // --- 8. Credit bonus_balance via wallet.ts ---
  const creditResult = await credit({
    playerId,
    amount:   bonusAmount,
    currency,
    type:        'bonus_credit',
    balanceType: 'bonus',
    notes:       `Bonus awarded — template: ${template.name}, trigger: ${trigger}`,
    metadata:    { playerBonusId: playerBonus.id, templateId },
  })

  if (!creditResult.success) {
    // Compensate: mark the pending bonus cancelled so it's not orphaned.
    await supabase
      .from('player_bonuses')
      .update({ status: 'cancelled' })
      .eq('id', playerBonus.id)

    console.error(
      `[awardBonus] Wallet credit failed for player ${playerId}: ${creditResult.error} — bonus ${playerBonus.id} cancelled`
    )
    return { success: false, error: `Wallet credit failed: ${creditResult.error}` }
  }

  // --- 9. Activate bonus ---
  const { error: activateError } = await supabase
    .from('player_bonuses')
    .update({
      status:       'active',
      activated_at: new Date().toISOString(),
    })
    .eq('id', playerBonus.id)

  if (activateError) {
    // Bonus balance credited but status stuck in 'pending'.
    // The expiry job will eventually handle it, but flag for ops.
    console.error(
      `[awardBonus] Bonus ${playerBonus.id} credited but activation update failed: ${activateError.message}`
    )
    return {
      success: false,
      error: 'Bonus credited but status activation failed — requires ops investigation',
    }
  }

  return { success: true, playerBonusId: playerBonus.id }
}
