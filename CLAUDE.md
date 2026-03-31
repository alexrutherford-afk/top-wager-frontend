# TopWager — Claude Master Brief

Read this file at the start of every session. Do not proceed without reading it fully.
Update this file when: schema changes, new integrations added, architectural decisions made, new pages/components created, or product decisions confirmed.

---

## Product Overview

**TopWager** is a production online casino — real users, real money. Not a demo.

- **Live URL:** https://top-wager-frontend.vercel.app
- **GitHub:** alexrutherford-afk/top-wager-frontend
- **Licence:** Tobique First Nation (Canada) — multi-jurisdictional
- **Launch market:** Uganda. Rollout: Kenya, Tanzania, Zambia, Malawi + anywhere with workable payments
- **Model:** House edge. Mass market, mobile-first, casino-first. Sportsbook planned for later.
- **Deployment:** Vercel — auto-deploys on push to `main` (~1 min)
- **Owner:** Non-technical, solo operator at launch. Keep code clean, avoid over-engineering, explain non-obvious decisions briefly.

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

Non-negotiable. If a task would require breaking one of these, stop and flag it.

### 1. Wallet is the source of truth
- All balance reads come from `wallets` table via Supabase
- All balance mutations happen via API routes in `app/api/` — never direct from client
- Client never writes to `wallets` directly, even with RLS in place
- Every balance movement must write to `transactions` table — no exceptions
- Bonus balance and cash balance are always separate ledger entries

### 2. Transactions table must exist before any real money moves
- Do not wire up any payment provider until `transactions` table is live and wallet API routes are tested
- This is the non-negotiable first backend task

### 3. All third-party integrations go through `lib/integrations/`
- Payment providers: `lib/integrations/payments/{provider}/`
- Game providers: `lib/integrations/games/{provider}/`
- KYC tools: `lib/integrations/kyc/{provider}/`
- Each integration exports a standard interface (see Integration Contracts below)
- API routes call integration modules — pages never call third-party APIs directly

### 4. API routes own all sensitive operations
- `app/api/wallet/` — credit, debit, balance
- `app/api/games/` — session creation, callbacks
- `app/api/payments/` — initiate, callback, webhook verification
- `app/api/kyc/` — submission, status
- `app/api/admin/` — all backoffice operations (role-gated)
- `app/api/affiliates/` — tracking, stats

### 5. Geo enforcement is server-side for all financial operations
- Client-side GeoContext is for UX only (currency display, payment method options, language)
- All API routes independently verify country — never trust client-passed country values

### 6. No hardcoded provider logic in shared components
- `GameCard.tsx`, `Nav.tsx`, and all UI components are provider-agnostic
- Game launch URLs and provider tokens come from API routes only

### 7. Backoffice is role-gated at the API level
- Every `app/api/admin/` route checks the caller's role before executing
- Role checks happen in middleware, not inside individual route handlers
- Never gate on client-side role state alone

### 8. Affiliate tag is captured at registration and never changes
- Every player row carries an `affiliate_id` (nullable)
- Set once on registration from URL param `?ref=CODE` — never overwritten
- All revenue calculations reference this field

### 9. Architecture must support multi-market from day one
- Currency is always player-facing local currency — never assume a single currency
- Payment provider selection is driven by `geoConfig` market settings, not hardcoded
- Bonus templates can be market-scoped or global
- Game availability can be restricted by market

---

## Integration Contracts

Every integration module must implement its category's standard interface.

### Payment Provider
```ts
// lib/integrations/payments/{provider}/index.ts
export interface PaymentProvider {
  initiateDeposit(params: DepositParams): Promise<DepositResult>
  initiateWithdrawal(params: WithdrawalParams): Promise<WithdrawalResult>
  handleCallback(payload: unknown): Promise<TransactionUpdate>
  verifyWebhook(payload: unknown, signature: string): boolean
  healthCheck(): Promise<boolean>
}
```

### Game Provider
```ts
// lib/integrations/games/{provider}/index.ts
export interface GameProvider {
  getLaunchUrl(params: GameLaunchParams): Promise<string>
  handleCallback(payload: unknown): Promise<GameRoundUpdate>
  verifyWebhook(payload: unknown, signature: string): boolean
  getGameList(): Promise<Game[]>
  healthCheck(): Promise<boolean>
}
```

### Provider Registry
```ts
// lib/integrations/registry.ts
// Register all active providers here — no provider logic anywhere else
```

When adding a new provider: create its folder, implement the interface, register in `registry.ts`. No other files need to change.

