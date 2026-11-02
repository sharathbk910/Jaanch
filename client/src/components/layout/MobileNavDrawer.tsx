import React, { useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X, ShieldAlert, FileText, Link2, BookOpen, Info, Lock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { LangSwitch } from './LangSwitch.js';
import { ThemeToggle } from './ThemeToggle.js';
import { useAuth } from '../../lib/AuthContext.js';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // 1. Scroll Lock when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Escape Key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 3. Focus Trap and initial focus
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button initially
    const timeout = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusableEls = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" aria-hidden={!isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Accessible Dialog Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 right-0 w-full max-w-xs bg-background border-l border-border shadow-xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Header Row: Wordmark, Theme Toggle, Close Button */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded min-h-[44px]"
            >
              <img
                src="/logo-icon.png"
                alt="Jaanch"
                className="w-7 h-7 object-contain rounded-md shrink-0"
              />
              <div className="flex flex-col justify-center leading-none">
                <span className="font-serif text-lg font-bold tracking-tight text-foreground">
                  Jaanch<span className="text-terracotta">.</span>
                </span>
                <div className="flex items-center gap-1 mt-0.5 select-none">
                  <span className="w-1 h-1 bg-terracotta shrink-0 rounded-[1px]" aria-hidden="true" />
                  <span className="font-mono text-[7.5px] font-bold uppercase tracking-[0.16em] text-foreground/75">
                    CHECK BEFORE YOU TRUST
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                <ThemeToggle className="min-h-[40px] min-w-[40px] flex items-center justify-center" />
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-chip text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Items (All minimum 44px height for touch targets) */}
          <nav className="mt-6 flex flex-col space-y-1" aria-label="Mobile Navigation">
            <NavLink
              to="/analyze"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 min-h-[44px] rounded-chip text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted-subtle/10 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-subtle/5'
                }`
              }
            >
              <FileText size={18} className="text-terracotta shrink-0" aria-hidden="true" />
              <span>{t('navigation.verifyOffer')}</span>
            </NavLink>

            <NavLink
              to="/link-check"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 min-h-[44px] rounded-chip text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted-subtle/10 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-subtle/5'
                }`
              }
            >
              <Link2 size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{t('navigation.linkCheck')}</span>
            </NavLink>

            <NavLink
              to="/resources"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 min-h-[44px] rounded-chip text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted-subtle/10 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-subtle/5'
                }`
              }
            >
              <BookOpen size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{t('navigation.resources')}</span>
            </NavLink>

            <NavLink
              to="/about"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 min-h-[44px] rounded-chip text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted-subtle/10 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-subtle/5'
                }`
              }
            >
              <Info size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{t('navigation.about')}</span>
            </NavLink>

            <NavLink
              to="/privacy"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 min-h-[44px] rounded-chip text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted-subtle/10 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-subtle/5'
                }`
              }
            >
              <Lock size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{t('footer.privacy')}</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer Area: Language Selector & Auth */}
        <div className="pt-6 border-t border-border flex flex-col space-y-4">
          <div className="flex items-center justify-between min-h-[44px]">
            <span className="text-xs text-muted-foreground font-medium">Language / भाषा:</span>
            <LangSwitch size="md" />
          </div>

          {user ? (
            <div className="flex flex-col space-y-2">
              <Link
                to="/history"
                onClick={onClose}
                className="w-full min-h-[44px] flex items-center justify-center text-sm font-medium text-foreground border border-border rounded-chip hover:bg-muted-subtle/10"
              >
                {t('navigation.history')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="w-full min-h-[44px] flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('navigation.logout')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full min-h-[44px] flex items-center justify-center text-sm font-medium text-foreground border border-border rounded-chip hover:bg-muted-subtle/10"
              >
                {t('navigation.login')}
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="w-full min-h-[44px] flex items-center justify-center text-sm font-bold uppercase tracking-wider text-foreground bg-neo-sky border-2 border-neo-border shadow-neo-sm hover:bg-neo-sky-light"
              >
                {t('navigation.signup')}
              </Link>
            </div>
          )}

          {/* Quick Helpline Callout */}
          <div className="flex items-center gap-2 p-3 bg-status-high-concern-bg text-status-high-concern-fg border border-status-high-concern-border rounded-card text-xs">
            <ShieldAlert size={16} className="shrink-0" aria-hidden="true" />
            <span>Cyber Fraud Helpline: <strong>1930</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

