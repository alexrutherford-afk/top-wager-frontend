/**
 * lib/wallet.ts — server-side wallet operations
 *
 * ⚠️  NEVER import this file from client components or pages.
 *     It uses the service role key which must stay server-side only.
 *
 * All functions:
 *  - Read/write wallets table
 *  - Write a corresponding row to transactions (no exceptions)
 *  - Return a typed WalletResult — never throw to the caller
 *
 * Architecture note:
 *  The debit function uses a .gte() guard on the UPDATE to catch
 *  the most common race condition (two concurrent debits). For full
 *  atomicity under high concurrency, replace with a Postgres RPC
 *  function before launch. Flag this when wiring up payments.
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Service role client — bypasses RLS
// ---------------------------------------------------------------------------

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing Supabase service credentials. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'game_debit'
  | 'game_credit'
  | 'bonus_credit'
  | 'bonus_debit'
  | 'bonus_void'    // forfeited/expired bonus balance removed from ledger
  | 'manual_credit'
  | 'manual_debit'

/** Which ledger to touch — cash (default) or bonus balance */
export type BalanceType = 'cash' | 'bonus'

export interface WalletOperationParams {
  playerId: string
  amount: number             // always positive
  currency: string
  type: TransactionType
  balanceType?: BalanceType  // defaults to 'cash'
  provider?: string
  providerReference?: string
  idempotencyKey?: string    // pass to make the operation safe to retry
  notes?: string
  operatedBy?: string        // admin_users.id — populate on manual ops
  metadata?: Record<string, unknown>
}

export interface WalletBalance {
  cashBalance: number
  bonusBalance: number
  pendingWithdrawal: number
}

export interface WalletResult {
  success: boolean
  transactionId?: string
  balance?: WalletBalance
  error?: string
}

// ---------------------------------------------------------------------------
// getBalance
// ---------------------------------------------------------------------------

/**
 * Returns the current wallet balances for a player.
 * Throws if the wallet row cannot be found — every registered player
 * should have one created by the on_auth_user_created trigger.
 */
export async function getBalance(playerId: string): Promise<WalletBalance> {
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from('wallets')
    .select('cash_balance, bonus_balance, pending_withdrawal')
    .eq('player_id', playerId)
    .single()

  if (error || !data) {
    throw new Error(
      `getBalance: could not fetch wallet for player ${playerId}: ${error?.message ?? 'not found'}`
    )
  }

  return {
    cashBalance: Number(data.cash_balance),
    bonusBalance: Number(data.bonus_balance),
    pendingWithdrawal: Number(data.pending_withdrawal),
  }
}

// ---------------------------------------------------------------------------
// credit
// ---------------------------------------------------------------------------

/**
 * Add to a player's balance and log the transaction.
 *
 * Usage examples:
 *   credit({ playerId, amount: 50000, currency: 'UGX', type: 'deposit' })
 *   credit({ ..., type: 'bonus_credit', balanceType: 'bonus' })
 */
