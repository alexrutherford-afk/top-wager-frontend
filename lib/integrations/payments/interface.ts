/**
 * lib/integrations/payments/interface.ts
 *
 * Every payment provider must implement this interface.
 * Add a new provider: create lib/integrations/payments/{provider}/index.ts,
 * implement PaymentProvider, register in lib/integrations/registry.ts.
 * No other files need to change.
 */

import type {
  DepositParams,
  DepositResult,
  WithdrawalParams,
  WithdrawalResult,
  TransactionUpdate,
} from '@/lib/integrations/types'

export interface PaymentProvider {
  /** Human-readable provider name, e.g. 'flutterwave' */
  readonly name: string

  /** Start a deposit — returns a redirect URL or error */
  initiateDeposit(params: DepositParams): Promise<DepositResult>

  /** Start a withdrawal — returns provider reference or error */
  initiateWithdrawal(params: WithdrawalParams): Promise<WithdrawalResult>

  /**
   * Parse and normalise an inbound webhook/callback payload.
   * Called by app/api/payments/callback/route.ts.
   * Returns a normalised TransactionUpdate regardless of provider format.
   */
  handleCallback(payload: unknown): Promise<TransactionUpdate>

  /**
   * Verify the webhook signature before processing.
   * Always call this before handleCallback.
   * Returns false → reject the request with 400.
   */
  verifyWebhook(payload: unknown, signature: string): boolean

  /** Ping the provider API — used by health check endpoint */
  healthCheck(): Promise<boolean>
}
