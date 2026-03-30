/**
 * GET /api/wallet/balance
 *
 * Returns the authenticated player's current wallet balances.
 * Called by the client to display balance in Nav, Wallet page, etc.
 */

import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/supabase-server'
import { getBalance } from '@/lib/wallet'

export async function GET() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorised' },
      { status: 401 }
    )
  }

  try {
    const balance = await getBalance(user.id)
    return NextResponse.json(balance)
  } catch (err) {
    console.error('[api/wallet/balance]', err)
    return NextResponse.json(
      { error: 'Could not fetch balance' },
      { status: 500 }
    )
  }
}