---

## Payment Strategy

- **Telco/mobile money is non-negotiable** in every market — primary payment rail
- **First provider to build:** Flutterwave (widest African coverage, most documented)
- **Additional providers:** Flexify, Bisotech — added once pattern is established
- **Future layers:** Crypto, cards, bank transfer — architecture must not prevent these
- **Settlement:** Aggregator settles in agreed currency — confirm FX exposure per provider before signing
- **Player currency:** Always local. UGX for Uganda, KES for Kenya, etc.

Provider selection per market is driven by `geoConfig` — not hardcoded in routes.

---

## Game Strategy

- **Aggregator:** Bitville (not yet signed — integration is speculative until confirmed)
- **Must-have:** Aviator by Spribe — **verify Bitville carries Spribe before building game integration**
- **Verticals at launch:** Slots, Live Casino, Crash/Instant games
- **Sportsbook:** Future — wallet, transaction types, and bonus engine must be architected to support it
- **Game availability:** Can be restricted by market via game metadata

---

## Affiliate System

### Model
- Revenue share per affiliate — rate varies, set per affiliate record
- Tracked via `affiliate_id` on every player — set at registration from URL param `?ref=CODE`
- Revenue = NGR (Net Gaming Revenue) attributed to that affiliate's players

### Phases
- **Phase 1 (launch):** Tracking only. Affiliate data in operator backoffice. Affiliates managed manually.
- **Phase 2 (post-launch):** Affiliate self-serve portal with own login, dashboard, stats.

### Affiliate Record
- Code, name, contact, revenue share %, attributed players, total NGR, commission owed/paid

---

## Bonus Engine

### Triggers
- `register` — on account creation
- `first_deposit` — first successful deposit
- `deposit` — any deposit (optional min amount condition)
- `deposit_over_amount` — deposit >= X
- `cumulative_bets` — total wagered reaches X
- `cumulative_losses` — net loss reaches X (cashback)
- `manual` — ops team awards directly

### Rewards
- `deposit_match` — % of deposit up to max, credited to bonus balance
- `free_spins` — count + game restriction + value per spin
- `free_bonus_cash` — fixed amount to bonus balance

### Rules on every bonus template
- `wagering_requirement` — multiplier (e.g. 30x)
- `game_restrictions` — allowed/excluded game IDs or categories
- `activation_expiry_hours` — hours before unactivated bonus expires
- `wagering_expiry_hours` — hours to complete wagering once activated
- `max_withdrawal` — cap on withdrawable winnings from bonus
- `min_deposit` — minimum deposit to trigger (where applicable)
- `market_scope` — country codes array, null = global

### Bonus Balance Rules
- Bonus balance always separate from cash balance
- Winnings from bonus play stay in bonus balance until wagering complete
- On completion, bonus winnings transfer to cash balance up to `max_withdrawal`
- Expired/cancelled bonuses removed from bonus balance — never converted to cash

---

## Backoffice

### Role Model
Roles are additive — a user can hold multiple.

| Role | Permissions |
|------|-------------|
| `super_admin` | Everything — no restrictions |
| `operations` | Player management, manual adjustments, bonus management |
| `finance` | Transaction history, reports, withdrawal approval |
| `support` | Player view (read only), password reset, account unlock |
| `affiliate_manager` | Affiliate reporting and management only |

### Features at Launch
- **Dashboard:** GGR by market, deposits/withdrawals by day, active players, bonus liability
- **Player management:** Search, view profile, transaction history, manual balance adjustment, bonus award, account lock/unlock
- **Transaction log:** Full log, filter by type/status/market/provider, manual status override
- **Bonus management:** Create/edit/deactivate templates, view active player bonuses, manual award
- **Affiliate management:** Create affiliate, set revenue share, view attributed players and NGR, mark commission paid
- **Reporting:** GGR, deposits, withdrawals, bonuses, player counts — by market and date range

### Manual Adjustment Rules
- Every manual adjustment requires a reason (text field)
- Logged with timestamp and the admin user who made it
- Triggers: failed transaction, goodwill gesture, system error correction

---

## KYC Strategy

- **For now:** Light touch. Telco-only markets self-KYC via registered SIM.
- **Mandatory KYC trigger:** To confirm with Tobique — likely card payments or deposit threshold
- **When cards/crypto added:** Full KYC flow — provider TBD (Sumsub or Onfido)
- **Current approach:** Track `kyc_status` on profile. Gate withdrawals above threshold if required.

---

## Database Schema

### Live in Supabase ✓

