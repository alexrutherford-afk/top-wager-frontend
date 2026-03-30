-- ============================================================================
-- TopWager — Phase 1 Schema Migration
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
--
-- Safe to run on a fresh project. Uses IF NOT EXISTS / DO blocks throughout
-- so it won't error if you run it more than once.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Add affiliate_id to profiles
--    Write-once — set at registration from ?ref= URL param, never changed.
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- NOTE: the FK reference above will fail if affiliates doesn't exist yet.
-- We create affiliates first (step 3) then re-run this, OR use the deferred
-- version below which adds the FK after affiliates is created.
-- The safe order is: affiliates → profiles.affiliate_id FK → everything else.


-- ----------------------------------------------------------------------------
-- 2. affiliates
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.affiliates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text UNIQUE NOT NULL,
  name             text NOT NULL,
  email            text,
  revenue_share_pct numeric(5,2) NOT NULL,
  status           text NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'paused', 'terminated')),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Only service role (API routes) can read/write affiliates — players never see this table
CREATE POLICY "Service role only" ON public.affiliates
  USING (false);


-- ----------------------------------------------------------------------------
-- 3. Add affiliate_id FK to profiles (now that affiliates exists)
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'affiliate_id'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 4. transactions
--    Every balance movement must produce a row here — no exceptions.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transactions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type               text NOT NULL
                       CHECK (type IN (
                         'deposit', 'withdrawal',
                         'game_debit', 'game_credit',
                         'bonus_credit', 'bonus_debit',
                         'manual_credit', 'manual_debit'
                       )),
  amount             numeric(12,2) NOT NULL CHECK (amount > 0),
  currency           text NOT NULL,
  status             text NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  provider           text,
  provider_reference text,
  idempotency_key    text UNIQUE,
  notes              text,
  operated_by        uuid,           -- FK to admin_users.id — added after that table exists
  metadata           jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_player_id_idx  ON public.transactions (player_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_status_idx     ON public.transactions (status);
CREATE INDEX IF NOT EXISTS transactions_type_idx       ON public.transactions (type);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Players can read their own transactions; writes only via service role (API routes)
CREATE POLICY "Players read own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = player_id);


-- ----------------------------------------------------------------------------
-- 5. game_rounds
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.game_rounds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id         text NOT NULL,
  provider        text NOT NULL,
  round_reference text,
  bet_amount      numeric(12,2) NOT NULL CHECK (bet_amount > 0),
  win_amount      numeric(12,2) NOT NULL DEFAULT 0 CHECK (win_amount >= 0),
  currency        text NOT NULL,
  status          text NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'completed', 'cancelled')),
  bonus_id        uuid,             -- FK to player_bonuses.id — added after that table exists
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);

CREATE INDEX IF NOT EXISTS game_rounds_player_id_idx  ON public.game_rounds (player_id);
CREATE INDEX IF NOT EXISTS game_rounds_started_at_idx ON public.game_rounds (started_at DESC);
CREATE INDEX IF NOT EXISTS game_rounds_status_idx     ON public.game_rounds (status);

ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own game rounds" ON public.game_rounds
  FOR SELECT USING (auth.uid() = player_id);


-- ----------------------------------------------------------------------------
-- 6. bonus_templates
--    Operator-configured bonus rules. Players never write to this table.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bonus_templates (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text NOT NULL,
  trigger                 text NOT NULL
                            CHECK (trigger IN (
                              'register', 'first_deposit', 'deposit',
                              'deposit_over_amount', 'cumulative_bets',
                              'cumulative_losses', 'manual'
                            )),
  trigger_amount          numeric(12,2),
  reward_type             text NOT NULL
                            CHECK (reward_type IN (
                              'deposit_match', 'free_spins', 'free_bonus_cash'
                            )),
  reward_value            numeric(12,2) NOT NULL CHECK (reward_value > 0),
  reward_max              numeric(12,2),
  wagering_requirement    numeric(5,2) NOT NULL DEFAULT 0,
  game_restrictions       jsonb,
  activation_expiry_hours integer,
  wagering_expiry_hours   integer,
  max_withdrawal          numeric(12,2),
  min_deposit             numeric(12,2),
  market_scope            text[],       -- null = global; ['UG','KE'] = Uganda + Kenya only
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bonus_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.bonus_templates
  USING (false);


-- ----------------------------------------------------------------------------
-- 7. player_bonuses
--    One row per bonus awarded to a player.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.player_bonuses (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id          uuid REFERENCES public.bonus_templates(id) ON DELETE SET NULL,
  type                 text NOT NULL,
  reward_type          text NOT NULL,
  amount               numeric(12,2) NOT NULL CHECK (amount > 0),
  wagering_requirement numeric(5,2) NOT NULL DEFAULT 0,
  wagered_amount       numeric(12,2) NOT NULL DEFAULT 0,
  status               text NOT NULL DEFAULT 'pending'
                         CHECK (status IN (
                           'pending', 'active', 'completed', 'expired', 'cancelled'
                         )),
  activated_at         timestamptz,
  expires_at           timestamptz,
  completed_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS player_bonuses_player_id_idx ON public.player_bonuses (player_id);
CREATE INDEX IF NOT EXISTS player_bonuses_status_idx    ON public.player_bonuses (status);

ALTER TABLE public.player_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players read own bonuses" ON public.player_bonuses
  FOR SELECT USING (auth.uid() = player_id);

-- Now that player_bonuses exists, add the FK from game_rounds
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'game_rounds_bonus_id_fkey'
  ) THEN
    ALTER TABLE public.game_rounds
      ADD CONSTRAINT game_rounds_bonus_id_fkey
      FOREIGN KEY (bonus_id) REFERENCES public.player_bonuses(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 8. affiliate_payouts
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end   date NOT NULL,
  ngr          numeric(12,2) NOT NULL,
  commission   numeric(12,2) NOT NULL,
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'paid')),
  paid_at      timestamptz,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.affiliate_payouts
  USING (false);


-- ----------------------------------------------------------------------------
-- 9. admin_users
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  full_name  text,
  roles      text[] NOT NULL DEFAULT '{}',
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.admin_users
  USING (false);

-- Now that admin_users exists, add the FK from transactions.operated_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_operated_by_fkey'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_operated_by_fkey
      FOREIGN KEY (operated_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- 10. updated_at auto-trigger for transactions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_transactions_updated_at'
  ) THEN
    CREATE TRIGGER set_transactions_updated_at
      BEFORE UPDATE ON public.transactions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;


-- ----------------------------------------------------------------------------
-- Done. Verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- Expected tables (in addition to profiles + wallets already existing):
--   admin_users, affiliate_payouts, affiliates, bonus_templates,
--   game_rounds, player_bonuses, transactions
-- ----------------------------------------------------------------------------
