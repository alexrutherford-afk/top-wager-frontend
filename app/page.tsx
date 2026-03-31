'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GAMES, type Game } from '@/data/games';

// ── Mock bonus data ───────────────────────────────────────────────────────────
// TODO: replace with real active bonus from /api/bonuses/active
const MOCK_ACTIVE_BONUS = {
  label:   'Welcome Bonus',
  amount:  50_000,
  wagered: 112_400,
  target:  250_000,
};
// TODO: replace with real referral stats from /api/affiliates/me
const MOCK_HAS_REFERRED = false; // false = show Bring a Mate banner

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString();

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ loggedIn, firstName }: { loggedIn: boolean; firstName?: string }) {
  const guestText = `Back Yourself — Join TopWager Free \u00a0•\u00a0 ✈️ Aviator Weekly Prize: KES 25,000 \u00a0•\u00a0 💰 100% Welcome Bonus up to €500 \u00a0•\u00a0 ⚡ Instant withdrawals \u00a0•\u00a0 🎰 1,000+ Casino Games \u00a0\u00a0\u00a0\u00a0\u00a0`;
  const authText = `Welcome back, ${firstName}! 🎉 Your 10% cashback is ready \u00a0•\u00a0 ✈️ Aviator Weekly Prize: KES 25,000 \u00a0•\u00a0 🎰 New: 50 free spins available \u00a0•\u00a0 🏆 VIP Gold — keep climbing! \u00a0\u00a0\u00a0\u00a0\u00a0`;
  const text = loggedIn ? authText : guestText;
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-white overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #1A5C38, #2D7A50)' }}
    >
      <span>{loggedIn ? '👋' : '🎉'}</span>
      <div className="flex-1 overflow-hidden">
        <span className="ticker-inner">{text}{text}</span>
      </div>
      <Link
        href={loggedIn ? '/bonuses' : '/register'}
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-black text-[#0A0E14]"
        style={{ background: '#F5A623' }}
      >
        {loggedIn ? 'My Promos' : 'Join Free'}
      </Link>
    </div>
  );
}

// ── CMS Banner Carousel ───────────────────────────────────────────────────────
interface CmsBanner { id: string; title: string; image_url: string; link_url: string | null }

