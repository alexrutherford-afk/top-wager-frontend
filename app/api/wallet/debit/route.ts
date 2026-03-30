/**
 * POST /api/wallet/debit
 *
 * Subtracts from a player's balance and logs the transaction.
 * Returns { success: false, error: 'Insufficient balance' } if funds are low.
 *
 * Called by:
 *   - app/api/games/   (bet placed — game_debit)
 *   - app/api/payments/ (withdrawal initiated)
 *   - app/api/admin/   (manual debit by ops team)
 *
 * Body: same shape as /api/wallet/credit
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase-server'
import { debit, TransactionType } from '@/lib/wallet'

// Transaction types a player session is never allowed to self-debit
const BLOCKED_FOR_PLAYERS: TransactionType[] = [
  'manual_credit',
  'manual_debit',
  'bonus_debit',
  'withdrawal',
]

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    playerId,
    amount,
    currency,
    type,
    balanceType,
    provider,
    providerReference,
    idempotencyKey,
    notes,
    metadata,
  } = body

  // Validate required fields
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }
  if (!currency || typeof currency !== 'string') {
    return NextResponse.json({ error: 'currency is required' }, { status: 400 })
  }
  if (!type || typeof type !== 'string') {
    return NextResponse.json({ error: 'type is required' }, { status: 400 })
  }

  // Players can only debit their own wallet
  const targetPlayerId = typeof playerId === 'string' ? playerId : user.id

  if (targetPlayerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (BLOCKED_FOR_PLAYERS.includes(type as TransactionType)) {
    return NextResponse.json(
      { error: `Transaction type '${type}' is not permitted via this route` },
      { status: 403 }
    )
  }

  const result = await debit({
    playerId: targetPlayerId,
    amount: amount as number,
    currency: currency as string,
    type: type as TransactionType,
    balanceType: balanceType === 'bonus' ? 'bonus' : 'cash',
    provider: provider as string | undefined,
    providerReference: providerReference as string | undefined,
    idempotencyKey: idempotencyKey as string | undefined,
    notes: notes as string | undefined,
    metadata: metadata as Record<string, unknown> | undefined,
  })

  if (!result.success) {
    // Insufficient balance comes back as 400 — caller handles the UX
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
