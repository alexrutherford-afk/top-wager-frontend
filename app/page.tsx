'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GAMES, type Game } from '@/data/games';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString();

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ loggedIn, firstName }: { loggedIn: boolean; firstName?: string }) {
  const guestText = `Back Yourself — Join Castle Bet Free \u00a0•\u00a0 ✈️ Aviator Weekly Prize: KES 25,000 \u00a0•\u00a0 💰 100% Welcome Bonus up to €500 \u00a0•\u00a0 ⚡ Instant withdrawals \u00a0•\u00a0 🎰 1,000+ Casino Games \u00a0\u00a0\u00a0\u00a0\u00a0`;
  const authText = `Welcome back, ${firstName}! 🎉 Your 10% cashback is ready \u00a0•\u00a0 ✈️ Aviator Weekly Prize: KES 25,000 \u00a0•\u00a0 🎰 New: 50 free spins available \u00a0•\u00a0 🏆 VIP Gold — keep climbing! \u00a0\u00a0\u00a0\u00a0\u00a0`;
  const text = loggedIn ? authText : guestText;
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-white overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #0778BD, #0560A0)' }}
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

// ── Banner Carousel ───────────────────────────────────────────────────────────
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
    heading: <>Mega Jackpot<br /><span style={{color:'#1A9FE0'}}>Growing Now</span></>,
    sub: <strong style={{fontSize:20,color:'#F5A623',display:'block',marginBottom:4}}>€4,827,650</strong>,
    cta: { label: 'Spin Now →', href: '/?cat=jackpot', style: { background:'#F5A623', color:'#0A0E14', boxShadow:'0 4px 12px rgba(245,166,35,0.4)' } },
    art: <span style={{fontSize:64,filter:'drop-shadow(0 0 22px rgba(245,166,35,0.5))',opacity:0.88}}>🏆</span>,
  },
];

function BannerCarousel() {
  const [active, setActive] = useState(0);
  const next = useCallback(() => setActive((a) => (a + 1) % BANNERS_GUEST.length), []);

  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next]);

  const b = BANNERS_GUEST[active];
  return (
    <div style={{ background: '#111111' }}>
      <div className="relative overflow-hidden" style={{ height: 160 }}>
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
          <div className="mb-2.5 text-[10.5px] leading-relaxed" style={{ color: '#888888', maxWidth: 188 }}>{b.sub}</div>
          <Link href={b.cta.href} className="inline-flex w-fit items-center rounded-full px-4 py-1.5 text-xs font-black" style={b.cta.style as React.CSSProperties}>
            {b.cta.label}
          </Link>
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 py-2" style={{ background: '#111111' }}>
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
  top:    { label: 'TOP',     bg: '#0778BD', color: 'white' },
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
        <p className="text-[9px]" style={{ color: '#888888' }}>{game.provider}</p>
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

const Separator = () => <div className="h-[5px] border-t border-b border-white/[0.04]" style={{ background: '#111111' }} />;

// ── Welcome back bar ──────────────────────────────────────────────────────────
function WelcomeBar({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[rgba(7,120,189,0.3)] px-3 py-2" style={{ background: 'linear-gradient(90deg, rgba(7,120,189,0.3), rgba(7,120,189,0.1))' }}>
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

  const filteredGames = GAMES.filter((g) => {
    if (activeCat === 'all') return true;
    if (activeCat === 'crash') return g.id.includes('aviator') || g.category === 'slots'; // crash games mapped to slots
    return g.category === activeCat;
  }).slice(0, 9);

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0A0A0A' }}>

      {/* Ticker */}
      <Ticker loggedIn={isLoggedIn} firstName={user?.firstName} />

      {/* Welcome bar (logged in) */}
      {isLoggedIn && user && <WelcomeBar name={user.firstName} />}

      {/* Banner carousel */}
      <BannerCarousel />

      {/* Jackpot bar */}
      <JackpotBar />

      {/* Category pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2" style={{ background: '#111111' }}>
        {CATS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCat(cat.value)}
            className="flex shrink-0 flex-col items-center gap-1 rounded-lg border px-4 py-2 transition-colors min-w-[60px]"
            style={{
              background: activeCat === cat.value ? '#0778BD' : '#161616',
              borderColor: activeCat === cat.value ? '#0560A0' : 'rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-lg leading-none">{cat.icon}</span>
            <span className="text-[8.5px] font-bold uppercase tracking-wide" style={{ color: activeCat === cat.value ? 'white' : '#666666' }}>{cat.label}</span>
          </button>
        ))}
      </div>

      <Separator />

      {/* Live Casino */}
      <SectionHeader icon="🔴" title="Live Casino" href="/?cat=live" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-3">
        {LIVE_GAMES.map((g) => (
          <div key={g.id} className="shrink-0 w-36 cursor-pointer overflow-hidden rounded-lg border border-white/[0.07]" style={{ background: '#161616' }}>
            <div className="relative flex h-20 items-center justify-center overflow-hidden" style={{ background: g.bg }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%,rgba(245,166,35,0.1) 0%,transparent 65%)' }} />
              <span className="text-[40px]" style={{ filter: 'drop-shadow(0 0 14px rgba(245,166,35,0.3))', zIndex: 1 }}>{g.icon}</span>
              <span className="absolute left-1.5 top-1.5 rounded px-1.5 py-px text-[7px] font-black text-white blink" style={{ background: '#E84D1C' }}>LIVE</span>
              <span className="absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-px text-[8px]" style={{ background: 'rgba(0,0,0,0.6)', color: '#888888' }}>👤 {g.players}</span>
            </div>
            <div className="px-2 py-1.5">
              <p className="text-[10.5px] font-black text-white truncate">{g.name}</p>
              <p className="text-[8.5px]" style={{ color: '#666666' }}>{g.provider}</p>
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
              background: gameTab === t ? '#F5A623' : '#161616',
              borderColor: gameTab === t ? '#F5A623' : 'rgba(255,255,255,0.1)',
              color: gameTab === t ? '#0A0E14' : '#666666',
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
