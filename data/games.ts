export type GameCategory = 'all' | 'slots' | 'live' | 'table' | 'jackpot' | 'new';

export type Game = {
  id: string;
  name: string;
  provider: string;
  category: Exclude<GameCategory, 'all' | 'new'>;
  isNew?: boolean;
  isHot?: boolean;
  rtp?: number;
  jackpotAmount?: string;
  gradientFrom: string;
  gradientTo: string;
  // Placeholder thumbnail — replace with real CDN URLs when backend is connected
  thumb: string;
};

// Generates a placehold.co image URL for a game tile
const tile = (bg: string, fg: string, label: string) =>
  `https://placehold.co/120x160/${bg.replace('#', '')}/${fg.replace('#', '')}?text=${encodeURIComponent(label)}&font=oswald`;

export const GAMES: Game[] = [
  // ── Slots ─────────────────────────────────────────────────
  { id: 'book-of-dead',      name: 'Book of Dead',        provider: "Play'n GO",      category: 'slots',   isHot: true,  rtp: 96.21, gradientFrom: '#78350f', gradientTo: '#1c0a00', thumb: tile('#78350f','F5A623','Book of Dead') },
  { id: 'gates-of-olympus',  name: 'Gates of Olympus',    provider: 'Pragmatic Play', category: 'slots',   isHot: true,  rtp: 96.5,  gradientFrom: '#1e3a8a', gradientTo: '#0a0030', thumb: tile('#1e3a8a','F5A623','Gates of Olympus') },
  { id: 'sweet-bonanza',     name: 'Sweet Bonanza',       provider: 'Pragmatic Play', category: 'slots',   isNew: true,  rtp: 96.48, gradientFrom: '#be185d', gradientTo: '#4a0020', thumb: tile('#be185d','ffffff','Sweet Bonanza') },
  { id: 'starburst',         name: 'Starburst',           provider: 'NetEnt',         category: 'slots',               rtp: 96.09, gradientFrom: '#5b21b6', gradientTo: '#1e0050', thumb: tile('#5b21b6','F5A623','Starburst') },
  { id: 'fire-in-hole',      name: 'Fire in the Hole',    provider: 'Nolimit City',   category: 'slots',   isHot: true,  rtp: 96.32, gradientFrom: '#991b1b', gradientTo: '#1c0000', thumb: tile('#991b1b','F5A623','Fire in the Hole') },
  { id: 'dead-or-alive-2',   name: 'Dead or Alive 2',     provider: 'NetEnt',         category: 'slots',               rtp: 96.8,  gradientFrom: '#4d7c0f', gradientTo: '#0a1500', thumb: tile('#4d7c0f','ffffff','Dead or Alive 2') },
  { id: 'reactoonz',         name: 'Reactoonz 2',         provider: "Play'n GO",      category: 'slots',   isNew: true,  rtp: 96.51, gradientFrom: '#065f46', gradientTo: '#001a10', thumb: tile('#065f46','F5A623','Reactoonz 2') },
  { id: 'gonzo',             name: "Gonzo's Quest",       provider: 'NetEnt',         category: 'slots',               rtp: 95.97, gradientFrom: '#92400e', gradientTo: '#1a0a00', thumb: tile('#92400e','ffffff',"Gonzo's Quest") },
  { id: 'jammin-jars',       name: "Jammin' Jars 2",      provider: 'Push Gaming',    category: 'slots',   isHot: true,  rtp: 96.45, gradientFrom: '#1d4ed8', gradientTo: '#00093a', thumb: tile('#1d4ed8','F5A623',"Jammin Jars 2") },
  { id: 'san-quentin',       name: 'San Quentin xWays',   provider: 'Nolimit City',   category: 'slots',               rtp: 96.43, gradientFrom: '#374151', gradientTo: '#0d1117', thumb: tile('#374151','ffffff','San Quentin') },
  { id: 'mental',            name: 'Mental',              provider: 'Nolimit City',   category: 'slots',   isNew: true,  rtp: 96.11, gradientFrom: '#6d28d9', gradientTo: '#200045', thumb: tile('#6d28d9','F5A623','Mental') },
  { id: 'joker-bomb',        name: 'Joker Bomb',          provider: 'Hacksaw Gaming', category: 'slots',               rtp: 96.28, gradientFrom: '#b45309', gradientTo: '#2a0e00', thumb: tile('#b45309','ffffff','Joker Bomb') },

  // ── Live Casino ───────────────────────────────────────────
  { id: 'lightning-roulette',name: 'Lightning Roulette',  provider: 'Evolution',      category: 'live',    isHot: true,  gradientFrom: '#b45309', gradientTo: '#1a0800', thumb: tile('#b45309','F5A623','Lightning Roulette') },
  { id: 'crazy-time',        name: 'Crazy Time',          provider: 'Evolution',      category: 'live',    isHot: true,  gradientFrom: '#0e7490', gradientTo: '#001820', thumb: tile('#0e7490','ffffff','Crazy Time') },
  { id: 'blackjack-vip',     name: 'Blackjack VIP',       provider: 'Evolution',      category: 'live',                 gradientFrom: '#14532d', gradientTo: '#001a0a', thumb: tile('#14532d','F5A623','Blackjack VIP') },
  { id: 'mega-ball',         name: 'Mega Ball',           provider: 'Evolution',      category: 'live',    isNew: true,  gradientFrom: '#1e40af', gradientTo: '#00052a', thumb: tile('#1e40af','ffffff','Mega Ball') },
  { id: 'dream-catcher',     name: 'Dream Catcher',       provider: 'Evolution',      category: 'live',                 gradientFrom: '#7c3aed', gradientTo: '#180040', thumb: tile('#7c3aed','F5A623','Dream Catcher') },
  { id: 'speed-baccarat',    name: 'Speed Baccarat',      provider: 'Evolution',      category: 'live',                 gradientFrom: '#991b1b', gradientTo: '#1c0000', thumb: tile('#991b1b','ffffff','Speed Baccarat') },
  { id: 'monopoly-live',     name: 'Monopoly Live',       provider: 'Evolution',      category: 'live',    isHot: true,  gradientFrom: '#065f46', gradientTo: '#001a10', thumb: tile('#065f46','F5A623','Monopoly Live') },
  { id: 'xxxtreme',          name: 'XXXtreme Lightning',  provider: 'Evolution',      category: 'live',    isNew: true,  gradientFrom: '#92400e', gradientTo: '#1a0500', thumb: tile('#92400e','ffffff','XXXtreme') },

  // ── Table Games ──────────────────────────────────────────
  { id: 'european-roulette', name: 'European Roulette',   provider: 'NetEnt',         category: 'table',               rtp: 97.3,  gradientFrom: '#14532d', gradientTo: '#001a0a', thumb: tile('#14532d','F5A623','Euro Roulette') },
  { id: 'blackjack-classic', name: 'Blackjack Classic',   provider: 'NetEnt',         category: 'table',               rtp: 99.28, gradientFrom: '#1e3a8a', gradientTo: '#000530', thumb: tile('#1e3a8a','ffffff','Blackjack') },
  { id: 'baccarat',          name: 'Baccarat Pro',        provider: 'Playtech',       category: 'table',               rtp: 98.76, gradientFrom: '#7f1d1d', gradientTo: '#1c0000', thumb: tile('#7f1d1d','F5A623','Baccarat Pro') },
  { id: 'texas-holdem',      name: "Texas Hold'em",       provider: 'Microgaming',    category: 'table',               rtp: 97.84, gradientFrom: '#312e81', gradientTo: '#0a0030', thumb: tile('#312e81','ffffff',"Texas Holdem") },
  { id: 'three-card-poker',  name: 'Three Card Poker',    provider: 'Playtech',       category: 'table',               rtp: 96.63, gradientFrom: '#134e4a', gradientTo: '#001410', thumb: tile('#134e4a','F5A623','3 Card Poker') },

  // ── Jackpots ─────────────────────────────────────────────
  { id: 'mega-moolah',       name: 'Mega Moolah',         provider: 'Microgaming',    category: 'jackpot', isHot: true,  jackpotAmount: '€4,231,882', gradientFrom: '#78350f', gradientTo: '#1a0800', thumb: tile('#78350f','F5A623','Mega Moolah') },
  { id: 'divine-fortune',    name: 'Divine Fortune',      provider: 'NetEnt',         category: 'jackpot',              jackpotAmount: '€87,441',    gradientFrom: '#5b21b6', gradientTo: '#1a0050', thumb: tile('#5b21b6','F5A623','Divine Fortune') },
  { id: 'jackpot-giant',     name: 'Jackpot Giant',       provider: 'Playtech',       category: 'jackpot',              jackpotAmount: '€1,102,337', gradientFrom: '#1d4ed8', gradientTo: '#000a2a', thumb: tile('#1d4ed8','F5A623','Jackpot Giant') },
  { id: 'major-millions',    name: 'Major Millions',      provider: 'Microgaming',    category: 'jackpot', isNew: true,  jackpotAmount: '€362,114',   gradientFrom: '#065f46', gradientTo: '#001a0a', thumb: tile('#065f46','F5A623','Major Millions') },
  { id: 'hall-of-gods',      name: 'Hall of Gods',        provider: 'NetEnt',         category: 'jackpot',              jackpotAmount: '€2,874,503', gradientFrom: '#1e3a8a', gradientTo: '#00052a', thumb: tile('#1e3a8a','F5A623','Hall of Gods') },
];

export const CATEGORIES: { value: GameCategory; label: string }[] = [
  { value: 'all',     label: 'All Games' },
  { value: 'slots',   label: 'Slots' },
  { value: 'live',    label: 'Live Casino' },
  { value: 'table',   label: 'Table Games' },
  { value: 'jackpot', label: 'Jackpots' },
  { value: 'new',     label: 'New & Hot' },
];
