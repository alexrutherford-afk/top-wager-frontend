/**
 * lib/integrations/registry.ts
 *
 * Single source of truth for all active providers.
 *
 * Rules:
 * - Register every provider here and nowhere else
 * - API routes call getPaymentProvider() / getGameProvider() — never import
 *   a provider module directly from a route
 * - Provider selection for payments is market-driven (geoConfig)
 * - When adding a provider: create its folder, implement the interface,
 *   import and register below. Nothing else needs to change.
 *
 * Current status:
 *   Payments : none registered — Flutterwave is Phase 2
 *   Games    : none registered — Bitville is Phase 3 (pending contract)
 *   KYC      : none registered — pending Tobique requirements
 */

import type { PaymentProvider } from '@/lib/integrations/payments/interface'
import type { GameProvider } from '@/lib/integrations/games/interface'
import type { KycProvider } from '@/lib/integrations/kyc/interface'

// ---------------------------------------------------------------------------
// Payment providers
// Register here when Phase 2 begins.
//
// import { flutterwaveProvider } from '@/lib/integrations/payments/flutterwave'
//
// const paymentProviders: Record<string, PaymentProvider> = {
//   flutterwave: flutterwaveProvider,
// }
// ---------------------------------------------------------------------------

const paymentProviders: Record<string, PaymentProvider> = {}

// ---------------------------------------------------------------------------
// Game providers
// Register here when Phase 3 begins (after Bitville contract confirmed).
//
// import { bitvilleProvider } from '@/lib/integrations/games/bitville'
//
// const gameProviders: Record<string, GameProvider> = {
//   bitville: bitvilleProvider,
// }
// ---------------------------------------------------------------------------

const gameProviders: Record<string, GameProvider> = {}

// ---------------------------------------------------------------------------
// KYC providers
// Register here when KYC is required (card payments / deposit threshold).
//
// import { sumsubProvider } from '@/lib/integrations/kyc/sumsub'
//
// const kycProviders: Record<string, KycProvider> = {
//   sumsub: sumsubProvider,
// }
// ---------------------------------------------------------------------------

const kycProviders: Record<string, KycProvider> = {}

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------

/**
 * Returns the payment provider for a given market.
 * Provider name comes from geoConfig[market].paymentProvider — never hardcoded.
 *
 * Throws if the provider is not registered (fail loud — catch in route handler).
 */
export function getPaymentProvider(providerName: string): PaymentProvider {
  const provider = paymentProviders[providerName]
  if (!provider) {
    throw new Error(
      `Payment provider '${providerName}' is not registered. ` +
      `Add it to lib/integrations/registry.ts.`
    )
  }
  return provider
}

/**
 * Returns the game provider by name.
 * Throws if not registered.
 */
export function getGameProvider(providerName: string): GameProvider {
  const provider = gameProviders[providerName]
  if (!provider) {
    throw new Error(
      `Game provider '${providerName}' is not registered. ` +
      `Add it to lib/integrations/registry.ts.`
    )
  }
  return provider
}

/**
 * Returns the KYC provider by name.
 * Throws if not registered.
 */
export function getKycProvider(providerName: string): KycProvider {
  const provider = kycProviders[providerName]
  if (!provider) {
    throw new Error(
      `KYC provider '${providerName}' is not registered. ` +
      `Add it to lib/integrations/registry.ts.`
    )
  }
  return provider
}

/**
 * Returns names of all registered providers — useful for health check endpoint.
 */
export function getRegisteredProviders() {
  return {
    payments: Object.keys(paymentProviders),
    games: Object.keys(gameProviders),
    kyc: Object.keys(kycProviders),
  }
}
