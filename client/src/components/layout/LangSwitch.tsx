import React from 'react';
import { useLanguage, type Language } from '../../i18n/LanguageContext.js';
import { SegmentedControl, type Option } from '../ui/SegmentedControl.js';

export function LangSwitch({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { currentLang, setLang } = useLanguage();

  const options: Option<Language>[] = [
    { value: 'en', label: 'EN', ariaLabel: 'EN' },
    { value: 'hi', label: 'हिंदी', ariaLabel: 'HI' },
    { value: 'kn', label: 'ಕನ್ನಡ', ariaLabel: 'KN' },
  ];

  return (
    <div className="flex items-center gap-1.5" aria-label="Language selector">
      <SegmentedControl
        size={size}
        options={options}
        value={currentLang}
        onChange={(lang) => setLang(lang)}
      />
    </div>
  );
}
