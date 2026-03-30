/**
 * lib/integrations/types.ts
 *
 * Shared types used across all integration interfaces.
 * Import from here — never redefine these in individual provider files.
 */

// ---------------------------------------------------------------------------
// Payment Provider types
// ---------------------------------------------------------------------------

export interface DepositParams {
  playerId: string
  amount: number
  currency: string           // player's local currency, e.g. 'UGX'
  returnUrl: string          // where to redirect after payment
  idempotencyKey: string     // required — prevents duplicate charges
  metadata?: Record<string, unknown>
}

export interface DepositResult {
  success: boolean
  redirectUrl?: string       // send player here to complete payment
  providerReference?: string // provider's transaction ID
  error?: string
}

export interface WithdrawalParams {
  playerId: string
  amount: number
  currency: string
  accountDetails: {
    phone?: string           // for mobile money
    bankCode?: string        // for bank transfer
    accountNumber?: string
    accountName?: string
  }
  idempotencyKey: string
  metadata?: Record<string, unknown>
}

export interface WithdrawalResult {
  success: boolean
  providerReference?: string
  status: 'pending' | 'completed' | 'failed'
  error?: string
}

export interface TransactionUpdate {
  providerReference: string
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  amount: number
  currency: string
  playerId?: string          // if provider passes it back
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Game Provider types
// ---------------------------------------------------------------------------

export interface GameLaunchParams {
  playerId: string
  gameId: string             // provider's game identifier
  currency: string
  returnUrl: string          // back-to-lobby URL
  language?: string          // e.g. 'en', 'sw'
  sessionToken?: string      // if provider requires a pre-auth token
}

export type GameCategory = 'slots' | 'live' | 'crash' | 'table' | 'jackpot'

export interface Game {
  id: string                 // provider's game ID
  name: string
  provider: string
  category: GameCategory
  thumbnailUrl: string
  isActive: boolean
  restrictedMarkets?: string[] // country codes where game is blocked
  metadata?: Record<string, unknown>
}

export interface GameRoundUpdate {
  roundReference: string     // provider's round ID
  playerId: string
  gameId: string
  betAmount: number
  winAmount: number
  currency: string
  status: 'open' | 'completed' | 'cancelled'
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// KYC Provider types
// ---------------------------------------------------------------------------

export interface KycSubmissionParams {
  playerId: string
  firstName: string
  lastName: string
  dateOfBirth: string        // ISO date string
  documentType: 'passport' | 'national_id' | 'driving_licence'
  documentFrontUrl: string   // pre-signed URL or base64
  documentBackUrl?: string
  selfieUrl?: string
  country: string
}

export interface KycSubmissionResult {
  success: boolean
  verificationId?: string    // provider's reference
  status: 'pending' | 'approved' | 'rejected'
  error?: string
}

export interface KycStatusUpdate {
  verificationId: string
  playerId: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  metadata?: Record<string, unknown>
}
