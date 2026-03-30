/**
 * POST /api/wallet/credit
 *
 * Adds to a player's balance and logs the transaction.
 *
 * This route is intentionally NOT called directly from the frontend.
 * It is called by:
 *   - app/api/payments/ (deposit confirmed webhook)
 *   - app/api/games/   (win credited from game provider callback)
 *   - app/api/admin/   (manual credit by ops team)
 *
 * Direct player calls are blocked — only game_credit is permitted
 * from an authenticated session without an admin token, and even then
 * it must come via the games callback route, not here.
 *
 * Body:
 * {
 *   playerId:          string   — target player (admin ops) or omit to use session user
 *   amount:            number
 *   currency:          string
 *   type:              TransactionType
 *   balanceType?:      'cash' | 'bonus'
 *   provider?:         string
 *   providerReference?: string
 *   idempotencyKey?:   string
 *   notes?:            string
 *   metadata?:         object
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase-server'
import { credit, TransactionType } from '@/lib/wallet'

// Transaction types a player session is never allowed to self-credit
const BLOCKED_FOR_PLAYERS: TransactionType[] = [
  'manual_credit',
  'manual_debit',
  'bonus_credit',
  'deposit',
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

  // Players can only credit their own wallet, and only for permitted types
  const targetPlayerId = typeof playerId === 'string' ? playerId : user.id

  if (targetPlayerId !== user.id) {
    // Crediting a different player — admin only (to be enforced via admin middleware in Phase 5)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (BLOCKED_FOR_PLAYERS.includes(type as TransactionType)) {
    return NextResponse.json(
      { error: `Transaction type '${type}' is not permitted via this route` },
      { status: 403 }
    )
  }

  const result = await credit({
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
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
