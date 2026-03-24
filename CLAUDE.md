# TopWager — Project Context for Claude

This file is read automatically at the start of every Claude session. Keep it up to date when significant changes are made.

---

## What is this?

**TopWager** is a customer-facing online casino frontend. It is not a demo — real users will sign up and play. The owner has no coding background, so keep code clean, don't over-engineer, and explain non-obvious decisions briefly.

- **Live URL:** https://top-wager-frontend.vercel.app
- **GitHub repo:** alexrutherford-afk/top-wager-frontend
- **Deployment:** Vercel, auto-deploys on push to `main`
- **Licence:** Tobique First Nation (Canada)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, no `src/` dir) |
| React | v19 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` block in globals.css) |
| Language | TypeScript — path alias `@/*` maps to project root |
| Auth + DB | Supabase (`@supabase/ssr`, `createBrowserClient`) |
| Fonts | Geist Sans via `next/font/google` |
| Deploy | Vercel |

---

## Design System

### Colours
```
Background (page):     #0D1117
Background (card):     #131B24
Background (input):    #1A2332
Primary green:         #1A5C38  (dark)  /  #2D7A50  (mid)  /  #3A9E67  (light)
Gold accent:           #F5A623
Red/orange:            #E84D1C  /  #FF7A55
Purple (live):         #7C3AED  /  #A78BFA
Blue:                  #60A5FA
Text muted:            #5A7090
Text secondary:        #7A95B0
Text dimmed:           #3A4A5A
Success green:         #5DE898
```

### Rules
- **All form inputs must use `text-base` (16px minimum)** — prevents iOS zoom on focus
- Dark theme only — no light mode
- Rounded corners: `rounded-xl` for inputs/buttons, `rounded-2xl` for cards
- Font weight: `font-black` for headings/CTAs, `font-bold` for labels
- No emojis added unless already present in the design

---

## Project Structure

```
topwager/
├── app/
│   ├── layout.tsx                  # Root layout: Nav + GeoGate + footer
│   ├── page.tsx                    # Lobby (homepage): ticker, carousel, jackpot bar, game grid
│   ├── login/page.tsx              # Supabase login
│   ├── register/page.tsx           # Single-screen registration (email, phone, password, T&C)
│   ├── register/confirm/page.tsx   # "Check your email" post-register page
│   ├── account/page.tsx            # Profile, Security, Responsible Gambling tabs
│   ├── wallet/page.tsx             # Wallet overview
│   ├── deposit/page.tsx            # Deposit flow
│   ├── withdraw/page.tsx           # Withdrawal flow
│   ├── bonuses/page.tsx            # Promotions page
│   ├── slots/page.tsx              # Slots category page (filter pills + game grid)
│   ├── live/page.tsx               # Live casino page (live row + grid)
│   ├── crash/page.tsx              # Crash/instant games (Aviator featured)
│   ├── jackpots/page.tsx           # Jackpots page with live ticking counters
│   ├── terms/page.tsx              # Terms & Conditions + Privacy Policy
│   └── blocked/page.tsx            # Geo-block page for restricted countries
│
├── components/
│   ├── Nav.tsx                     # Sticky header + mobile bottom nav
│   ├── DemoBanner.tsx              # Top micro-bar: Sign in / Join Free / Sign out
│   ├── GameCard.tsx                # Shared game tile (3/4 aspect ratio, hover overlay)
│   ├── GeoGate.tsx                 # Redirects blocked countries to /blocked
│   └── GeoLanguageBar.tsx          # (legacy, not used in nav)
│
├── context/
│   ├── AuthContext.tsx             # Supabase auth: login, register, logout, refreshUser
│   ├── GeoContext.tsx              # IP detection + manual country override
│   └── I18nContext.tsx             # EN / SW / FR translations via t()
│
├── data/
│   ├── games.ts                    # GAMES array: slots, live, table, jackpot. Placeholder thumbs.
│   └── geoConfig.ts                # Per-country config: currency, callingCode, paymentMethods, allowed/blocked
│
├── locales/
│   ├── en.ts / sw.ts / fr.ts       # Translation string files
│
├── lib/
│   └── supabase.ts                 # createBrowserClient wrapper
│
├── .env.local                      # NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (gitignored)
└── CLAUDE.md                       # This file
```

---

## Authentication — AuthContext

`AuthUser` type:
```ts
type AuthUser = {
  id: string;
  email: string;
  name: string;           // full_name from profiles table
  currency: string;       // e.g. 'KES', 'EUR'
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  vipLevel: number;
  cashBalance: number;
  bonusBalance: number;
  pendingWithdrawal: number;
};
```

`useAuth()` returns: `{ isLoggedIn, user, session, loading, login, register, logout, refreshUser }`

Data is fetched from `profiles` and `wallets` tables on every session restore.

---

## Supabase Database Schema

### `public.profiles`
```sql
id uuid PRIMARY KEY (references auth.users)
full_name text
date_of_birth date
phone text
currency text default 'EUR'
kyc_status text default 'not_submitted'
vip_level integer default 0
marketing_opt_in boolean default false
created_at / updated_at timestamptz
```

### `public.wallets`
```sql
id uuid PRIMARY KEY
player_id uuid UNIQUE (FK → profiles.id)
cash_balance numeric(12,2) default 0.00
bonus_balance numeric(12,2) default 0.00
pending_withdrawal numeric(12,2) default 0.00
```

### Auto-trigger
`on_auth_user_created` fires on `auth.users` INSERT → calls `handle_new_user()` → auto-creates `profiles` + `wallets` rows. No manual insertion needed on signup.

### RLS
Enabled on both tables. Players can only read/update their own rows.

---

## Geo / Country System

- IP detection via `ipapi.co/json/` on every page load (never cached).
- Manual override stored as `tw_country_manual` in localStorage.
- Blocked countries (US, UK, AU, EU regulated markets) redirect to `/blocked`.
- Reset button on `/register` clears `tw_country_manual` and `tw_country` — for iOS WebView testing.
- **TODO:** Move IP check server-side to prevent VPN spoofing.

localStorage keys:
- `tw_country_manual` — player's manual country selection
- `tw_lang` — player's manual language selection

---

## Internationalisation

Languages: `en`, `sw` (Swahili), `fr`

Usage: `const { t, lang, setLang } = useI18n(); t('register_title')`

Language auto-sets to country default on IP detection (unless `tw_lang` already set).

---

## Navigation

### Top nav tabs
```
Home /    Slots /slots    Live /live    Crash /crash (HOT badge)    Jackpots /jackpots    Promos /bonuses (NEW badge)
```

### Bottom mobile nav (fixed)
Home · Casino (`/slots`) · TW centre button · Wallet · Account

---

## Known TODOs (marked in code as `// TODO: Backend`)

- `register/page.tsx` — save phone, promoCode, currency to profiles table on signup
- `account/page.tsx` — wire up profile update, KYC status fetch, change password, 2FA setup, deposit limits, self-exclusion
- `AuthContext.tsx` — set `emailRedirectTo` to production domain
- `GeoContext.tsx` — move IP check server-side
- `page.tsx` — swap game thumbnails for real CDN URLs from provider API

---

## Pending Features (not yet built)

- Payment method integration (M-Pesa, cards — varies by country)
- KYC document upload + verification flow
- Real game launch (iframe or redirect to provider)
- Bonus engine (wagering requirements, activation, expiry)
- Email templates (welcome, password reset, KYC approved)
- Admin dashboard

---

## How to Deploy

```bash
cd ~/topwager
git add -A
git commit -m "your message"
git push
```

Vercel auto-deploys on push to `main`. Takes ~1 minute.

---

## Chat Structure

Split work across focused chats — each reads this file on start so no context is lost:

| Chat | Scope |
|------|-------|
| **Auth & Account** | Login, register, account page, KYC, Supabase auth |
| **Lobby & Games** | Homepage, /slots /live /crash /jackpots, carousel, game data |
| **Wallet & Payments** | Deposit, withdraw, wallet page, payment providers |
| **Bonuses & Promos** | /bonuses, bonus logic, promotions display |
| **Backend / Supabase** | SQL schema, RLS, API routes, triggers, server-side logic |

**Update this file** whenever: new pages are added, schema changes, new context/hooks are created, design rules change.
