# TopWager Casino — Project Progress

_Last updated: 2026-03-20_

---

## Where the code lives

| Thing | Location |
|---|---|
| **Local code** | `~/casino-frontend` (i.e. `/Users/alexrutherford/casino-frontend`) |
| **GitHub repo** | https://github.com/alexrutherford-afk/casino-frontend |
| **Live site (Vercel)** | Auto-deploys on every `git push` — production URL on your Vercel dashboard (no `-git-main-` in the URL) |

To open the project in VS Code: `code ~/casino-frontend`
To run it locally: `cd ~/casino-frontend && npm run dev` → opens at http://localhost:3000
To deploy: `git add . && git commit -m "your message" && git push`

---

## What's been built (frontend shell)

### Stack
- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4**
- No `src/` folder — pages are at `app/`
- Path alias: `@/*` → project root

### Design system
| Token | Value |
|---|---|
| Primary green | `#1A5C38` |
| Gold accent | `#F5A623` |
| Orange CTA | `#E84D1C` |
| Background | `#07090F` |
| Card surface | `#0D1117` |
| Font | Geist (Google) |

---

### Pages built

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | ✅ Full lobby — ticker, banner carousel, jackpot bar, category pills, game grid, live casino row, promos |
| `/login` | `app/login/page.tsx` | ✅ TopWager theme, demo one-click login button, any credentials accepted |
| `/register` | `app/register/page.tsx` | ✅ 3-step form (email/password → personal details → confirm) with progress bar |
| `/wallet` | `app/wallet/page.tsx` | ✅ Tabbed: Deposit / Withdraw / Transactions. Full flow with confirm + success screens, balance validation |
| `/bonuses` | `app/bonuses/page.tsx` | ✅ Active bonuses with wagering progress bars, available offers, expired section |
| `/account` | `app/account/page.tsx` | ✅ Profile header, VIP badge, stats row, tabbed: Profile / Security / Responsible Gambling |
| `/deposit` | `app/deposit/page.tsx` | ⚠️ Old standalone page — superseded by `/wallet` tab. Can be deleted or redirected. |
| `/withdraw` | `app/withdraw/page.tsx` | ⚠️ Old standalone page — superseded by `/wallet` tab. Can be deleted or redirected. |

---

### Key files

```
casino-frontend/
├── app/
│   ├── layout.tsx          ← Root layout, wraps everything in Nav + DemoBanner + Footer
│   ├── globals.css         ← Tailwind v4 + TopWager colour tokens + animations
│   ├── providers.tsx       ← Client wrapper (AuthProvider)
│   ├── page.tsx            ← Lobby
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── wallet/page.tsx
│   ├── bonuses/page.tsx
│   └── account/page.tsx
├── components/
│   ├── Nav.tsx             ← Top nav + mobile bottom bar (auth-aware)
│   └── DemoBanner.tsx      ← "Preview logged-in / Switch to guest" toggle bar
├── context/
│   └── AuthContext.tsx     ← Mock auth via localStorage (isLoggedIn, login, logout, user)
├── data/
│   ├── games.ts            ← 29 games (slots/live/table/jackpot) with placeholder thumbnail URLs
│   └── mockUser.ts         ← Mock user, balance, transactions, bonuses, payment methods
└── PROGRESS.md             ← This file
```

---

### Demo / mock auth

- Any email + any password on the login page will log you in
- `DemoBanner` at the top of every page lets you toggle logged-in ↔ guest in one click
- Auth state saved to `localStorage` so it persists across refresh
- All auth calls have `// TODO: Backend — POST /auth/login` style comments for handoff

---

### Backend handoff notes

Every interactive action (login, register, deposit, withdraw, profile save, KYC, 2FA, limits) has a `// TODO: Backend` comment with the HTTP method, endpoint, and payload shape. Search for `TODO: Backend` across the codebase to find every integration point.

---

## What still needs doing (frontend)

- [ ] Remove/redirect old `/deposit` and `/withdraw` standalone pages (now tabs in `/wallet`)
- [ ] Add real game thumbnail images (swap `placehold.co` URLs in `data/games.ts` for CDN URLs)
- [ ] Add game detail / launch modal
- [ ] Search / filter on game grid
- [ ] Responsible gambling pop-up on first load

---

## Paused — moving to CMS

Frontend work paused 2026-03-20. Next focus: building a CMS.
