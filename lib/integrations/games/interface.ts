/**
 * lib/integrations/games/interface.ts
 *
 * Every game provider must implement this interface.
 * Add a new provider: create lib/integrations/games/{provider}/index.ts,
 * implement GameProvider, register in lib/integrations/registry.ts.
 */

import type {
  Game,
  GameLaunchParams,
  GameRoundUpdate,
} from '@/lib/integrations/types'

export interface GameProvider {
  /** Human-readable provider name, e.g. 'bitville' */
  readonly name: string

  /**
   * Generate a launch URL for a specific game.
   * Called by app/api/games/launch/route.ts.
   * Never called from a page or component directly.
   */
  getLaunchUrl(params: GameLaunchParams): Promise<string>

  /**
   * Parse and normalise an inbound round result callback.
   * Called by app/api/games/callback/route.ts.
   */
  handleCallback(payload: unknown): Promise<GameRoundUpdate>

  /** Verify the webhook signature before processing */
  verifyWebhook(payload: unknown, signature: string): boolean

  /**
   * Fetch the provider's full game catalogue.
   * Used to seed/sync the games list in the backoffice.
   * Returns Game[] normalised to our schema.
   */
  getGameList(): Promise<Game[]>

  /** Ping the provider API */
  healthCheck(): Promise<boolean>
}
