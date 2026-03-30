/**
 * lib/integrations/kyc/interface.ts
 *
 * Every KYC provider must implement this interface.
 * Candidates: Sumsub, Onfido — decision pending Tobique requirements.
 * Build when card payments or deposit threshold KYC is triggered.
 */

import type {
  KycSubmissionParams,
  KycSubmissionResult,
  KycStatusUpdate,
} from '@/lib/integrations/types'

export interface KycProvider {
  /** Human-readable provider name, e.g. 'sumsub' */
  readonly name: string

  /** Submit a player's KYC documents for verification */
  submitVerification(params: KycSubmissionParams): Promise<KycSubmissionResult>

  /**
   * Parse an inbound status webhook from the KYC provider.
   * Called by app/api/kyc/callback/route.ts.
   */
  handleCallback(payload: unknown): Promise<KycStatusUpdate>

  /** Verify webhook signature */
  verifyWebhook(payload: unknown, signature: string): boolean

  /** Ping the provider API */
  healthCheck(): Promise<boolean>
}
