'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import { getRefCodeCookie, setRefCodeCookie } from '@/lib/referral';

type Step = 1 | 2 | 3;

// Bonus cap display per currency
const BONUS_CAP_DISPLAY: Record<string, string> = {
  UGX: 'USh 2,000,000',
  KES: 'KSh 50,000',
  MWK: 'MK 1,000,000',
  TZS: 'TSh 1,000,000',
  ZMW: 'K 5,000',
  USD: '$15',
  EUR: '€500',
};

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: '', color: '#1A2332', width: '0%' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: '#E84D1C', width: '33%' };
  if (score <= 3) return { label: 'OK', color: '#F5A623', width: '66%' };
  return { label: 'Strong', color: '#5DE898', width: '100%' };
}

export default function RegisterPage() {
  const { register }         = useAuth();
  const { countryConfig }    = useGeo();
  const router               = useRouter();

  const [step, setStep]               = useState<Step>(1);
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [refCode, setRefCode]         = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendActive, setResendActive]       = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Capture affiliate ref code: check cookie first, then URL param (first-touch, no-overwrite)
  useEffect(() => {
    const existing = getRefCodeCookie();
    if (existing) { setRefCode(existing); return; }
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) { setRefCodeCookie(ref); setRefCode(ref); }
  }, []);

  // Resend countdown — resets each time step 2 is entered
  useEffect(() => {
    if (step !== 2) return;
    setResendCountdown(30);
    setResendActive(false);
    const interval = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) { setResendActive(true); clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Auto-focus first OTP box on step 2
  useEffect(() => {
    if (step === 2) setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }, [step]);

  const bonusCap = BONUS_CAP_DISPLAY[countryConfig.currency] ?? BONUS_CAP_DISPLAY.USD;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    // Auto-advance to step 3 when all 6 digits filled
    if (newOtp.every((d) => d !== '')) setTimeout(() => setStep(3), 150);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    // Reset countdown by toggling step (triggers useEffect)
    setStep(1);
    setTimeout(() => setStep(2), 0);
  };

  const handleRegister = async () => {
    if (password.length < 6) { setSubmitError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setSubmitError('');

    // Email is derived from phone — not shown to the user
    const cleanPhone = phone.replace(/\D/g, '');
    const derivedEmail = `${countryConfig.callingCode.replace('+', '')}${cleanPhone}@topwager.app`;
    const fullPhone = `${countryConfig.callingCode}${cleanPhone}`;

    const { error, userId } = await register(derivedEmail, password, cleanPhone, countryConfig.currency);
    if (error) {
      setLoading(false);
      setSubmitError(error);
      return;
    }

    if (userId) {
      await fetch('/api/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          phone:    fullPhone,
          currency: countryConfig.currency,
          country:  countryConfig.code,
          refCode:  refCode || undefined,
        }),
      });
    }

    setLoading(false);
    router.push('/deposit?welcome=1');
  };

  const INPUT = 'w-full rounded-xl border border-white/[0.08] bg-[#1A2332] px-4 py-3.5 text-base text-white placeholder-white/30 outline-none focus:border-[#F5A623]/50 transition-colors';
  const strength = getPasswordStrength(password);

  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8"
      style={{ background: '#0D1117' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-5 flex justify-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black border"
            style={{ background: 'linear-gradient(135deg,#1A5C38,#2D7A50)', color: '#F5A623', borderColor: 'rgba(245,166,35,0.2)' }}
          >
            TW
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-colors"
                style={{
                  background: step >= s ? '#F5A623' : '#1A2332',
                  color:      step >= s ? '#0A0E14' : '#3A4A5A',
                  border:     step === s ? '2px solid #F5A623' : '2px solid transparent',
                }}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className="h-px w-6 transition-colors" style={{ background: step > s ? '#F5A623' : '#1A2332' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Bonus offer + phone ─────────────────── */}
        {step === 1 && (
          <div className="space-y-4">

            {/* Bonus offer — upgraded framing if referred */}
            {refCode ? (
              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: 'rgba(58,158,103,0.4)', background: 'rgba(26,92,56,0.12)' }}
              >
                <div
                  className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                  style={{ background: 'rgba(58,158,103,0.2)', color: '#5DE898', border: '1px solid rgba(58,158,103,0.4)' }}
                >
                  You've been invited
                </div>
                <p className="text-xl font-black text-white leading-tight">
                  You're getting <span style={{ color: '#F5A623' }}>500%</span>
                </p>
                <p className="mt-0.5 text-xs" style={{ color: '#7A95B0' }}>
                  Instead of the standard 100% — your friend unlocked a better offer for you.
                </p>
                <p className="mt-1 text-[10px]" style={{ color: '#5A7090' }}>
                  Up to {bonusCap} · First deposit only
                </p>
              </div>
            ) : (
              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: 'rgba(245,166,35,0.2)', background: 'rgba(245,166,35,0.04)' }}
              >
                <p className="text-2xl font-black text-white leading-tight">
                  500% <span style={{ color: '#F5A623' }}>Welcome Bonus</span>
                </p>
                <p className="mt-0.5 text-sm font-semibold" style={{ color: '#F5A623' }}>
                  Up to {bonusCap}
                </p>
                <p className="mt-1 text-[10.5px]" style={{ color: '#5A7090' }}>
                  Only available on your first deposit
                </p>
              </div>
            )}

            {/* Phone input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: '#5A7090' }}>
                Your mobile number
              </label>
              <div className="flex gap-2">
                <div
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#1A2332] px-3 shrink-0"
                  style={{ minWidth: '80px' }}
                >
                  <span className="text-base">{countryConfig.flag}</span>
                  <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{countryConfig.callingCode}</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  autoComplete="tel"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className={INPUT}
                />
              </div>
            </div>

            <button
              onClick={() => phone.trim().replace(/\D/g, '').length >= 7 && setStep(2)}
              disabled={phone.trim().replace(/\D/g, '').length < 7}
              className="w-full rounded-xl py-4 text-base font-black text-[#0A0E14] disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: '#F5A623' }}
            >
              Send code →
            </button>

            <p className="text-center text-sm" style={{ color: '#5A7090' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-black" style={{ color: '#F5A623' }}>Sign in</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: OTP entry ───────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-black text-white">Enter your code</h2>
              <p className="mt-1 text-sm" style={{ color: '#7A95B0' }}>
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-white">{countryConfig.callingCode} {phone}</span>
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="h-12 w-10 rounded-xl border text-center text-lg font-black text-white outline-none transition-colors"
                  style={{
                    background:   '#1A2332',
                    borderColor:  digit ? '#F5A623' : 'rgba(255,255,255,0.1)',
                    boxShadow:    digit ? '0 0 6px rgba(245,166,35,0.2)' : 'none',
                  }}
                />
              ))}
            </div>

            <div className="text-center">
              {resendActive ? (
                <button
                  onClick={handleResend}
                  className="text-sm font-semibold"
                  style={{ color: '#F5A623' }}
                >
                  Resend code
                </button>
              ) : (
                <p className="text-sm" style={{ color: '#5A7090' }}>
                  Resend code in {resendCountdown}s
                </p>
              )}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-sm"
              style={{ color: '#5A7090' }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 3: Set password ────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-black text-white">Choose a password</h2>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className={INPUT + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: '#5A7090' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div>
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: '#1A2332' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, background: strength.color }}
                  />
                </div>
                <p className="mt-1 text-[10px] font-semibold" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}

            {submitError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {submitError}
              </p>
            )}

            <button
              onClick={handleRegister}
              disabled={loading || password.length < 6}
              className="w-full rounded-xl py-4 text-base font-black text-[#0A0E14] disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: '#F5A623' }}
            >
              {loading ? 'Creating account…' : 'Create my account →'}
            </button>

            <p className="text-center text-[10.5px]" style={{ color: '#5A7090' }}>
              By continuing you accept our{' '}
              <Link href="/terms" target="_blank" className="underline" style={{ color: '#7A95B0' }}>Terms</Link>
              {' '}and{' '}
              <Link href="/terms#privacy" target="_blank" className="underline" style={{ color: '#7A95B0' }}>Privacy Policy</Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
