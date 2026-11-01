import React, { ReactNode } from 'react';
import {
  LanguageProvider,
  useLanguage,
  Language as SupportedLanguage,
  LANGUAGE_STORAGE_KEY,
} from './LanguageContext';

export type { SupportedLanguage };

export function I18nProvider({ children }: { children: ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

export function useT() {
  const { currentLang, setLang, t } = useLanguage();
  return {
    language: currentLang,
    setLanguage: setLang,
    t: (path: string, defaultText?: string) => {
      const res = t(path);
      return res === path && defaultText ? defaultText : res;
    },
  };
}

export { LANGUAGE_STORAGE_KEY };
