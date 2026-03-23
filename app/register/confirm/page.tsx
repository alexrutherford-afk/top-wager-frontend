'use client';
import Link from 'next/link';

export default function ConfirmPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4" style={{ background: '#0D1117' }}>
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          ✉️
        </div>
        <h1 className="mb-2 text-2xl font-black text-white">Check your email</h1>
        <p className="mb-6 text-sm" style={{ color: '#5A7090' }}>
          We&rsquo;ve sent a confirmation link to your email address. Click it to activate your account, then come back to sign in.
        </p>
        <Link href="/login"
          className="inline-block rounded-xl px-8 py-3 text-sm font-black text-[#0A0E14]"
          style={{ background: '#F5A623' }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
