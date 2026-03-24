'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCountryConfig, isBlocked, ALL_SELECTABLE, CountryConfig, ALLOWED_COUNTRIES } from '@/data/geoConfig';
import type { Lang } from './I18nContext';

type GeoCtx = {
  countryCode:   string;
  countryConfig: CountryConfig;
  blocked:       boolean;
  detected:      boolean;
  setCountry:    (code: string) => void;
};

const fallback = ALLOWED_COUNTRIES.find(c => c.code === 'OTHER')!;

const GeoContext = createContext<GeoCtx>({
  countryCode:   'OTHER',
  countryConfig: fallback,
  blocked:       false,
  detected:      false,
  setCountry:    () => {},
});

// Called by GeoProvider to sync language with country default
let _setLang: ((l: Lang) => void) | null = null;
export function registerLangSetter(fn: (l: Lang) => void) { _setLang = fn; }

export function GeoProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<string>('OTHER');
  const [detected,    setDetected]    = useState(false);

  const applyCountry = (code: string, autoLang = false) => {
    setCountryCode(code);
    // Auto-set language only if no manual lang preference saved
    if (autoLang && !localStorage.getItem('tw_lang')) {
      const cfg = getCountryConfig(code);
      if (!isBlocked(code) && _setLang) {
        _setLang((cfg as CountryConfig).defaultLang as Lang);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('tw_country');
    if (saved) {
      applyCountry(saved, false); // manual preference — don't override lang
      setDetected(true);
      return;
    }
    // TODO: Backend — replace with server-side IP check to prevent spoofing
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code = data?.country_code ?? 'OTHER';
        applyCountry(code, true); // auto-detect — set lang from country
        setDetected(true);
      })
      .catch(() => {
        applyCountry('OTHER', false);
        setDetected(true);
      });
  }, []);

  const setCountry = (code: string) => {
    localStorage.setItem('tw_country', code);
    applyCountry(code, true);
  };

  const cfg           = getCountryConfig(countryCode);
  const blocked       = isBlocked(countryCode);
  const countryConfig = blocked ? fallback : (cfg as CountryConfig);

  return (
    <GeoContext.Provider value={{ countryCode, countryConfig, blocked, detected, setCountry }}>
      {children}
    </GeoContext.Provider>
  );
}

export const useGeo = () => useContext(GeoContext);
