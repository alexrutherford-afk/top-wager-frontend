'use client';
import type { Game } from '@/data/games';

const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  hot:    { label: 'HOT',     bg: '#E84D1C', color: 'white' },
  new:    { label: 'NEW',     bg: '#F5A623', color: '#0A0E14' },
  live:   { label: 'LIVE',    bg: '#E84D1C', color: 'white' },
  top:    { label: 'TOP',     bg: '#1A5C38', color: 'white' },
  jackpot:{ label: 'JACKPOT', bg: 'linear-gradient(90deg,#F5A623,#E8950F)', color: '#0A0E14' },
};

export function GameCard({ game }: { game: Game }) {
  const badge = game.isHot ? BADGE.hot : game.isNew ? BADGE.new : game.category === 'live' ? BADGE.live : game.category === 'jackpot' ? BADGE.jackpot : BADGE.top;
  return (
    <div className="game-card relative cursor-pointer overflow-hidden rounded-lg border border-white/[0.04]" style={{ aspectRatio: '3/4' }}>
      <img src={game.thumb} alt={game.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 px-1 pb-1.5 pt-5 text-center text-[8.5px] font-black uppercase tracking-wide text-white"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)' }}>
        {game.name}
      </div>
      <div className="absolute left-1 top-1 rounded px-1 py-px text-[7px] font-black" style={{ background: badge.bg, color: badge.color }}>
        {badge.label}
      </div>
      {game.jackpotAmount && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center">
          <span className="rounded-full px-2 py-0.5 text-[8px] font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>{game.jackpotAmount}</span>
        </div>
      )}
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
