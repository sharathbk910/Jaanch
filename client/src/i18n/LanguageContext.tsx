import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, getTranslation, TranslationDictionary } from './translations';

export type Language = 'en' | 'hi' | 'kn';

export interface LanguageContextType {
  currentLang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
  dictionary: TranslationDictionary;
}

export const LANGUAGE_STORAGE_KEY = 'jaanch_language';

export const LanguageContext = createContext<LanguageContextType | null>(null);

export interface LanguageProviderProps {
  children: ReactNode;
  defaultLang?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLang = 'en',
}) => {
  const [currentLang, setCurrentLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'kn') {
        return saved;
      }
    } catch {
      // localStorage may be unavailable in restricted environments
    }
    return defaultLang;
  });

  const setLang = useCallback((lang: Language) => {
    setCurrentLangState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLang;
    }
  }, [currentLang]);

  const t = useCallback(
    (path: string): string => {
      return getTranslation(currentLang, path);
    },
    [currentLang]
  );

  const value: LanguageContextType = {
    currentLang,
    setLang,
    t,
    dictionary: translations[currentLang],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Aliases for seamless integration with existing components
export const useT = () => {
  const { t, currentLang, setLang } = useLanguage();
  return { t, currentLang, setLang };
};

export const I18nProvider = LanguageProvider;
export const useI18n = useLanguage;
