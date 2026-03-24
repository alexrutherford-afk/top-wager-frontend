'use client';

import { useGeo } from '@/context/GeoContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Pages exempt from geo-blocking (blocked users can still see these)
const EXEMPT = ['/blocked'];

export function GeoGate({ children }: { children: React.ReactNode }) {
  const { blocked, detected } = useGeo();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!detected) return;
    if (blocked && !EXEMPT.includes(pathname)) {
      router.replace('/blocked');
    }
  }, [blocked, detected, pathname]);

  // Show nothing until geo is detected (prevents flash of content for blocked users)
  if (!detected) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0B0E14' }}>
        <div className="text-xs" style={{ color: '#3A4A5A' }}>Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}
