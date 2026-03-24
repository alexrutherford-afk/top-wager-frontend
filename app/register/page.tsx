'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGeo } from '@/context/GeoContext';
import { useI18n } from '@/context/I18nContext';
import { ALL_SELECTABLE } from '@/data/geoConfig';

export default function RegisterPage() {
  const { register }                    = useAuth();
  const { countryConfig, setCountry }   = useGeo();
  const { t }                           = useI18n();
  const router                          = useRouter();

  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [promoCode,    setPromoCode]    = useState('');
  const [showPromo,    setShowPromo]    = useState(false);
  const [agreedTerms,  setAgreedTerms]  = useState(true);
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState<Record<string,string>>({});
  const [submitError,  setSubmitError]  = useState('');

  const INPUT = 'w-full rounded-xl border border-white/[0.08] bg-[#1A2332] px-4 py-3.5 text-base text-white placeholder-white/30 outline-none focus:border-[#F5A623]/50 transition-colors';

  const validate = () => {
    const e: Record<string,string> = {};
    if (!email)              e.email    = 'Required';
    if (password.length < 6) e.password = 'Minimum 6 characters';
    if (!agreedTerms)        e.terms    = 'You must accept the terms to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    // Full name defaults to email prefix — player can update in account settings
    const { error } = await register(email, password, email.split('@')[0], countryConfig.currency);
    setLoading(false);
    if (error) { setSubmitError(error); return; }
    // TODO: Backend — save phone, promoCode, currency to profiles table
    router.push('/register/confirm');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8"
      style={{ background: '#0D1117' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black border"
            style={{ background: 'linear-gradient(135deg,#1A5C38,#2D7A50)', color: '#F5A623', borderColor: 'rgba(245,166,35,0.2)' }}>
            TW
          </div>
          <h1 className="text-xl font-black text-white">{t('register_title')}</h1>
          <p className="mt-1 text-sm" style={{ color: '#5A7090' }}>{t('register_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Currency / Country row */}
          <div className="flex gap-2">
            <select
              value={countryConfig.code}
              onChange={e => setCountry(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.08] bg-[#1A2332] px-3 py-3.5 text-base text-white outline-none focus:border-[#F5A623]/50">
              {ALL_SELECTABLE.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.currency} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className={INPUT}
              style={errors.email ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#1A2332] px-3 shrink-0"
              style={{ minWidth: '90px' }}>
              <span className="text-base">{countryConfig.flag}</span>
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>{countryConfig.callingCode}</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number"
              autoComplete="tel"
              className={INPUT}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (min. 6 characters)"
              autoComplete="new-password"
              className={INPUT + ' pr-12'}
              style={errors.password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#5A7090' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
          </div>

          {/* Promo code */}
          {!showPromo ? (
            <button type="button" onClick={() => setShowPromo(true)}
              className="text-sm font-semibold" style={{ color: '#F5A623' }}>
              + Add promo code
            </button>
          ) : (
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              placeholder="Promo code (optional)"
              className={INPUT}
            />
          )}

          {/* T&C */}
          <label className="flex cursor-pointer items-start gap-3 pt-1">
            <div className="relative mt-0.5 shrink-0">
              <input type="checkbox" checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                className="sr-only" />
              <div className="flex h-5 w-5 items-center justify-center rounded"
                style={{ background: agreedTerms ? '#1A5C38' : 'transparent', border: agreedTerms ? '2px solid #22C55E' : '2px solid rgba(255,255,255,0.2)' }}>
                {agreedTerms && <span className="text-[10px] font-black text-white">✓</span>}
              </div>
            </div>
            <span className="text-xs leading-relaxed" style={{ color: '#7A95B0' }}>
              By registering I confirm I am 18+ and accept the{' '}
              <Link href="/terms" target="_blank" className="font-semibold underline" style={{ color: '#F5A623' }}>
                Terms & Conditions
              </Link>{' '}and{' '}
              <Link href="/terms#privacy" target="_blank" className="font-semibold underline" style={{ color: '#F5A623' }}>
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

          {submitError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {submitError}
            </p>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl py-4 text-base font-black text-[#0A0E14] disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#F5A623' }}>
            {loading ? t('register_creating') : t('register_submit')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: '#5A7090' }}>
          {t('register_have_account')}{' '}
          <Link href="/login" className="font-black" style={{ color: '#F5A623' }}>{t('register_signin')}</Link>
        </p>
      </div>
    </div>
  );
}
