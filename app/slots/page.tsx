'use client';

import { useState } from 'react';
import { GAMES } from '@/data/games';
import { GameCard } from '@/components/GameCard';

const FILTERS = ['All', 'HOT', 'New', 'Pragmatic', 'NetEnt', "Play'n GO", 'Nolimit City'];

export default function SlotsPage() {
  const [filter, setFilter] = useState('All');

  const slots = GAMES.filter((g) => g.category === 'slots').filter((g) => {
    if (filter === 'All') return true;
    if (filter === 'HOT') return g.isHot;
    if (filter === 'New') return g.isNew;
    return g.provider === filter;
  });

  return (
    <div className="pb-20 md:pb-6" style={{ background: '#0D1117', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 py-6"
        style={{ background: 'linear-gradient(135deg,#060C14 0%,#0F1E0A 50%,#1A2F10 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%,rgba(245,166,35,0.15) 0%,transparent 60%)' }} />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#F5A623' }}>🎰 Slot Games</p>
          <h1 className="text-2xl font-black text-white leading-tight">Spin & Win</h1>
          <p className="mt-1 text-xs" style={{ color: '#5A7090' }}>{GAMES.filter(g => g.category === 'slots').length} games available · Up to 96.8% RTP</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-3" style={{ background: '#131B24' }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="shrink-0 rounded-full border px-3 py-1 text-[10.5px] font-bold transition-colors"
            style={{
              background: filter === f ? '#F5A623' : '#1A2332',
              borderColor: filter === f ? '#F5A623' : 'rgba(255,255,255,0.1)',
              color: filter === f ? '#0A0E14' : '#5A7090',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 px-3 pt-2 pb-4 sm:grid-cols-4 md:grid-cols-6">
        {slots.map((g) => <GameCard key={g.id} game={g} />)}
      </div>

      {slots.length === 0 && (
        <p className="py-12 text-center text-sm" style={{ color: '#5A7090' }}>No games found</p>
      )}
    </div>
  );
}
