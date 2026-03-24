'use client';

import { useGeo } from '@/context/GeoContext';
import { useI18n } from '@/context/I18nContext';
import { ALL_SELECTABLE } from '@/data/geoConfig';
import { useState } from 'react';

export default function BlockedPage() {
  const { setCountry } = useGeo();
  const { t } = useI18n();
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: '#0B0E14' }}>

      <div className="mb-6 text-6xl">🌍</div>

      <div className="mb-2 flex items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black"
          style={{ background: 'linear-gradient(135deg,#1A5C38,#0f3d26)', color: '#F5A623' }}>TW</div>
        <span className="text-lg font-black text-white">TopWager</span>
      </div>

      <h1 className="mb-3 text-2xl font-black text-white">{t('geo_blocked_title')}</h1>
      <p className="mb-2 max-w-sm text-sm" style={{ color: '#5A7090' }}>{t('geo_blocked_body')}</p>
      <p className="mb-8 text-xs" style={{ color: '#3A4A5A' }}>{t('geo_blocked_support')}</p>

      <button onClick={() => setShowSelector(!showSelector)}
        className="text-xs underline" style={{ color: '#5A7090' }}>
        {t('geo_wrong_country')}
      </button>

      {showSelector && (
        <div className="mt-4 w-full max-w-xs rounded-xl p-4"
          style={{ background: '#131720', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="mb-3 text-xs font-semibold" style={{ color: '#9CA3AF' }}>{t('geo_select_country')}</p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {ALL_SELECTABLE.map(c => (
              <button key={c.code} onClick={() => setCountry(c.code)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-white/5"
                style={{ color: '#E2E8F0' }}>
                <span>{c.flag}</span>
                <span>{c.name}</span>
                <span className="ml-auto" style={{ color: '#4A5568' }}>{c.currency}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 text-[11px]" style={{ color: '#2D3748' }}>{t('rg_tagline')}</p>
    </div>
  );
}
