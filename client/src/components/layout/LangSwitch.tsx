import React from 'react';
import { useT, type SupportedLanguage } from '../../i18n/I18nContext.js';
import { SegmentedControl } from '../ui/SegmentedControl.js';

export function LangSwitch() {
  const { language, setLanguage, t } = useT();

  const options: { value: SupportedLanguage; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'hi', label: 'HI' },
    { value: 'kn', label: 'KN' },
  ];

  return (
    <div className="flex items-center gap-1.5" aria-label="Language selector">
      <SegmentedControl
        size="sm"
        options={options}
        value={language}
        onChange={(lang) => setLanguage(lang)}
      />
    </div>
  );
}
