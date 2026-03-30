'use client';

/**
 * /join/[code] — clean tracking link for the Bring a Mate programme.
 *
 * Sets the ref_code cookie (30-day, first-touch — never overwrites an
 * existing value) then redirects silently to /register.
 * The referral code does NOT appear in the final URL.
 */

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { setRefCodeCookie } from '@/lib/referral';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code   = typeof params.code === 'string' ? params.code : '';

  useEffect(() => {
    if (code) setRefCodeCookie(code);
    router.replace('/register');
  }, [code, router]);

  // Minimal loading state — visible only for the split-second before redirect
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: '#0D1117' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black border"
          style={{
            background: 'linear-gradient(135deg, #1A5C38, #2D7A50)',
            color: '#F5A623',
            borderColor: 'rgba(245,166,35,0.2)',
          }}
        >
          TW
        </div>
        <p className="text-sm font-semibold" style={{ color: '#5A7090' }}>
          Loading your bonus...
        </p>
      </div>
    </div>
  );
}
