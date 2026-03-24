'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import en, { TranslationKey } from '@/locales/en';
import sw from '@/locales/sw';
import fr from '@/locales/fr';

export type Lang = 'en' | 'sw' | 'fr';

const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = { en, sw, fr };

export const LANG_LABELS: Record<Lang, string> = {
  en: '🇬🇧 English',
  sw: '🇰🇪 Swahili',
  fr: '🇫🇷 Français',
};

type I18nCtx = {
  lang:      Lang;
  setLang:   (l: Lang) => void;
  t:         (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nCtx>({
  lang:    'en',
  setLang: () => {},
  t:       (key) => en[key],
});

export function I18nProvider({ defaultLang = 'en', children }: { defaultLang?: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const saved = localStorage.getItem('tw_lang') as Lang | null;
    if (saved && TRANSLATIONS[saved]) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem('tw_lang', l);
    setLangState(l);
  };

  const t = (key: TranslationKey): string =>
    TRANSLATIONS[lang][key] ?? en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
