import React from 'react';
import { useLanguage, type Language } from '../../i18n/LanguageContext.js';
import { SegmentedControl } from '../ui/SegmentedControl.js';

export function LangSwitch() {
  const { currentLang, setLang } = useLanguage();

  const options: { value: Language; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'hi', label: 'HI' },
    { value: 'kn', label: 'KN' },
  ];

  return (
    <div className="flex items-center gap-1.5" aria-label="Language selector">
      <SegmentedControl
        size="sm"
        options={options}
        value={currentLang}
        onChange={(lang) => setLang(lang as Language)}
      />
    </div>
  );
}
