import React from 'react';
import { useT } from '../../i18n/I18nContext.js';

export function SkipLink() {
  const { t } = useT();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-btn focus:text-surface focus:rounded-btn focus:border focus:border-accent text-xs font-medium"
    >
      {t('skipLink', 'Skip to main content')}
    </a>
  );
}