All tables below are live. Migration script at `supabase/phase1_migration.sql`.

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
affiliate_id uuid nullable  -- FK → affiliates.id, set at registration, never changed ✓
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

**`public.transactions`** ✓
```sql
id uuid PRIMARY KEY default gen_random_uuid()
player_id uuid NOT NULL (FK → profiles.id)
type text NOT NULL
  -- 'deposit' | 'withdrawal' | 'game_debit' | 'game_credit'
  -- 'bonus_credit' | 'bonus_debit' | 'manual_credit' | 'manual_debit'
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

**`public.game_rounds`** ✓
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

**`public.affiliates`** ✓
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

**`public.affiliate_payouts`** ✓
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

**`public.bonus_templates`** ✓
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
min_deposit numeric(12,2)
market_scope text[]
is_active boolean default true
created_at timestamptz default now()
```

**`public.player_bonuses`** ✓
```sql
id uuid PRIMARY KEY default gen_random_uuid()
player_id uuid NOT NULL (FK → profiles.id)
template_id uuid nullable (FK → bonus_templates.id)
type text NOT NULL
reward_type text NOT NULL
amount numeric(12,2) NOT NULL
wagering_requirement numeric(5,2) NOT NULL
wagered_amount numeric(12,2) default 0
status text NOT NULL
  -- 'pending' | 'active' | 'completed' | 'expired' | 'cancelled'
activated_at timestamptz
expires_at timestamptz
completed_at timestamptz
created_at timestamptz default now()
```

**`public.admin_users`** ✓
```sql
id uuid PRIMARY KEY default gen_random_uuid()
email text UNIQUE NOT NULL
full_name text
roles text[] NOT NULL
is_active boolean default true
created_at timestamptz default now()
last_login timestamptz
```

**`public.banners`** ✓
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
**Storage:** `banners` bucket (public read). Images uploaded via `/api/admin/banners/upload`.

**Auto-trigger:** `on_auth_user_created` → `handle_new_user()` → auto-creates `profiles` + `wallets`.
**RLS:** Enabled on all tables. Players read own rows only. Sensitive tables (affiliates, admin_users, bonus_templates, affiliate_payouts) are service-role-only.

---

## Current File Structure

