# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# TopWager — Claude Master Brief

**Last updated: 2026-04-01 — Phase UX1 (Mobile UX improvements) complete. Phase 2 (Payments / Flutterwave) is next.**

> **If you are reading this in the Claude.ai chat project:** state the last updated date above at the start of your response so the owner knows whether this file is current.

Read this file at the start of every session. Do not proceed without reading it fully.
Update this file when: schema changes, new integrations added, architectural decisions made, new pages/components created, or product decisions confirmed.

---

## Commands

```bash
npm run dev      # Start local dev server (Next.js, http://localhost:3000)
npm run build    # Production build — run before pushing if making structural changes
npm run lint     # ESLint check
```

No test suite exists. There is no `test` script.

---

## Product Overview

**TopWager** is a production online casino — real users, real money. Not a demo.

- **Live URL:** https://top-wager-frontend.vercel.app
- **GitHub:** alexrutherford-afk/top-wager-frontend
- **Licence:** Tobique First Nation (Canada) — multi-jurisdictional
- **Launch market:** Uganda. Rollout: Kenya, Tanzania, Zambia, Malawi
- **Deployment:** Vercel — auto-deploys on push to `main` (~1 min)
- **Owner:** Non-technical, solo operator at launch. Keep code clean, avoid over-engineering.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, no `src/` dir) |
| React | v19 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` in globals.css) |
| Language | TypeScript — `@/*` maps to project root |
| Auth + DB | Supabase (`@supabase/ssr`, `createBrowserClient`) |
| Fonts | Geist Sans via `next/font/google` |
| Deploy | Vercel |

---

## Architecture Rules — Read Before Writing Any Code

Non-negotiable. Flag any task that would break these before proceeding.

### 1. Wallet is the source of truth
- All balance reads from `wallets` table via Supabase
- All balance mutations via API routes in `app/api/` — never direct from client
- Every balance movement must write to `transactions` table — no exceptions
- Bonus balance and cash balance are always separate ledger entries

### 2. All third-party integrations go through `lib/integrations/`
- Payment providers: `lib/integrations/payments/{provider}/`
- Game providers: `lib/integrations/games/{provider}/`
- KYC tools: `lib/integrations/kyc/{provider}/`
- API routes call integration modules — pages never call third-party APIs directly

### 3. API routes own all sensitive operations
- `app/api/wallet/` — credit, debit, balance
- `app/api/games/` — session creation, callbacks
- `app/api/payments/` — initiate, callback, webhook verification
- `app/api/kyc/` — submission, status
- `app/api/admin/` — all backoffice operations (role-gated)
- `app/api/affiliates/` — tracking, stats

### 4. Geo enforcement is server-side for all financial operations
- Client-side GeoContext is for UX only (currency display, payment options, language)
- All API routes independently verify country — never trust client-passed country values

### 5. No hardcoded provider logic in shared components
- `GameCard.tsx`, `Nav.tsx`, and all UI components are provider-agnostic
- Game launch URLs and provider tokens come from API routes only

### 6. Backoffice is role-gated at the API level
- Every `app/api/admin/` route checks the caller's role before executing
- Role checks in middleware, not inside individual route handlers
- Never gate on client-side role state alone

### 7. Affiliate tag is captured at registration and never changes
- Every player row carries an `affiliate_id` (nullable)
- Set once on registration from URL param `?ref=CODE` — never overwritten
- All revenue calculations reference this field

### 8. Architecture must support multi-market from day one
- Currency is always player-facing local currency — never assume a single currency
- Payment provider selection driven by `geoConfig` market settings, not hardcoded
- Bonus templates can be market-scoped or global

---

## Integration Contracts

Every integration module must implement its category's standard interface.

```ts
// lib/integrations/payments/{provider}/index.ts
export interface PaymentProvider {
  initiateDeposit(params: DepositParams): Promise<DepositResult>
  initiateWithdrawal(params: WithdrawalParams): Promise<WithdrawalResult>
  handleCallback(payload: unknown): Promise<TransactionUpdate>
  verifyWebhook(payload: unknown, signature: string): boolean
  healthCheck(): Promise<boolean>
}

// lib/integrations/games/{provider}/index.ts
export interface GameProvider {
  getLaunchUrl(params: GameLaunchParams): Promise<string>
  handleCallback(payload: unknown): Promise<GameRoundUpdate>
  verifyWebhook(payload: unknown, signature: string): boolean
  getGameList(): Promise<Game[]>
  healthCheck(): Promise<boolean>
}
```

When adding a new provider: create its folder, implement the interface, register in `lib/integrations/registry.ts`. No other files need to change.

---

## Payment Strategy

- **Telco/mobile money is non-negotiable** in every market — primary payment rail
- **First provider to build:** Flutterwave (widest African coverage)
- **Additional providers:** Flexify, Bisotech — added once pattern is established
- **Player currency:** Always local. UGX for Uganda, KES for Kenya, etc.
- Provider selection per market driven by `geoConfig` — not hardcoded in routes

---

## Game Strategy

- **Aggregator:** Bitville (not yet signed — speculative until confirmed)
- **Must-have:** Aviator by Spribe — **verify Bitville carries Spribe before building game integration**
- **Verticals at launch:** Slots, Live Casino, Crash/Instant games
- **Sportsbook:** Future phase — wallet and bonus engine are architected to support it

---

## Affiliate System

- Revenue share per affiliate — rate set per affiliate record
- Tracked via `affiliate_id` on every player — set at registration from `?ref=CODE`
- Revenue = NGR attributed to that affiliate's players
- **Phase 1 (live):** Tracking + backoffice management only
- **Phase 2:** Affiliate self-serve portal (Phase 6 in build sequence)

---

## Bonus Engine

### Triggers
`register` | `first_deposit` | `deposit` | `deposit_over_amount` | `cumulative_bets` | `cumulative_losses` | `manual`

### Reward types
`deposit_match` | `free_spins` | `free_bonus_cash`

### Key rules
- Template params are **snapshotted into `player_bonuses` at award time** — runtime never re-reads `bonus_templates`. Players are protected from template edits after award.
- `max_withdrawal` is an absolute amount cap (not a multiplier). If null, entire bonus balance converts to cash on WR completion.
- Bonus balance stays separate from cash at all times; expired/forfeited bonuses are voided, never converted.
- `gross_gaming_revenue` in `bonus_events` is a placeholder (`total_wagered × 0.04`) — replace with actual game round revenue in Phase 3.

### Bonus engine modules (`lib/bonus/` — server-side only, never import from client)
| File | Purpose |
|------|---------|
| `awardBonus.ts` | Award from template — validates, snapshots, credits bonus_balance |
| `processWager.ts` | Post-round WR contribution — call from game callback (Phase 3) |
| `completeBonus.ts` | WR complete / expired / forfeited — transfers or voids balance |
| `checkWithdrawalAllowed.ts` | Pre-withdrawal check — forfeits active bonus if present (wire in Phase 2) |
| `validateBet.ts` | Pre-bet check — enforces max_bet_limit during active bonus (wire in Phase 3) |

**Cron:** `GET /api/cron/expire-bonuses` — auth via `Authorization: Bearer CRON_SECRET`. Runs hourly via `vercel.json`. Processes bonuses independently — single failure never stops the batch.

---

## Backoffice

### Roles (additive — a user can hold multiple)
| Role | Permissions |
|------|-------------|
| `super_admin` | Everything |
| `operations` | Player management, adjustments, bonus management |
| `finance` | Transaction history, reports, withdrawal approval |
| `support` | Player view (read only), password reset, account unlock |
| `affiliate_manager` | Affiliate reporting and management only |
| `content_manager` | Banner CMS |

### Manual adjustment rules
- Every adjustment requires a reason (text field)
- Logged with timestamp + admin user
- To create the first admin user: insert into `admin_users` in Supabase with a Supabase auth account email + roles array

---

## KYC Strategy

- **Now:** Light touch. Telco-only markets self-KYC via registered SIM.
- **Trigger:** Confirm with Tobique — likely card payments or deposit threshold
- **When cards/crypto added:** Full KYC — provider TBD (Sumsub or Onfido)
- Track `kyc_status` on profile. Gate withdrawals above threshold if required.

---

## Database Schema

All tables live in Supabase. Migration files in `supabase/`.

**Auto-trigger:** `on_auth_user_created` → `handle_new_user()` → auto-creates `profiles` + `wallets`.

**RLS:** Enabled on all tables. Players read own rows only. Ops tables (`affiliates`, `admin_users`, `bonus_templates`, `affiliate_payouts`, `game_whitelist`, `bonus_events`) are service-role-only.

**`public.profiles`**
```sql
id uuid PRIMARY KEY (references auth.users)
full_name text
date_of_birth date
phone text
currency text default 'EUR'
kyc_status text default 'not_submitted'
vip_level integer default 0
marketing_opt_in boolean default false
affiliate_id uuid nullable  -- FK → affiliates.id, set once at registration, never changed
created_at timestamptz
updated_at timestamptz
```

**`public.wallets`**
```sql
id uuid PRIMARY KEY
player_id uuid UNIQUE (FK → profiles.id)
cash_balance numeric(12,2) default 0.00
bonus_balance numeric(12,2) default 0.00
pending_withdrawal numeric(12,2) default 0.00
```

**`public.transactions`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
player_id uuid NOT NULL (FK → profiles.id)
type text NOT NULL
  -- 'deposit' | 'withdrawal' | 'game_debit' | 'game_credit'
  -- 'bonus_credit' | 'bonus_debit' | 'bonus_void' | 'manual_credit' | 'manual_debit'
amount numeric(12,2) NOT NULL
currency text NOT NULL
status text NOT NULL default 'pending'
  -- 'pending' | 'completed' | 'failed' | 'reversed'
provider text
provider_reference text
idempotency_key text UNIQUE
notes text
operated_by uuid  -- FK → admin_users.id, populated on manual ops
metadata jsonb
created_at timestamptz default now()
updated_at timestamptz default now()
```

**`public.game_rounds`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
player_id uuid NOT NULL (FK → profiles.id)
game_id text NOT NULL
provider text NOT NULL
round_reference text
bet_amount numeric(12,2) NOT NULL
win_amount numeric(12,2) default 0
currency text NOT NULL
status text NOT NULL  -- 'open' | 'completed' | 'cancelled'
bonus_id uuid nullable  -- FK → player_bonuses.id
started_at timestamptz default now()
completed_at timestamptz
```

**`public.affiliates`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
code text UNIQUE NOT NULL
name text NOT NULL
email text
revenue_share_pct numeric(5,2) NOT NULL
status text default 'active'  -- 'active' | 'paused' | 'terminated'
notes text
created_at timestamptz default now()
```

**`public.affiliate_payouts`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
affiliate_id uuid NOT NULL (FK → affiliates.id)
period_start date NOT NULL
period_end date NOT NULL
ngr numeric(12,2) NOT NULL
commission numeric(12,2) NOT NULL
status text default 'pending'  -- 'pending' | 'paid'
paid_at timestamptz
notes text
created_at timestamptz default now()
```

**`public.bonus_templates`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
name text NOT NULL
trigger text NOT NULL
trigger_amount numeric(12,2)
reward_type text NOT NULL
reward_value numeric(12,2) NOT NULL
reward_max numeric(12,2)
wagering_requirement numeric(5,2) NOT NULL default 0
game_restrictions jsonb
activation_expiry_hours integer
wagering_expiry_hours integer
max_withdrawal numeric(12,2)
max_bet_limit numeric(12,2)
min_deposit numeric(12,2)
market_scope text[]
is_active boolean default true
created_at timestamptz default now()
```

**`public.player_bonuses`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
player_id uuid NOT NULL (FK → profiles.id)
template_id uuid nullable (FK → bonus_templates.id)
type text NOT NULL
reward_type text NOT NULL
amount numeric(12,2) NOT NULL
wagering_requirement numeric(5,2) NOT NULL
wagered_amount numeric(12,2) default 0
status text NOT NULL  -- 'pending' | 'active' | 'completed' | 'expired' | 'cancelled' | 'forfeited'
-- Snapshotted from template at award time — never re-read from bonus_templates at runtime:
max_withdrawal   numeric(12,2)
max_bet_limit    numeric(12,2)
game_restrictions jsonb
trigger          text
triggered_by     text  -- attribution ID, payment ID, or 'manual'
currency         text
activated_at timestamptz
expires_at timestamptz
completed_at timestamptz
created_at timestamptz default now()
```

**`public.admin_users`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
email text UNIQUE NOT NULL
full_name text
roles text[] NOT NULL
is_active boolean default true
created_at timestamptz default now()
last_login timestamptz
```

**`public.game_whitelist`**
```sql
game_id            text PRIMARY KEY
provider           text NOT NULL
contribution_rate  numeric(4,3) NOT NULL  -- 1.0 = 100%, 0.5 = 50%, 0.0 = excluded
rtp                numeric(5,3)
is_active          boolean default true
added_by           uuid  -- FK → admin_users.id
added_at           timestamptz default now()
```

**`public.bonus_events`** ← affiliate commission engine reads this
```sql
id                   uuid PRIMARY KEY default gen_random_uuid()
player_bonus_id      uuid NOT NULL (FK → player_bonuses.id)
player_id            uuid NOT NULL (FK → profiles.id)
event_type           text NOT NULL  -- 'completed' | 'expired' | 'forfeited'
bonus_amount         numeric(12,2) NOT NULL
total_wagered        numeric(12,2) NOT NULL
bonus_cost           numeric(12,2) NOT NULL
gross_gaming_revenue numeric(12,2) NOT NULL  -- placeholder: total_wagered × 0.04 until Phase 3
ngr                  numeric(12,2) NOT NULL  -- gross_gaming_revenue - bonus_cost
created_at           timestamptz default now()
```

**`public.banners`**
```sql
id uuid PRIMARY KEY default gen_random_uuid()
title text NOT NULL
image_url text NOT NULL
link_url text
position text NOT NULL  -- 'lobby_hero' | 'lobby_promo' | 'deposit_page'
market_scope text[]     -- null = all markets
is_active boolean default true
sort_order integer default 0
created_at timestamptz default now()
updated_at timestamptz default now()
```
Storage: `banners` bucket (public read). Upload via `/api/admin/banners/upload`.

---

## Key Library Modules

| Module | Notes |
|--------|-------|
| `lib/wallet.ts` | `credit()` / `debit()` / `getBalance()` — server-side only. `credit()` tries `increment_balance` RPC first, falls back to read-then-write (RPC not yet in Supabase — fallback is active; replace before high-volume launch). |
| `lib/supabase.ts` | Browser Supabase client |
| `lib/supabase-server.ts` | Server Supabase client + `getAuthenticatedUser()` |
| `lib/admin-auth.ts` | `getAdminUser()` / `hasRole()` / `requireAdmin()` |
| `lib/referral.ts` | `getRefCodeCookie()` / `setRefCodeCookie()` — first-touch attribution, never overwritten |
| `middleware.ts` | Protects `/admin/*` — session check, edge-safe |
| `components/PlayerShell.tsx` | Wraps player layout (Nav, GeoGate, footer) — skipped for `/admin` routes |

---

## Auth & User Model

```ts
type AuthUser = {
  id: string
  email: string
  name: string
  currency: string
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected'
  vipLevel: number
  cashBalance: number
  bonusBalance: number
  pendingWithdrawal: number
  hasDeposited: boolean   // true if cashBalance > 0 at auth load; proxy until first_deposit_at added in Phase 2
  affiliateId?: string
}
```

`useAuth()` returns: `{ isLoggedIn, user, session, loading, login, register, logout, refreshUser }`

---

## Geo System

- IP detection: `ipapi.co/json/` — client-side, UX only (VPN-spoofable by design at this stage)
- Manual override: `tw_country_manual` in localStorage
- Blocked countries: redirect to `/blocked`
- All financial API routes enforce country server-side independently

---

## Internationalisation

Languages: `en`, `sw`, `fr`
Usage: `const { t, lang, setLang } = useI18n(); t('key')`

---

## Design System

### Colours
```
Background (page):     #0D1117
Background (card):     #131B24
Background (input):    #1A2332
Primary green:         #1A5C38 (dark) / #2D7A50 (mid) / #3A9E67 (light)
Gold accent:           #F5A623
Red/orange:            #E84D1C / #FF7A55
Purple (live):         #7C3AED / #A78BFA
Blue:                  #60A5FA
Text muted:            #5A7090
Text secondary:        #7A95B0
Text dimmed:           #3A4A5A
Success green:         #5DE898
```

### UI Rules
- Form inputs: `text-base` minimum (16px) — prevents iOS zoom
- Dark theme only
- Corners: `rounded-xl` inputs/buttons, `rounded-2xl` cards
- Weight: `font-black` headings/CTAs, `font-bold` labels
- No emojis unless already present

---

## Navigation

Top: `Home / Crash (HOT) / Slots / Live / Jackpots / Refer (500%)`
Mobile bottom: `Home · Refer · [TW] · Wallet (balance) · Account`

Crash moves to first position after Home — primary product interest in East Africa. Promos removed from top nav; promotions surface via lobby hero banners (CMS-managed). Wallet tab shows player's cashBalance as a micro-label (formatted with currency abbreviation, e.g. "UGX 12.4k") when logged in.

---

## Known Issues / Pre-launch TODOs

- `lib/wallet.ts` — `credit()` always falls back to read-then-write (RPC `increment_balance` not created in Supabase yet). Replace with atomic RPC before go-live.
- `AuthContext.tsx` — `emailRedirectTo` not set to production domain
- `account/page.tsx` — profile update, KYC, password change, 2FA, deposit limits not wired
- `refer/page.tsx` — all data mock/static; needs `GET /api/affiliates/me`, `/referrals`, `/earnings`
- `page.tsx` — `MOCK_ACTIVE_BONUS` is a static flag — replace with real API call to `/api/bonuses/active` in Phase 3
- `page.tsx` — game thumbnails are placeholders
- `deposit/page.tsx`, `withdraw/page.tsx` — UI only, not wired to payment provider

---

## Build Sequence

### ✅ Complete
- **Phase 1:** Schema, wallet engine, wallet API routes, register/complete
- **Phase 4:** Bonus engine (`lib/bonus/`), cron job, `game_whitelist` seeded with Aviator/Spribe
- **Phase 5:** Full backoffice — auth, dashboard, player management, transactions, bonuses, affiliates, banner CMS

### Phase 2 — Payments ← NEXT
1. `lib/integrations/` scaffold — registry, folder structure, interfaces
2. Flutterwave integration — implement `PaymentProvider` interface
3. `app/api/payments/` — initiate, callback, webhook
4. Wire deposit/withdraw pages
5. **On first_deposit confirmed:** call `awardBonus()` from payment callback
6. **In withdrawal route:** call `checkWithdrawalAllowed()` before processing

### Phase 3 — Games
1. Verify Bitville carries Spribe before starting
2. Bitville integration — implement `GameProvider` interface
3. `app/api/games/` — session creation, callback
4. **In game callback:** call `processWager()` after round completion
5. **In game session/wager route:** call `validateBet()` before accepting bet
6. Replace `gross_gaming_revenue` placeholder in `completeBonus.ts` with actual round revenue
7. Add real game IDs to `game_whitelist`

### Phase 6 — Affiliate Portal
- Affiliate login + self-serve dashboard (players, NGR, commission)
- Commission query joins `bonus_events → profiles → affiliates`; only sum positive NGR periods

---

## Session Rules for Claude Code

- **Start every session** by reading this file and stating the current phase and what you're working on
- **Before creating any new file**, check if it belongs in `lib/integrations/`, `app/api/`, or an existing module
- **Never** write provider-specific logic into page components or shared UI
- **Flag immediately** if a task would require breaking an Architecture Rule
- **End every session** with a summary of what was built, decisions made, and what next session starts with — owner updates this file before next session
- **After every session**, push changes then re-upload this file to the Claude.ai TopWager project: Project files → remove old version → upload new one. Takes 30 seconds. Do not skip — Claude.ai will work off a stale brief if this isn't done.

---

## Deploy

```bash
git add -A && git commit -m "your message" && git push
```

Vercel auto-deploys on push to `main` (~1 min). Run `npm run build` locally before pushing structural changes.

---

## UX Backlog

Items from the UX review that are blocked on later phases. Each must be picked up
during the relevant phase build — not deferred further.

### Blocked on Phase 2 (Payments)

- **STK push / payment prompt flow**: When the user taps Pay on the deposit page,
  initiate an STK push (Safaricom) or equivalent USSD push (MTN/Airtel) via
  Flutterwave. User should never need to open their mobile money app manually or
  enter a paybill number. The Pay button triggers the push; the user enters PIN on
  their phone; the app polls for confirmation.

- **Deposit pending + success states**: After STK push is sent, show a clear
  "Waiting for confirmation..." screen with a spinner. On webhook confirmation,
  show a celebration screen: "Deposit confirmed. Your 500% bonus is now active."
  with a CTA to the lobby. Do not drop the user on a blank page or generic
  success toast.

- **Replace hardcoded bonus caps on deposit page**: Task 3c uses hardcoded cap
  values. In Phase 2, replace these with a single `GET /api/bonuses/eligible`
  call on deposit page mount that returns the active template for the player's
  market. Wire the bonus math widget to live template data.

- **Wire `checkWithdrawalAllowed()` into withdrawal flow**: Already built in
  `lib/bonus/checkWithdrawalAllowed.ts`. Must be called before processing any
  withdrawal. Show the forfeit warning modal if a bonus is active.

- **`first_deposit_at` on profiles**: Add a `first_deposit_at timestamptz` column
  to `public.profiles`. Populate it in the payment confirmed webhook handler (only
  if currently null). Replace the `hasDeposited: cashBalance > 0` proxy in
  `AuthContext.tsx` with this field. Also add `first_deposit_at` to the `AuthUser`
  type and update the CLAUDE.md schema block.

### Blocked on Phase 3 (Games)

- **Wire active bonus widget to real data**: Replace `MOCK_ACTIVE_BONUS` in
  `app/page.tsx` with a real call to `GET /api/bonuses/active`. This route should
  return the player's current active `player_bonus` row including `wagered_amount`,
  `amount`, `wagering_requirement`, and `expires_at`. The lobby widget and the
  deposit page bonus math both depend on this.

- **Crash-first game lobby ordering**: Once real games are available from the
  Bitville integration, ensure the lobby renders game categories in this order:
  Crash / Instant → Live Casino → Slots → Table Games. Do not default to
  alphabetical or provider order. The ordering should be configurable via a
  `sort_order` field or category config, not hardcoded.

- **$0.30 max bet enforcement — client side**: When a player has an active bonus
  (`bonusBalance > 0`), the game launch flow must pass a `maxBet` constraint to
  the game iframe/provider. The server-side enforcement is already in
  `lib/bonus/validateBet.ts` — the client-side UI cap (disabling fast-spin,
  capping the bet slider) must be wired when the game session is created.

---

## Session Log

| Date | Summary |
|------|---------|
| 2026-04-01 | UX improvements (Phase UX1) — register 3-step flow (phone → OTP → password), referral offer reveal (upgraded framing when ref cookie present), deposit preset chips per market + bonus math widget (client-side, 500% hardcoded) + trust signals row + welcome banner on `?welcome=1`, lobby bonus widget redesigned (gold progress bar, WR info, "?" modal explaining WR), referral banner removed from logged-in lobby, nav reordered (Crash first, Promos tab removed), Wallet bottom tab shows cashBalance in local currency (abbreviated). `hasDeposited: boolean` added to AuthUser (proxy: cashBalance > 0). UX Backlog added to CLAUDE.md. Post-registration redirects to `/deposit?welcome=1`. |
