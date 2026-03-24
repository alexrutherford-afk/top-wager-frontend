'use client';

import { GAMES } from '@/data/games';
import { GameCard } from '@/components/GameCard';

const LIVE_FEATURED = [
  { id: 'lr', icon: '🎡', name: 'Live Roulette',  provider: 'Evolution',      players: 342, min: '€1',  bg: 'linear-gradient(135deg,#1A0000,#3A0808,#1A0404)' },
  { id: 'bj', icon: '🃏', name: 'Blackjack VIP',  provider: 'Pragmatic Live', players: 189, min: '€10', bg: 'linear-gradient(135deg,#001A10,#003A20,#001A10)' },
  { id: 'bc', icon: '💎', name: 'Baccarat',        provider: 'Evolution',      players: 97,  min: '€5',  bg: 'linear-gradient(135deg,#10001A,#20003A,#10001A)' },
  { id: 'dc', icon: '🎲', name: 'Dream Catcher',   provider: 'Evolution',      players: 214, min: '€1',  bg: 'linear-gradient(135deg,#001018,#002030,#001018)' },
  { id: 'ct', icon: '🎪', name: 'Crazy Time',      provider: 'Evolution',      players: 521, min: '€1',  bg: 'linear-gradient(135deg,#180A00,#301500,#180A00)' },
  { id: 'mb', icon: '⚽', name: 'Mega Ball',       provider: 'Evolution',      players: 144, min: '€1',  bg: 'linear-gradient(135deg,#001A30,#003060,#001A30)' },
];

export default function LivePage() {
  const liveGames = GAMES.filter((g) => g.category === 'live');

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 py-6"
        style={{ background: 'linear-gradient(135deg,#07050E 0%,#15082A 50%,#200A36 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(124,58,237,0.2) 0%,transparent 60%)' }} />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#A78BFA' }}>🔴 Live Casino</p>
          <h1 className="text-2xl font-black text-white leading-tight">Real Dealers.<br /><span style={{ color: '#A78BFA' }}>Real Stakes.</span></h1>
          <p className="mt-1 text-xs" style={{ color: '#5A7090' }}>Live 24/7 · Blackjack, Roulette, Baccarat &amp; more</p>
        </div>
      </div>

      {/* Live now row */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs font-black text-white mb-3">🔴 Live Now</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {LIVE_FEATURED.map((g) => (
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
      </div>

      {/* All live games grid */}
      <div className="px-3 pt-3">
        <p className="text-xs font-black text-white mb-3">All Live Games</p>
        <div className="grid grid-cols-3 gap-2 pb-4 sm:grid-cols-4 md:grid-cols-6">
          {liveGames.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      </div>
    </div>
  );
}
