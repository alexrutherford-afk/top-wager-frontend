'use client';

import Link from 'next/link';

const CRASH_GAMES = [
  { id: 'aviator',     icon: '✈️', name: 'Aviator',         provider: 'Spribe',        description: 'Cash out before it flies away',  bg: 'linear-gradient(135deg,#1A0000,#3A0808)', color: '#FF7A55' },
  { id: 'spaceman',    icon: '🚀', name: 'Spaceman',         provider: 'Pragmatic Play',description: 'Ride the rocket, multiply your bet',bg: 'linear-gradient(135deg,#00041A,#001040)', color: '#60A5FA' },
  { id: 'jetx',        icon: '🛸', name: 'JetX',             provider: 'SmartSoft',     description: 'Fly higher, win bigger',           bg: 'linear-gradient(135deg,#0A001A,#1A003A)', color: '#A78BFA' },
  { id: 'mines',       icon: '💣', name: 'Mines',            provider: 'Spribe',        description: 'Reveal tiles, avoid the mines',    bg: 'linear-gradient(135deg,#001A08,#003015)', color: '#5DE898' },
  { id: 'plinko',      icon: '🎯', name: 'Plinko',           provider: 'Spribe',        description: 'Drop the ball, hit the multiplier', bg: 'linear-gradient(135deg,#100A00,#201500)', color: '#F5A623' },
  { id: 'dice',        icon: '🎲', name: 'Dice',             provider: 'Spribe',        description: 'Roll to win, set your own odds',   bg: 'linear-gradient(135deg,#001018,#002030)', color: '#60A5FA' },
];

export default function CrashPage() {
  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 py-8"
        style={{ background: 'linear-gradient(135deg,#080C12 0%,#16082A 55%,#200A36 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 82% 50%,rgba(232,77,28,0.28) 0%,transparent 55%)' }} />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl" style={{ filter: 'drop-shadow(0 0 24px rgba(232,77,28,0.6))', opacity: 0.9 }}>✈️</div>
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(232,77,28,0.2)', border: '1px solid rgba(232,77,28,0.45)', color: '#FF7A55' }}>
            ● Live Now
          </span>
          <h1 className="text-2xl font-black text-white leading-tight"><span style={{ color: '#FF7A55' }}>Crash</span> Games</h1>
          <p className="mt-1 text-xs mb-4" style={{ color: '#5A7090' }}>Cash out before the crash. Pure skill, pure adrenaline.</p>
          {/* Prize banner */}
          <div className="inline-flex items-center gap-2 rounded-xl border px-4 py-2"
            style={{ background: 'rgba(232,77,28,0.1)', borderColor: 'rgba(232,77,28,0.3)' }}>
            <span className="text-sm">🏆</span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#FF7A55' }}>Aviator Weekly Prize</p>
              <p className="text-base font-black" style={{ color: '#F5A623' }}>KES 25,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aviator featured */}
      <div className="px-3 pt-5">
        <p className="text-xs font-black text-white mb-3">⭐ Featured</p>
        <Link href="/" className="block relative overflow-hidden rounded-2xl border cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#1A0000,#3A0808,#1A0404)', borderColor: 'rgba(232,77,28,0.3)', minHeight: 120 }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(232,77,28,0.2) 0%,transparent 60%)' }} />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[72px]" style={{ filter: 'drop-shadow(0 0 20px rgba(232,77,28,0.5))', opacity: 0.85 }}>✈️</div>
          <div className="relative px-5 py-5">
            <span className="inline-block rounded px-2 py-px text-[8px] font-black text-white mb-2 blink" style={{ background: '#E84D1C' }}>LIVE</span>
            <p className="text-xl font-black text-white">Aviator</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: '#7A95B0' }}>by Spribe · Multiplayer</p>
            <button className="rounded-full px-5 py-1.5 text-xs font-black text-white"
              style={{ background: '#E84D1C', boxShadow: '0 4px 12px rgba(232,77,28,0.4)' }}>
              Fly Now →
            </button>
          </div>
        </Link>
      </div>

      {/* All crash games */}
      <div className="px-3 pt-5">
        <p className="text-xs font-black text-white mb-3">All Crash &amp; Instant Games</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CRASH_GAMES.map((g) => (
            <div key={g.id} className="relative overflow-hidden rounded-xl border cursor-pointer hover:opacity-95 transition-opacity"
              style={{ background: g.bg, borderColor: 'rgba(255,255,255,0.07)', minHeight: 110 }}>
              <div className="absolute right-3 top-3 text-4xl opacity-70">{g.icon}</div>
              <div className="p-4">
                <p className="text-sm font-black text-white">{g.name}</p>
                <p className="text-[8.5px] mt-px mb-2" style={{ color: g.color }}>{g.provider}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: '#5A7090' }}>{g.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
