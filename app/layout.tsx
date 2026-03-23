import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Nav } from '@/components/Nav';
import { DemoBanner } from '@/components/DemoBanner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Castle Bet Casino',
  description: 'Castle Bet — slots, live casino, crash games, jackpots',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col text-white antialiased" style={{ background: '#000000' }}>
        <Providers>
          <Nav />
          <DemoBanner />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 py-6 text-center text-xs pb-20 md:pb-6" style={{ color: '#666666', background: '#0A0A0A' }}>
            <p className="mb-1">Castle Bet Casino · Prototype shell · All data is mocked</p>
            <p>18+ · Please gamble responsibly · BeGambleAware.org</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
