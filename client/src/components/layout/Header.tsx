import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useT } from '../../i18n/I18nContext.js';
import { LangSwitch } from './LangSwitch.js';
import { MobileSheet } from './MobileSheet.js';
import { useAuth } from '../../lib/AuthContext.js';
import { Button } from '../ui/Button.js';

export function Header() {
  const { t } = useT();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        data-testid="app-header"
        className="sticky top-0 z-40 w-full h-[53px] bg-page border-b border-hairline flex items-center select-none"
      >
        <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-btn">
            <span className="font-serif text-lg font-bold tracking-tight text-primary">
              JAANCH<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (Part G §4.1 & Decision D5) */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main Navigation">
            <NavLink
              to="/analyze"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive ? 'text-primary font-semibold border-b-2 border-btn' : 'text-muted hover:text-primary'
                }`
              }
            >
              {t('nav.checkOffer', 'Check Offer')}
            </NavLink>
            <NavLink
              to="/link-check"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive ? 'text-primary font-semibold border-b-2 border-btn' : 'text-muted hover:text-primary'
                }`
              }
            >
              {t('nav.linkInspector', 'Link Inspector')}
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive ? 'text-primary font-semibold border-b-2 border-btn' : 'text-muted hover:text-primary'
                }`
              }
            >
              {t('nav.verificationGuide', 'Verification Guide')}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive ? 'text-primary font-semibold border-b-2 border-btn' : 'text-muted hover:text-primary'
                }`
              }
            >
              {t('nav.about', 'About')}
            </NavLink>
          </nav>

          {/* Right Action Cluster: Language Switch & Authentication */}
          <div className="hidden md:flex items-center space-x-3">
            <LangSwitch />

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/history">
                  <Button variant="ghost" size="sm">
                    {t('nav.history', 'History')}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  {t('nav.logout', 'Sign Out')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.login', 'Sign In')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    {t('nav.signup', 'Sign Up')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <LangSwitch />
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1 rounded-btn text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              aria-label={t('nav.openMenu', 'Open menu')}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileSheet isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
