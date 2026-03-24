'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/data/games';
import { GameCard } from '@/components/GameCard';

function LiveJackpotTicker({ name, amount, color }: { name: string; amount: number; color: string }) {
  const [val, setVal] = useState(amount);
  useEffect(() => {
    const t = setInterval(() => setVal((v) => v + Math.floor(Math.random() * 4 + 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] px-4 py-3" style={{ background: '#1A2332' }}>
      <span className="text-sm font-black text-white">{name}</span>
      <span className="text-base font-black tabular-nums" style={{ color, textShadow: `0 0 12px ${color}80` }}>
        €{val.toLocaleString()}
      </span>
    </div>
  );
}

const TICKER_DATA = [
  { name: 'Mega Jackpot',   amount: 4827650, color: '#F5A623' },
  { name: 'Mega Moolah',    amount: 4231882, color: '#F5A623' },
  { name: 'Hall of Gods',   amount: 2874503, color: '#A78BFA' },
  { name: 'Jackpot Giant',  amount: 1102337, color: '#60A5FA' },
  { name: 'Divine Fortune', amount: 87441,   color: '#5DE898' },
  { name: 'Major Millions', amount: 362114,  color: '#FF7A55' },
];

export default function JackpotsPage() {
  const jackpotGames = GAMES.filter((g) => g.category === 'jackpot');

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 py-6"
        style={{ background: 'linear-gradient(125deg,#0E0A00 0%,#1E1400 50%,#2A1C00 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(245,166,35,0.22) 0%,transparent 55%)' }} />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl" style={{ filter: 'drop-shadow(0 0 28px rgba(245,166,35,0.55))', opacity: 0.9 }}>🏆</div>
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#F5A623' }}>💰 Jackpot Games</p>
          <h1 className="text-2xl font-black text-white leading-tight">Life-Changing<br /><span style={{ color: '#F5A623' }}>Jackpots</span></h1>
          <p className="mt-1 text-xs" style={{ color: '#5A7090' }}>Pooled jackpots growing every second</p>
        </div>
      </div>

      {/* Live jackpot counters */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs font-black text-white mb-3">🔴 Live Jackpot Counters</p>
        <div className="space-y-2">
          {TICKER_DATA.map((d) => (
            <LiveJackpotTicker key={d.name} {...d} />
          ))}
        </div>
      </div>

      {/* Games grid */}
      <div className="px-3 pt-4">
        <p className="text-xs font-black text-white mb-3">All Jackpot Games</p>
        <div className="grid grid-cols-3 gap-2 pb-4 sm:grid-cols-4 md:grid-cols-6">
          {jackpotGames.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </div>
    </div>
  );
}
