-- ============================================================
-- Phase 4 — Bonus Engine migration
-- Run this in Supabase SQL editor after phase1_migration.sql
-- ============================================================

-- ============================================================
-- 1. Add max_bet_limit to bonus_templates
--    (max bet per round allowed while this bonus is active)
-- ============================================================

ALTER TABLE public.bonus_templates
  ADD COLUMN IF NOT EXISTS max_bet_limit numeric(12,2);

-- ============================================================
-- 2. Add snapshot columns to player_bonuses
--
--    At award time, all relevant template params are snapshotted
--    here. Runtime bonus logic (processWager, completeBonus,
--    validateBet) reads ONLY from player_bonuses — never from
--    bonus_templates. This protects players from template edits
--    made after their bonus was awarded.
-- ============================================================

ALTER TABLE public.player_bonuses
  ADD COLUMN IF NOT EXISTS max_withdrawal  numeric(12,2),   -- absolute cap on cash payout
  ADD COLUMN IF NOT EXISTS max_bet_limit   numeric(12,2),   -- max bet per round during bonus
  ADD COLUMN IF NOT EXISTS game_restrictions jsonb,         -- allowed/excluded game IDs or categories
  ADD COLUMN IF NOT EXISTS trigger         text,            -- what triggered the award (e.g. 'register', 'referral_ftd')
  ADD COLUMN IF NOT EXISTS triggered_by    text,            -- attribution ID, payment ID, or 'manual'
  ADD COLUMN IF NOT EXISTS currency        text;            -- player's currency at award time

-- ============================================================
-- 3. game_whitelist table
--
--    Controls which games contribute to wagering requirements
--    and at what rate (e.g. slots = 1.0, live casino = 0.5).
--    RLS enabled, no policies = service role access only.
--    Players cannot read or modify this table.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.game_whitelist (
  game_id            text PRIMARY KEY,
  provider           text NOT NULL,
  contribution_rate  numeric(4,3) NOT NULL,  -- 1.0 = 100%, 0.5 = 50%, 0.0 = excluded
  rtp                numeric(5,3),            -- informational — used to flag high-RTP games
  is_active          boolean        DEFAULT true,
  added_by           uuid           REFERENCES public.admin_users(id),
  added_at           timestamptz    DEFAULT now()
);

ALTER TABLE public.game_whitelist ENABLE ROW LEVEL SECURITY;
-- No RLS policies = service role only. No player can read or modify.

-- ============================================================
-- 4. bonus_events table
--
--    Integration seam between the bonus engine and the affiliate
--    commission engine. The bonus engine writes here; the
--    affiliate engine reads here. They never call each other.
--
--    gross_gaming_revenue is approximated at write time as
--    total_wagered × 0.04 (4% blended house edge). This will
--    be replaced with actual per-game-round revenue data once
--    the game integration (Phase 3) is live.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bonus_events (
  id                   uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  player_bonus_id      uuid          NOT NULL REFERENCES public.player_bonuses(id),
  player_id            uuid          NOT NULL REFERENCES public.profiles(id),
  event_type           text          NOT NULL,   -- 'completed' | 'expired' | 'forfeited'
  bonus_amount         numeric(12,2) NOT NULL,   -- original bonus credited (house cost)
  total_wagered        numeric(12,2) NOT NULL,   -- total eligible wagering during bonus period
  bonus_cost           numeric(12,2) NOT NULL,   -- = bonus_amount (for clarity in commission calcs)
  gross_gaming_revenue numeric(12,2) NOT NULL,   -- placeholder: total_wagered × 0.04
  ngr                  numeric(12,2) NOT NULL,   -- gross_gaming_revenue - bonus_cost
  created_at           timestamptz   DEFAULT now()
);

ALTER TABLE public.bonus_events ENABLE ROW LEVEL SECURITY;
-- No RLS policies = service role only.

-- ============================================================
-- What the affiliate commission engine (Phase 6) needs
-- from bonus_events:
--
--   SELECT
--     be.player_id,
--     p.affiliate_id,
--     a.revenue_share_pct,
--     be.ngr,
--     be.event_type,
--     be.created_at
--   FROM bonus_events be
--   JOIN profiles p ON p.id = be.player_id
--   JOIN affiliates a ON a.id = p.affiliate_id
--   WHERE p.affiliate_id IS NOT NULL
--     AND be.created_at BETWEEN period_start AND period_end
--
--   Commission = SUM(ngr) * (revenue_share_pct / 100)
--   (only sum positive NGR — never charge affiliate for negative NGR periods)
-- ============================================================
