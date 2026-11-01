import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import { useT } from '../../i18n/I18nContext.js';
import { LangSwitch } from './LangSwitch.js';
import { useAuth } from '../../lib/AuthContext.js';
import { Button } from '../ui/Button.js';

export interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSheet({ isOpen, onClose }: MobileSheetProps) {
  const { t } = useT();
  const { user, signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      className="fixed inset-0 z-50 md:hidden bg-primary/40 backdrop-blur-sm"
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-page p-6 border-l border-hairline flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-hairline">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-primary">
                JAANCH<span className="text-accent">.</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-btn text-muted hover:text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              aria-label={t('nav.closeMenu', 'Close menu')}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-6 flex flex-col space-y-3" aria-label="Mobile Navigation Links">
            <NavLink
              to="/analyze"
              onClick={onClose}
              className={({ isActive }) =>
                `text-xs font-medium py-2 px-3 rounded-btn transition-colors ${
                  isActive ? 'bg-btn text-surface' : 'text-body hover:text-primary hover:bg-surface'
                }`
              }
            >
              {t('nav.checkOffer', 'Check Offer')}
            </NavLink>
            <NavLink
              to="/link-check"
              onClick={onClose}
              className={({ isActive }) =>
                `text-xs font-medium py-2 px-3 rounded-btn transition-colors ${
                  isActive ? 'bg-btn text-surface' : 'text-body hover:text-primary hover:bg-surface'
                }`
              }
            >
              {t('nav.linkInspector', 'Link Inspector')}
            </NavLink>
            <NavLink
              to="/resources"
              onClick={onClose}
              className={({ isActive }) =>
                `text-xs font-medium py-2 px-3 rounded-btn transition-colors ${
                  isActive ? 'bg-btn text-surface' : 'text-body hover:text-primary hover:bg-surface'
                }`
              }
            >
              {t('nav.verificationGuide', 'Verification Guide')}
            </NavLink>
            <NavLink
              to="/about"
              onClick={onClose}
              className={({ isActive }) =>
                `text-xs font-medium py-2 px-3 rounded-btn transition-colors ${
                  isActive ? 'bg-btn text-surface' : 'text-body hover:text-primary hover:bg-surface'
                }`
              }
            >
              {t('nav.about', 'About')}
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/history"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `text-xs font-medium py-2 px-3 rounded-btn transition-colors ${
                      isActive ? 'bg-btn text-surface' : 'text-body hover:text-primary hover:bg-surface'
                    }`
                  }
                >
                  {t('nav.history', 'History')}
                </NavLink>
                <NavLink
                  to="/settings"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `text-xs font-medium py-2 px-3 rounded-btn transition-colors ${
                      isActive ? 'bg-btn text-surface' : 'text-body hover:text-primary hover:bg-surface'
                    }`
                  }
                >
                  {t('nav.settings', 'Settings')}
                </NavLink>
              </>
            ) : null}
          </nav>
        </div>

        <div className="pt-6 border-t border-hairline flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Language</span>
            <LangSwitch />
          </div>

          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                onClose();
              }}
            >
              {t('nav.logout', 'Sign Out')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <NavLink to="/login" onClick={onClose} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  {t('nav.login', 'Sign In')}
                </Button>
              </NavLink>
              <NavLink to="/signup" onClick={onClose} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  {t('nav.signup', 'Sign Up')}
                </Button>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