```
topwager/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Lobby — includes BonusProgressWidget + ReferralBanner (mock)
│   ├── login/page.tsx
│   ├── register/page.tsx           # Ref code cookie capture + read-only referred-by field
│   ├── register/confirm/page.tsx
│   ├── account/page.tsx
│   ├── wallet/page.tsx
│   ├── deposit/page.tsx            # UI only — not wired
│   ├── withdraw/page.tsx           # UI only — not wired
│   ├── bonuses/page.tsx
│   ├── refer/page.tsx              # Bring a Mate dashboard — mock data
│   ├── join/[code]/page.tsx        # Tracking link → sets cookie → redirects to /register
│   ├── slots/page.tsx
│   ├── live/page.tsx
│   ├── crash/page.tsx
│   ├── jackpots/page.tsx
│   ├── terms/page.tsx
│   └── blocked/page.tsx
│
├── app/api/
│   ├── register/complete/route.ts  # Saves phone, currency, affiliate_id after signup
│   └── wallet/
│       ├── balance/route.ts        # GET — returns player's current balances
│       ├── credit/route.ts         # POST — add to balance + log transaction
│       └── debit/route.ts          # POST — subtract from balance + log transaction
│
├── components/
│   ├── Nav.tsx                     # Refer in top nav + mobile bottom nav
│   ├── DemoBanner.tsx
│   ├── GameCard.tsx
│   ├── GeoGate.tsx
│   └── GeoLanguageBar.tsx          # Legacy — not in use
│
├── context/
│   ├── AuthContext.tsx
│   ├── GeoContext.tsx
│   └── I18nContext.tsx
│
├── data/
│   ├── games.ts                    # Static placeholder data
│   └── geoConfig.ts
│
├── locales/
│   └── en.ts / sw.ts / fr.ts
│
├── lib/
│   ├── supabase.ts                 # Browser Supabase client
│   ├── supabase-server.ts          # Server Supabase client + getAuthenticatedUser()
│   ├── wallet.ts                   # credit() / debit() / getBalance() — server-side only
│   └── referral.ts                 # getRefCodeCookie / setRefCodeCookie helpers
│
├── supabase/
│   └── phase1_migration.sql        # Phase 1 schema — already run, kept for reference
│
├── app/admin/
│   ├── (auth)/login/page.tsx       # Admin login — separate from player login
│   ├── (dashboard)/layout.tsx      # Admin shell + sidebar (role-checks via getAdminUser)
│   ├── (dashboard)/page.tsx        # Dashboard — GGR, deposits, players, bonus liability
│   ├── (dashboard)/transactions/   # Transaction log with filters + pagination
│   ├── (dashboard)/players/        # Player list/search + [id] detail + manual adjustment
│   ├── (dashboard)/bonuses/        # Bonus template list/create/toggle
│   ├── (dashboard)/affiliates/     # Affiliate list/create
│   ├── (dashboard)/banners/        # Banner upload/manage (content_manager role)
│   └── _components/AdminSidebar.tsx
│
├── app/api/banners/route.ts            # Public — GET active banners by position (called by frontend)
│
├── app/api/admin/
│   ├── auth/check/route.ts         # Verify admin role after login
│   ├── stats/route.ts              # Dashboard aggregates
│   ├── transactions/route.ts       # Paginated/filtered transaction log
│   ├── players/route.ts            # Player search
│   ├── players/[id]/route.ts       # Player detail
│   ├── players/[id]/adjust/route.ts # Manual credit/debit (logged, requires reason)
│   ├── bonuses/route.ts            # List + create bonus templates
│   ├── bonuses/[id]/route.ts       # Toggle is_active
│   ├── banners/route.ts            # List + create banners
│   ├── banners/[id]/route.ts       # Toggle active / delete
│   └── banners/upload/route.ts     # Upload image to Supabase Storage → returns public URL
│
├── lib/
│   ├── admin-auth.ts               # getAdminUser() / hasRole() / requireAdmin()
│   └── ...
│
├── middleware.ts                   # Protects /admin/* (session check, edge-safe)
├── components/PlayerShell.tsx      # Conditionally renders Nav/GeoGate/footer (skips for /admin)
│
│   # TO BE CREATED — Phase 2:
│   └── lib/integrations/
│       ├── registry.ts
│       ├── payments/
│       │   └── flutterwave/
│       └── games/
│
└── app/api/                        # TO BE CREATED — Phase 2+
    ├── payments/
    └── games/
```

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
  affiliateId?: string              // to be added to AuthContext
}
```

`useAuth()` returns: `{ isLoggedIn, user, session, loading, login, register, logout, refreshUser }`

---

## Geo System

- IP detection: `ipapi.co/json/` — client-side, UX only
- Manual override: `tw_country_manual` in localStorage
- Blocked countries: redirect to `/blocked`
- **All financial API routes enforce country server-side independently**
- localStorage: `tw_country_manual`, `tw_lang`

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

Top: `Home / Slots / Live / Crash (HOT) / Jackpots / Promos (NEW) / Refer (500%)`
Mobile bottom: `Home · Refer · [TW] · Wallet · Account`

Note: Casino/Slots was removed from the mobile bottom nav and replaced with Refer. Slots is still reachable via the top nav tabs. Decision: Bring a Mate is a key revenue driver and should be one tap away on mobile.

---

## Known Bugs / TODOs in Existing Code

- `register/page.tsx` — phone, currency, affiliate_id ARE now saved via `/api/register/complete` ✓ — but the write-once guard uses `phone IS NULL`, so test accounts created before this route existed won't get affiliate_id persisted on re-registration attempts
- `account/page.tsx` — profile update, KYC, password change, 2FA, deposit limits not wired
- `AuthContext.tsx` — `emailRedirectTo` not set to production domain
- `GeoContext.tsx` — IP check client-side only, VPN-spoofable
- `page.tsx` — game thumbnails are placeholders
- `refer/page.tsx` — all data is mock/static (ref code, referees, earnings, bonus WR) — see TODO comments in file
- `page.tsx` — `MOCK_ACTIVE_BONUS` and `MOCK_HAS_REFERRED` are static flags — replace with real API calls once bonus engine and affiliate API routes are live
- `lib/wallet.ts` — `credit()` uses RPC `increment_balance` with a direct-update fallback. The RPC does not yet exist in Supabase — it will always fall back to the read-then-write path. Safe for now; replace with RPC before go-live for full atomicity.

---

## Build Sequence — Follow This Order

### Phase 1 — Foundation ✅ COMPLETE
1. ✅ Schema migration — all tables live in Supabase
2. ✅ `affiliate_id` column added to `profiles`
3. ✅ `lib/wallet.ts` — credit / debit / getBalance
4. ✅ `app/api/wallet/` — balance, credit, debit routes
5. ✅ `app/api/register/complete` — saves phone, currency, affiliate_id on signup

### Phase 2 — Payments ← START HERE
6. `lib/integrations/` scaffold — registry, folder structure, interfaces
7. Flutterwave integration — implement PaymentProvider interface
8. `app/api/payments/` — initiate, callback, webhook
9. Wire deposit/withdraw pages

### Phase 3 — Games
10. Verify Bitville carries Spribe before starting
11. Bitville integration — implement GameProvider interface
12. `app/api/games/` — session creation, callback
13. Wire game launch from GameCard

### Phase 4 — Bonus Engine
14. Bonus template management in backoffice
15. Bonus award logic — trigger detection, reward crediting
16. Wagering tracking on every game round

### Phase 5 — Backoffice ← IN PROGRESS
17. ✅ Admin auth — `lib/admin-auth.ts`, `middleware.ts`, `/admin/login`, `/api/admin/auth/check`
18. ✅ Dashboard — GGR, deposits, active players, bonus liability (`/admin`)
19. ✅ Player management — list/search + detail + manual adjustment (`/admin/players`)
20. ✅ Transaction log — filterable/paginated (`/admin/transactions`)
21. ✅ Bonus template management — list/create/toggle (`/admin/bonuses`)
22. ✅ Affiliate management — list/create (`/admin/affiliates`)

### Phase 6 — Affiliate Portal
23. Affiliate login
24. Affiliate dashboard — players, NGR, commission

---

## Session Rules for Claude Code

- **Start every session** by reading this file and stating what you understand the current state to be
- **State which Phase and step** you are working on
- **Before creating any new file**, check if it belongs in `lib/integrations/`, `app/api/`, or an existing module
- **Before touching the wallet**, confirm `transactions` table exists in Supabase
- **Never** write provider-specific logic into page components or shared UI
- **Always** use the integration interface pattern for new providers
- **Flag immediately** if a task would require breaking an Architecture Rule
- **End every session** with a summary of: what was built, what changed, decisions made, what next session should start with — owner will update this file before next session

---

## Deploy

```bash
cd ~/topwager
git add -A
git commit -m "your message"
git push
```

---

## Release Notes

### v0.4 — Phase 1 Backend Foundation (2026-03-30)

**New lib**
- `lib/wallet.ts` — server-side wallet engine. `credit()`, `debit()`, `getBalance()`. Writes to both `wallets` and `transactions` on every operation. Idempotency key support. Atomic debit guard using `.gte()` filter. Service role only — never imported from client code.
- `lib/supabase-server.ts` — server-side Supabase client + `getAuthenticatedUser()` helper used by all API routes.

**New API routes**
- `GET /api/wallet/balance` — returns `{ cashBalance, bonusBalance, pendingWithdrawal }` for the authenticated player
- `POST /api/wallet/credit` — add to player balance, log transaction. Blocked transaction types enforced per session vs service role.
- `POST /api/wallet/debit` — subtract from player balance, log transaction. Returns `{ error: 'Insufficient balance' }` on shortfall.
- `POST /api/register/complete` — called after `supabase.auth.signUp()`. Saves phone, currency, country, and resolves `refCode` → `affiliate_id` FK. Write-once guard via `phone IS NULL`.

**Database**
- Schema migration run: `transactions`, `game_rounds`, `affiliates`, `affiliate_payouts`, `bonus_templates`, `player_bonuses`, `admin_users` all live in Supabase.
- `affiliate_id` column added to `profiles` with FK to `affiliates`.
- RLS enabled on all new tables. Player-facing tables allow SELECT on own rows. Ops tables (affiliates, admin_users, bonus_templates, affiliate_payouts) are service-role-only.
- Migration script saved to `supabase/phase1_migration.sql` for reference.

**Decisions**
- `credit()` attempts an `increment_balance` RPC first, falls back to read-then-write if RPC doesn't exist. RPC not yet created in Supabase — fallback is active. Flag for replacement before go-live.
- Debit uses `.gte()` atomic guard — safe for current traffic, replace with Postgres RPC before high-volume launch.
- `/api/register/complete` is non-blocking — if profile update fails, the account is still created and the error is logged. Prevents registration failures due to profile extras.

**What Phase 2 needs**
- `lib/integrations/` scaffold — registry, folder structure, PaymentProvider interface
- Flutterwave integration — implement PaymentProvider interface
- `app/api/payments/` — initiate deposit, handle callback, verify webhook
- Wire deposit/withdraw pages to the payment API

---

### v0.3 — Bring a Mate / Referral Programme (2026-03-30)

**New pages**
- `/refer` — Player-facing Bring a Mate dashboard. Sections: referral link display with copy + WhatsApp share + QR code; earnings summary (all-time / this month / pending, split flat reward vs revenue share); active bonus wagering progress bar; anonymised referee pipeline table (P-001, P-002… with status: Registered / Deposited / Playing / Rewarded). Auth-gated — redirects to login if not signed in. All data is mock/static pending backend.
- `/join/[code]` — Clean tracking link format for sharing. Sets `ref_code` cookie (30-day, first-touch) and redirects to `/register` via `router.replace` — referral code never visible in final URL.

**Updated pages**
- `/register` — Referral code now captured from URL `?ref=CODE` param and stored in a first-party cookie (`ref_code`, 30-day, SameSite=Lax). Cookie is read on mount so the code persists across sessions. A read-only "Referred by" badge is shown in the form when a code is present. The promo code field is hidden when a ref code is active (they are mutually exclusive in the UI).
- Lobby (`/`) — Added compact bonus wagering progress widget above the game grid for logged-in users with an active bonus. Added dismissible Bring a Mate promotional banner for logged-in users who haven't referred anyone yet (session-scoped dismissal).

**Updated components**
- `Nav.tsx` — `/refer` added to scrollable top nav tabs with a "500%" badge. In the mobile bottom nav, the Casino/Slots tab was replaced with Refer (Slots remains accessible via top nav tabs).

**New lib**
- `lib/referral.ts` — `getRefCodeCookie()` / `setRefCodeCookie()`. First-touch attribution: cookie is written once and never overwritten. Used by both `/register` and `/join/[code]`.

**New dependency**
- `qrcode.react` v4 — QR code generation on the `/refer` page.

**Decisions**
- First-touch attribution model: the first referrer who drives a registration gets credit, even if the player later visits via a different link.
- Mobile bottom nav priority: Refer > Casino (Slots). Bring a Mate is a primary revenue driver and needs to be one tap away. Slots is available in the top nav scroll.
- Referral code does not appear in the URL after redirect from `/join/[code]` — clean share links.
- All `/refer` data is mock until Phase 1 backend (transactions table, wallet API routes) is complete and the affiliate API is built.

**What to wire up next session**
- `GET /api/affiliates/me` — return player's own referral code (will eventually come from `affiliates` table or a generated code on `profiles`)
- `GET /api/affiliates/referrals` — return anonymised list of referred players + their status
- `GET /api/affiliates/earnings` — all-time, this-month, pending, split by type
- `GET /api/bonuses/active` — return active player bonus with wagered/target amounts
- `POST /api/register/complete` — persist `refCode` to `profiles.affiliate_id` (route exists, persistence not yet implemented)

---

## Session Log

| Date | Summary |
|------|---------|
| 2026-03-30 | Bring a Mate / referral programme — `/refer` page, `/join/[code]` tracking route, cookie-based ref capture on register, lobby bonus widget + referral banner, nav updates. All frontend, all mock data. |
| 2026-03-30 | Phase 1 complete — `lib/wallet.ts`, `lib/supabase-server.ts`, wallet API routes (balance/credit/debit), `/api/register/complete`. Full schema migration run in Supabase: transactions, game_rounds, affiliates, affiliate_payouts, bonus_templates, player_bonuses, admin_users. affiliate_id added to profiles. Phase 2 (Flutterwave) is next. |
| 2026-03-30 | Phase 5 complete — Full backoffice at `/admin`. Admin auth (`lib/admin-auth.ts`, `middleware.ts`), login page, role-gated layout + sidebar. Dashboard (GGR, deposits, players, bonus liability). Transaction log (filterable, paginated). Player list/search + detail + manual adjustment (logged with reason). Bonus template management (list/create/toggle). Affiliate management (list/create with player count). `components/PlayerShell.tsx` added — root layout now admin-clean. All API routes in `app/api/admin/`. To create the first admin user: insert a row into `admin_users` in Supabase with the email of a Supabase auth account + appropriate role. |
| 2026-03-31 | Banner CMS added — `banners` table + Supabase Storage bucket `banners` (public). Admin `/admin/banners` page with image upload, position selector, sort order, toggle active/delete. `content_manager` role added to sidebar. Public `/api/banners` route for frontend. Lobby wired to fetch `lobby_hero` banners — shows CMS images when uploaded, falls back to hardcoded carousel if none. |
