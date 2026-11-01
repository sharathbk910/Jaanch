import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import en from './locales/en.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

const dictionaries: Record<SupportedLanguage, typeof en> = {
  en,
  hi,
  kn,
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultText?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'jaanch_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'kn') {
        return stored;
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors in test or private browsing
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (path: string, defaultText?: string): string => {
    const keys = path.split('.');
    const dict = dictionaries[language] || dictionaries.en;

    let current: any = dict;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to English dictionary
        let fallback: any = dictionaries.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return defaultText || path;
          }
        }
        return typeof fallback === 'string' ? fallback : defaultText || path;
      }
    }

    return typeof current === 'string' ? current : defaultText || path;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useT must be used within an I18nProvider');
  }
  return context;
}
