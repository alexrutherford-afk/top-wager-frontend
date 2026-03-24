-- ============================================================
-- TopWager — Database Schema
-- Run this entire file in Supabase → SQL Editor → New query
-- ============================================================


-- ── 1. PROFILES ─────────────────────────────────────────────
-- One row per player, linked to Supabase Auth user
create table if not exists public.profiles (
  id               uuid        references auth.users(id) on delete cascade primary key,
  full_name        text,
  date_of_birth    date,
  phone            text,
  currency         text        not null default 'EUR',
  kyc_status       text        not null default 'not_submitted'
                               check (kyc_status in ('not_submitted','pending','verified','rejected')),
  vip_level        integer     not null default 0,
  marketing_opt_in boolean     not null default false,
  is_suspended     boolean     not null default false,
  self_excluded_until timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 2. WALLETS ───────────────────────────────────────────────
-- One wallet per player — balances in their chosen currency
create table if not exists public.wallets (
  id                  uuid        primary key default gen_random_uuid(),
  player_id           uuid        references public.profiles(id) on delete cascade unique not null,
  cash_balance        numeric(14,2) not null default 0.00,
  bonus_balance       numeric(14,2) not null default 0.00,
  pending_withdrawal  numeric(14,2) not null default 0.00,
  total_deposited     numeric(14,2) not null default 0.00,
  total_withdrawn     numeric(14,2) not null default 0.00,
  total_wagered       numeric(14,2) not null default 0.00,
  updated_at          timestamptz not null default now()
);

-- ── 3. TRIGGER: auto-create profile + wallet on signup ───────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create profile from data passed during registration
  insert into public.profiles (id, full_name, currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'currency', 'EUR')
  );

  -- Create empty wallet
  insert into public.wallets (player_id)
  values (new.id);

  return new;
end;
$$;

-- Drop and recreate trigger so re-running this file is safe
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 4. ROW LEVEL SECURITY ────────────────────────────────────
-- Players can only ever see and edit their OWN data

alter table public.profiles enable row level security;
alter table public.wallets  enable row level security;

-- Profiles
drop policy if exists "Players can view own profile"   on public.profiles;
drop policy if exists "Players can update own profile" on public.profiles;

create policy "Players can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Players can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Wallets (read-only from client — writes happen server-side only)
drop policy if exists "Players can view own wallet" on public.wallets;

create policy "Players can view own wallet"
  on public.wallets for select
  using (auth.uid() = player_id);


-- ── 5. UPDATED_AT TRIGGER ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_wallets_updated_at on public.wallets;
create trigger set_wallets_updated_at
  before update on public.wallets
  for each row execute procedure public.set_updated_at();


-- ── Done ─────────────────────────────────────────────────────
-- profiles and wallets tables are live.
-- Every new registration auto-creates both rows.
-- RLS ensures players can only see their own data.