function CmsBannerCarousel({ banners }: { banners: CmsBanner[] }) {
  const [active, setActive] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const next = useCallback(() => setActive((a) => (a + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setActive((a) => (a - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, banners.length]);

  const b = banners[active];
  const content = (
    <div
      className="relative overflow-hidden"
      style={{ height: 160 }}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (diff > 50) next(); else if (diff < -50) prev();
        setTouchStartX(null);
      }}
    >
      <img src={b.image_url} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );

  return (
    <div style={{ background: '#131B24' }}>
      {b.link_url ? <a href={b.link_url}>{content}</a> : content}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className="rounded-full transition-all duration-300"
              style={{ width: i === active ? 16 : 5, height: 5, background: i === active ? '#F5A623' : '#283848' }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Banner Carousel (hardcoded fallback) ──────────────────────────────────────
const BANNERS_GUEST = [
  {
    bg: 'linear-gradient(125deg,#060F0A 0%,#0F2318 45%,#1A3020 100%)',
    glow: 'radial-gradient(ellipse at 95% 50%,rgba(245,166,35,0.2) 0%,transparent 55%)',
    badge: { label: '⭐ Welcome Offer', style: { background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.4)', color:'#F5A623' } },
    heading: <>First Deposit,<br /><span style={{ color:'#F5A623' }}>Doubled.</span></>,
    sub: <>100% up to <strong>€500</strong>. No wagering nonsense.</>,
    cta: { label: 'Claim Bonus →', href: '/register', style: { background:'#F5A623', color:'#0A0E14', boxShadow:'0 4px 12px rgba(245,166,35,0.4)' } },
    art: <div style={{textAlign:'center'}}><div style={{fontSize:52,fontWeight:900,color:'#F5A623',textShadow:'0 0 28px rgba(245,166,35,0.45)',lineHeight:1}}>100%</div><div style={{fontSize:9,fontWeight:700,color:'rgba(245,166,35,0.55)',letterSpacing:'0.06em'}}>MATCH</div></div>,
  },
  {
    bg: 'linear-gradient(135deg,#080C12 0%,#16082A 55%,#200A36 100%)',
    glow: 'radial-gradient(ellipse at 82% 50%,rgba(232,77,28,0.24) 0%,transparent 55%)',
    badge: { label: '● Live Now', style: { background:'rgba(232,77,28,0.2)', border:'1px solid rgba(232,77,28,0.45)', color:'#FF7A55' } },
    heading: <><span style={{color:'#FF7A55'}}>Aviator</span><br />Weekly Prize</>,
    sub: <strong style={{fontSize:20,color:'#F5A623',display:'block',marginBottom:4}}>KES 25,000</strong>,
    cta: { label: 'Fly Now →', href: '/?cat=crash', style: { background:'#E84D1C', color:'white', boxShadow:'0 4px 12px rgba(232,77,28,0.4)' } },
    art: <span style={{fontSize:60,filter:'drop-shadow(0 0 16px rgba(232,77,28,0.5))'}}>✈️</span>,
  },
  {
    bg: 'linear-gradient(135deg,#070710 0%,#100620 55%,#18082E 100%)',
    glow: 'radial-gradient(ellipse at 85% 50%,rgba(124,58,237,0.28) 0%,transparent 55%)',
    badge: { label: '● Live 24/7', style: { background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.4)', color:'#A78BFA' } },
    heading: <>Real Dealers.<br /><span style={{color:'#A78BFA'}}>Real Stakes.</span></>,
    sub: <>Blackjack, Roulette &amp; Baccarat.<br /><strong>Live in English.</strong></>,
    cta: { label: 'Go Live →', href: '/?cat=live', style: { background:'#7C3AED', color:'white', boxShadow:'0 4px 12px rgba(124,58,237,0.5)' } },
    art: <span style={{fontSize:60,filter:'drop-shadow(0 0 18px rgba(124,58,237,0.5))',opacity:0.85}}>🃏</span>,
  },
  {
    bg: 'linear-gradient(125deg,#0E0A00 0%,#1E1400 50%,#2A1C00 100%)',
    glow: 'radial-gradient(ellipse at 88% 42%,rgba(245,166,35,0.26) 0%,transparent 55%)',
    badge: { label: '🔥 Jackpot', style: { background:'rgba(232,77,28,0.18)', border:'1px solid rgba(232,77,28,0.4)', color:'#FF7A55' } },
    heading: <>Mega Jackpot<br /><span style={{color:'#3A9E67'}}>Growing Now</span></>,
    sub: <strong style={{fontSize:20,color:'#F5A623',display:'block',marginBottom:4}}>€4,827,650</strong>,
    cta: { label: 'Spin Now →', href: '/?cat=jackpot', style: { background:'#F5A623', color:'#0A0E14', boxShadow:'0 4px 12px rgba(245,166,35,0.4)' } },
    art: <span style={{fontSize:64,filter:'drop-shadow(0 0 22px rgba(245,166,35,0.5))',opacity:0.88}}>🏆</span>,
  },
];

function BannerCarousel() {
  const [active, setActive] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const next = useCallback(() => setActive((a) => (a + 1) % BANNERS_GUEST.length), []);
  const prev = useCallback(() => setActive((a) => (a - 1 + BANNERS_GUEST.length) % BANNERS_GUEST.length), []);

  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next]);

  const b = BANNERS_GUEST[active];
  return (
    <div style={{ background: '#131B24' }}>
      <div
        className="relative overflow-hidden"
        style={{ height: 160 }}
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (diff > 50) next();
          else if (diff < -50) prev();
          setTouchStartX(null);
        }}
      >
        <div className="absolute inset-0" style={{ background: b.bg }} />
        <div className="absolute inset-0" style={{ background: b.glow }} />
        {/* Art */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">{b.art}</div>
        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-center px-4">
          <div className="mb-1.5 inline-flex w-fit items-center gap-1 rounded px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider" style={b.badge.style}>
            {b.badge.label}
          </div>
          <div className="mb-1 text-xl font-black leading-tight text-white" style={{ maxWidth: 200, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{b.heading}</div>
          <div className="mb-2.5 text-[10.5px] leading-relaxed" style={{ color: '#7A95B0', maxWidth: 188 }}>{b.sub}</div>
          <Link href={b.cta.href} className="inline-flex w-fit items-center rounded-full px-4 py-1.5 text-xs font-black" style={b.cta.style as React.CSSProperties}>
            {b.cta.label}
          </Link>
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 py-2" style={{ background: '#131B24' }}>
        {BANNERS_GUEST.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === active ? 16 : 5, height: 5, background: i === active ? '#F5A623' : '#283848' }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Jackpot Bar ───────────────────────────────────────────────────────────────
function JackpotBar() {
  const [amount, setAmount] = useState(4827650);
  useEffect(() => {
    const t = setInterval(() => setAmount((a) => a + Math.floor(Math.random() * 3 + 1)), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-b border-[rgba(245,166,35,0.15)]" style={{ background: 'linear-gradient(90deg,#0E0A00,#1C1200,#0E0A00)' }}>
      <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#F5A623' }}>🏆 Mega Jackpot</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(245,166,35,0.1)' }} />
      <span className="text-lg font-black tabular-nums" style={{ color: '#F5A623', textShadow: '0 0 18px rgba(245,166,35,0.4)' }}>€{fmt(amount)}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(245,166,35,0.1)' }} />
      <Link href="/?cat=jackpot" className="rounded-full border px-3 py-1 text-[9.5px] font-black" style={{ borderColor: 'rgba(245,166,35,0.25)', color: '#F5A623', background: 'rgba(245,166,35,0.1)' }}>
        Play
      </Link>
    </div>
  );
}

// ── Category Pills ────────────────────────────────────────────────────────────
const CATS = [
  { value: 'all', icon: '⭐', label: 'Featured' },
  { value: 'crash', icon: '✈️', label: 'Aviator' },
  { value: 'slots', icon: '🎰', label: 'Slots' },
  { value: 'live', icon: '🃏', label: 'Live' },
  { value: 'table', icon: '📊', label: 'Table' },
  { value: 'jackpot', icon: '💰', label: 'Jackpots' },
];

// ── Live Casino Row ───────────────────────────────────────────────────────────
const LIVE_GAMES = [
  { id: 'lr', icon: '🎡', name: 'Live Roulette', provider: 'Evolution', players: 342, min: '€1', bg: 'linear-gradient(135deg,#1A0000,#3A0808,#1A0404)' },
  { id: 'bj', icon: '🃏', name: 'Blackjack VIP', provider: 'Pragmatic Live', players: 189, min: '€10', bg: 'linear-gradient(135deg,#001A10,#003A20,#001A10)' },
  { id: 'bc', icon: '💎', name: 'Baccarat', provider: 'Evolution', players: 97, min: '€5', bg: 'linear-gradient(135deg,#10001A,#20003A,#10001A)' },
  { id: 'dc', icon: '🎲', name: 'Dream Catcher', provider: 'Evolution', players: 214, min: '€1', bg: 'linear-gradient(135deg,#001018,#002030,#001018)' },
  { id: 'ct', icon: '🎪', name: 'Crazy Time', provider: 'Evolution', players: 521, min: '€1', bg: 'linear-gradient(135deg,#180A00,#301500,#180A00)' },
];

// ── Promo Cards ───────────────────────────────────────────────────────────────
const PROMOS = [
  { icon: '💸', tag: { label: 'Daily', color: '#5DE898' }, title: '10% Cashback', bg: 'linear-gradient(135deg,#061510,#0C2418,#081C10)' },
  { icon: '🎰', tag: { label: 'Slots', color: '#A78BFA' }, title: '50 Free Spins', bg: 'linear-gradient(135deg,#0A060E,#18081E,#100412)' },
  { icon: '👫', tag: { label: 'Refer', color: '#F5A623' }, title: 'Invite & Earn', bg: 'linear-gradient(135deg,#100C00,#201800,#161000)' },
  { icon: '🔄', tag: { label: 'Weekly', color: '#60A5FA' }, title: 'Reload Bonus', bg: 'linear-gradient(135deg,#060A14,#0C1428,#060E1C)' },
];

// ── Game Card (compact 3-col style) ──────────────────────────────────────────
const GAME_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  hot:    { label: 'HOT',     bg: '#E84D1C', color: 'white' },
  new:    { label: 'NEW',     bg: '#F5A623', color: '#0A0E14' },
  live:   { label: 'LIVE',    bg: '#E84D1C', color: 'white' },
  top:    { label: 'TOP',     bg: '#1A5C38', color: 'white' },
  jackpot:{ label: 'JACKPOT', bg: 'linear-gradient(90deg,#F5A623,#E8950F)', color: '#0A0E14' },
};

function GameCard({ game }: { game: Game }) {
  const badge = game.isHot ? GAME_BADGE.hot : game.isNew ? GAME_BADGE.new : game.category === 'live' ? GAME_BADGE.live : game.category === 'jackpot' ? GAME_BADGE.jackpot : GAME_BADGE.top;
  return (
    <div className="game-card relative cursor-pointer overflow-hidden rounded-lg border border-white/[0.04]" style={{ aspectRatio: '3/4' }}>
      {/* Placeholder thumbnail — replace src with real CDN URL from game provider */}
      {/* TODO: Backend — swap game.thumb for real thumbnail URL from provider API */}
      <img
        src={game.thumb}
        alt={game.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Label gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-1 pb-1.5 pt-5 text-center text-[8.5px] font-black uppercase tracking-wide text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)' }}>
        {game.name}
      </div>
      {/* Badge */}
      <div className="absolute left-1 top-1 rounded px-1 py-px text-[7px] font-black" style={{ background: badge.bg, color: badge.color }}>
        {badge.label}
      </div>
      {/* Jackpot amount */}
      {game.jackpotAmount && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center">
          <span className="rounded-full px-2 py-0.5 text-[8px] font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>{game.jackpotAmount}</span>
        </div>
      )}
      {/* Hover overlay */}
      <div className="play-overlay absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/80">
        <p className="text-[10px] font-bold text-white text-center px-2 leading-tight">{game.name}</p>
        <p className="text-[9px]" style={{ color: '#7A95B0' }}>{game.provider}</p>
        <button className="mt-1 rounded-full px-4 py-1 text-[10px] font-black text-[#0A0E14] hover:opacity-90" style={{ background: '#F5A623' }}>
          Play Now
        </button>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, href }: { icon: string; title: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <span className="flex items-center gap-1.5 text-sm font-black text-white">
        <span>{icon}</span> {title}
      </span>
      <Link href={href} className="text-[10.5px] font-semibold" style={{ color: '#F5A623' }}>See All →</Link>
    </div>
  );
}

const Separator = () => <div className="h-[5px] border-t border-b border-white/[0.04]" style={{ background: '#131B24' }} />;

// ── Bonus Progress Widget ─────────────────────────────────────────────────────
function BonusProgressWidget() {
  const pct = Math.min(100, Math.round((MOCK_ACTIVE_BONUS.wagered / MOCK_ACTIVE_BONUS.target) * 100));
  return (
    <div
      className="mx-3 mt-2 rounded-2xl px-4 py-3 border"
      style={{ background: '#131B24', borderColor: 'rgba(58,158,103,0.25)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#5A7090' }}>Active Bonus</span>
          <p className="text-sm font-black text-white leading-tight">{MOCK_ACTIVE_BONUS.label}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black" style={{ color: '#F5A623' }}>
            {MOCK_ACTIVE_BONUS.amount.toLocaleString()} UGX
          </p>
          <Link href="/refer" className="text-[9.5px] font-semibold" style={{ color: '#3A9E67' }}>
            View details →
          </Link>
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full" style={{ background: '#1A2332' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #1A5C38, #3A9E67)',
            boxShadow: '0 0 6px rgba(58,158,103,0.45)',
          }}
        />
      </div>
      <p className="mt-1.5 text-[9px]" style={{ color: '#5A7090' }}>
        {MOCK_ACTIVE_BONUS.wagered.toLocaleString()} / {MOCK_ACTIVE_BONUS.target.toLocaleString()} UGX wagered &nbsp;·&nbsp;
        <span style={{ color: '#5DE898', fontWeight: 700 }}>{pct}% complete</span>
      </p>
    </div>
  );
}

// ── Referral Banner ───────────────────────────────────────────────────────────
function ReferralBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="mx-3 mt-2 rounded-2xl overflow-hidden relative border"
      style={{
        background: 'linear-gradient(125deg, #100C00 0%, #201800 55%, #1A1200 100%)',
        borderColor: 'rgba(245,166,35,0.25)',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 90% 50%, rgba(245,166,35,0.12) 0%, transparent 60%)' }} />
      <div className="relative flex items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <div className="mb-1 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-wider"
            style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>
            Bring a Mate
          </div>
          <p className="text-sm font-black text-white leading-tight">
            Invite a friend,<br />
            <span style={{ color: '#F5A623' }}>earn 500% bonus</span>
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: '#7A95B0' }}>
            Both of you get rewarded
          </p>
          <Link
            href="/refer"
            className="mt-2 inline-block rounded-full px-4 py-1.5 text-xs font-black text-[#0A0E14]"
            style={{ background: '#F5A623' }}
          >
            Get my link →
          </Link>
        </div>
        <div className="shrink-0 text-[52px] leading-none opacity-60">
          🤝
        </div>
      </div>
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
        style={{ background: 'rgba(0,0,0,0.4)', color: '#5A7090' }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Welcome back bar ──────────────────────────────────────────────────────────
function WelcomeBar({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[rgba(26,92,56,0.3)] px-3 py-2" style={{ background: 'linear-gradient(90deg, rgba(26,92,56,0.3), rgba(26,92,56,0.1))' }}>
      <span className="text-xs font-semibold text-white">Welcome back, <span style={{ color: '#F5A623', fontWeight: 800 }}>{name}</span> 👋</span>
      <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#5DE898' }}>🔥 5-day streak</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const GAME_TABS = ['All', 'Popular', 'Crash', 'New', 'Table'];

export default function LobbyPage() {
  const { isLoggedIn, user } = useAuth();
  const [activeCat, setActiveCat] = useState('all');
  const [gameTab, setGameTab] = useState('All');
  const [referralBannerDismissed, setReferralBannerDismissed] = useState(false);
  const [heroBanners, setHeroBanners] = useState<CmsBanner[]>([]);

  useEffect(() => {
    fetch('/api/banners?position=lobby_hero')
      .then(r => r.json())
      .then(j => { if (j.banners?.length) setHeroBanners(j.banners) })
      .catch(() => {})
  }, []);

  // Persist dismissal for the session (resets on page reload)
  const dismissReferralBanner = () => setReferralBannerDismissed(true);

  const filteredGames = GAMES.filter((g) => {
    if (activeCat === 'all') return true;
    if (activeCat === 'crash') return g.id.includes('aviator') || g.category === 'slots'; // crash games mapped to slots
    return g.category === activeCat;
  }).slice(0, 9);

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117' }}>

      {/* Ticker */}
      <Ticker loggedIn={isLoggedIn} firstName={user?.name.split(' ')[0]} />

      {/* Welcome bar (logged in) */}
      {isLoggedIn && user && <WelcomeBar name={user.name.split(' ')[0]} />}

      {/* Bonus wagering progress — logged-in users with an active bonus only */}
      {/* TODO: replace MOCK_ACTIVE_BONUS with real data from /api/bonuses/active */}
      {isLoggedIn && user && <BonusProgressWidget />}

      {/* Bring a Mate referral banner — logged-in users who haven't referred anyone yet */}
      {/* TODO: replace MOCK_HAS_REFERRED with real check from /api/affiliates/me */}
      {isLoggedIn && user && !MOCK_HAS_REFERRED && !referralBannerDismissed && (
        <ReferralBanner onDismiss={dismissReferralBanner} />
      )}

      {/* Banner carousel — CMS banners when available, hardcoded fallback otherwise */}
      {heroBanners.length > 0 ? <CmsBannerCarousel banners={heroBanners} /> : <BannerCarousel />}

      {/* Jackpot bar */}
      <JackpotBar />

      {/* Category pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2" style={{ background: '#131B24' }}>
        {CATS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCat(cat.value)}
            className="flex shrink-0 flex-col items-center gap-1 rounded-lg border px-4 py-2 transition-colors min-w-[60px]"
            style={{
              background: activeCat === cat.value ? '#1A5C38' : '#1A2332',
              borderColor: activeCat === cat.value ? '#2D7A50' : 'rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-lg leading-none">{cat.icon}</span>
            <span className="text-[8.5px] font-bold uppercase tracking-wide" style={{ color: activeCat === cat.value ? 'white' : '#5A7090' }}>{cat.label}</span>
          </button>
        ))}
      </div>

      <Separator />

      {/* Live Casino */}
      <SectionHeader icon="🔴" title="Live Casino" href="/?cat=live" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-3">
        {LIVE_GAMES.map((g) => (
          <div key={g.id} className="shrink-0 w-36 cursor-pointer overflow-hidden rounded-lg border border-white/[0.07]" style={{ background: '#1A2332' }}>
            <div className="relative flex h-20 items-center justify-center overflow-hidden" style={{ background: g.bg }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%,rgba(245,166,35,0.1) 0%,transparent 65%)' }} />
              <span className="text-[40px]" style={{ filter: 'drop-shadow(0 0 14px rgba(245,166,35,0.3))', zIndex: 1 }}>{g.icon}</span>
              <span className="absolute left-1.5 top-1.5 rounded px-1.5 py-px text-[7px] font-black text-white blink" style={{ background: '#E84D1C' }}>LIVE</span>
              <span className="absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-px text-[8px]" style={{ background: 'rgba(0,0,0,0.6)', color: '#7A95B0' }}>👤 {g.players}</span>
            </div>
            <div className="px-2 py-1.5">
              <p className="text-[10.5px] font-black text-white truncate">{g.name}</p>
              <p className="text-[8.5px]" style={{ color: '#5A7090' }}>{g.provider}</p>
              <p className="mt-0.5 text-[8.5px] font-semibold" style={{ color: '#F5A623' }}>From {g.min}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Featured games */}
      <SectionHeader icon="⭐" title="Featured Games" href="/" />
      {/* Game tabs */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2">
        {GAME_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setGameTab(t)}
            className="shrink-0 rounded-full border px-3 py-1 text-[10.5px] font-bold transition-colors"
            style={{
              background: gameTab === t ? '#F5A623' : '#1A2332',
              borderColor: gameTab === t ? '#F5A623' : 'rgba(255,255,255,0.1)',
              color: gameTab === t ? '#0A0E14' : '#5A7090',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 pb-3 sm:grid-cols-4 md:grid-cols-6">
        {filteredGames.map((g) => <GameCard key={g.id} game={g} />)}
      </div>

      <Separator />

      {/* Promotions */}
      <SectionHeader icon="🎁" title="Promotions" href="/bonuses" />
      <div className="grid grid-cols-2 gap-2 px-3 pb-6">
        {PROMOS.map((p) => (
          <Link
            key={p.title}
            href="/bonuses"
            className="relative h-20 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: p.bg }}
          >
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-4xl opacity-70">{p.icon}</span>
            <div className="absolute inset-0 flex flex-col justify-center px-3">
              <p className="mb-1 text-[7.5px] font-black uppercase tracking-wider" style={{ color: p.tag.color }}>{p.tag.label}</p>
              <p className="text-xs font-black leading-tight text-white">{p.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