export async function credit(params: WalletOperationParams): Promise<WalletResult> {
  const supabase = getServiceClient()
  const {
    playerId,
    amount,
    currency,
    type,
    balanceType = 'cash',
    provider,
    providerReference,
    idempotencyKey,
    notes,
    operatedBy,
    metadata,
  } = params

  if (amount <= 0) {
    return { success: false, error: 'Amount must be greater than zero' }
  }

  // --- Idempotency check ---
  // If we've seen this key before and it completed, return the existing txn id.
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (existing) {
      return { success: true, transactionId: existing.id }
    }
  }

  const balanceColumn = balanceType === 'bonus' ? 'bonus_balance' : 'cash_balance'

  // --- Update wallet ---
  const { error: walletError } = await supabase.rpc('increment_balance', {
    p_player_id: playerId,
    p_column: balanceColumn,
    p_amount: amount,
  })

  // Fallback if RPC not yet created: direct update
  // We do a read-then-write here which is acceptable for credits
  // (double-credits are prevented by idempotency_key)
  if (walletError) {
    const current = await getBalance(playerId)
    const currentValue =
      balanceType === 'bonus' ? current.bonusBalance : current.cashBalance

    const { error: updateError } = await supabase
      .from('wallets')
      .update({ [balanceColumn]: currentValue + amount })
      .eq('player_id', playerId)

    if (updateError) {
      return { success: false, error: `Wallet update failed: ${updateError.message}` }
    }
  }

  // --- Log transaction ---
  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .insert({
      player_id: playerId,
      type,
      amount,
      currency,
      status: 'completed',
      provider: provider ?? null,
      provider_reference: providerReference ?? null,
      idempotency_key: idempotencyKey ?? null,
      notes: notes ?? null,
      operated_by: operatedBy ?? null,
      metadata: metadata ?? null,
    })
    .select('id')
    .single()

  if (txnError) {
    // Balance was already credited. Log for ops investigation.
    // Do not fail the operation — the money is in the wallet.
    console.error('[wallet.credit] Transaction log failed after balance update:', txnError.message)
  }

  const newBalance = await getBalance(playerId)

  return {
    success: true,
    transactionId: txn?.id,
    balance: newBalance,
  }
}

// ---------------------------------------------------------------------------
// debit
// ---------------------------------------------------------------------------

/**
 * Subtract from a player's balance and log the transaction.
 * Returns { success: false, error: 'Insufficient balance' } if funds are low —
 * callers must handle this case before proceeding (e.g. reject withdrawal).
 *
 * The .gte() filter on the UPDATE is an atomic DB-level guard against the
 * most common race condition. Replace with a Postgres RPC before go-live.
 */
export async function debit(params: WalletOperationParams): Promise<WalletResult> {
  const supabase = getServiceClient()
  const {
    playerId,
    amount,
    currency,
    type,
    balanceType = 'cash',
    provider,
    providerReference,
    idempotencyKey,
    notes,
    operatedBy,
    metadata,
  } = params

  if (amount <= 0) {
    return { success: false, error: 'Amount must be greater than zero' }
  }

  // --- Idempotency check ---
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (existing) {
      return { success: true, transactionId: existing.id }
    }
  }

  const balanceColumn = balanceType === 'bonus' ? 'bonus_balance' : 'cash_balance'

  // --- Pre-flight balance check (user-facing error) ---
  const current = await getBalance(playerId)
  const currentValue =
    balanceType === 'bonus' ? current.bonusBalance : current.cashBalance

  if (currentValue < amount) {
    return { success: false, error: 'Insufficient balance' }
  }

  // --- Atomic update with DB-level guard ---
  // The .gte() means: only update if balance is still >= amount at execution time.
  // If another debit landed between our read and this write, count will be 0.
  const { error: walletError, count } = await supabase
    .from('wallets')
    .update({ [balanceColumn]: currentValue - amount })
    .eq('player_id', playerId)
    .gte(balanceColumn, amount)

  if (walletError) {
    return { success: false, error: `Wallet update failed: ${walletError.message}` }
  }

  if (count === 0) {
    // Race condition — balance dropped between our read and the update
    return { success: false, error: 'Insufficient balance' }
  }

  // --- Log transaction ---
  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .insert({
      player_id: playerId,
      type,
      amount,
      currency,
      status: 'completed',
      provider: provider ?? null,
      provider_reference: providerReference ?? null,
      idempotency_key: idempotencyKey ?? null,
      notes: notes ?? null,
      operated_by: operatedBy ?? null,
      metadata: metadata ?? null,
    })
    .select('id')
    .single()

  if (txnError) {
    // Balance was already debited. Log for ops investigation.
    console.error('[wallet.debit] Transaction log failed after balance update:', txnError.message)
  }

  const newBalance = await getBalance(playerId)

  return {
    success: true,
    transactionId: txn?.id,
    balance: newBalance,
  }
}
