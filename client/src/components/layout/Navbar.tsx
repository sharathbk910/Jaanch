import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { LangSwitch } from './LangSwitch.js';
import { ThemeToggle } from './ThemeToggle.js';
import { MobileNavDrawer } from './MobileNavDrawer.js';
import { useAuth } from '../../lib/AuthContext.js';
import { Button } from '../ui/Button.js';

export function Navbar() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Top Helpline Alert Bar in Exactly 1 Line */}
      <div className="w-full bg-terracotta text-white py-1.5 px-4 text-xs font-semibold tracking-wide text-center border-b-2 border-neo-border select-none whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center z-50">
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:underline truncate"
        >
          <span className="truncate">1930 National Cyber Crime Helpline — Report fraud immediately at cybercrime.gov.in</span>
          <span aria-hidden="true" className="shrink-0">→</span>
        </a>
      </div>

      <header
        data-testid="app-header"
        className="sticky top-0 z-40 w-full h-[53px] bg-background border-b-2 border-neo-border flex items-center select-none shadow-neo-sm"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-full whitespace-nowrap">
          {/* Left: Brand Logo in 1 Line */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0 group"
          >
            <div className="p-1 bg-terracotta border-2 border-neo-border shadow-neo-sm text-white shrink-0 group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
              <ShieldCheck size={16} aria-hidden="true" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-terracotta shrink-0">
              JAANCH.
            </span>
          </Link>

          {/* Center: Desktop Navigation Links (Properly Spaced in 1 Line) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 shrink-0 whitespace-nowrap" aria-label="Main Navigation">
            <NavLink
              to="/analyze"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors py-1 whitespace-nowrap ${
                  isActive
                    ? 'text-terracotta border-b-2 border-neo-border'
                    : 'text-foreground/80 hover:text-foreground'
                }`
              }
            >
              {t('nav.checkOffer', 'Check Offer')}
            </NavLink>
            <NavLink
              to="/link-check"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors py-1 whitespace-nowrap ${
                  isActive
                    ? 'text-terracotta border-b-2 border-neo-border'
                    : 'text-foreground/80 hover:text-foreground'
                }`
              }
            >
              {t('nav.linkInspector', 'Link Inspector')}
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors py-1 whitespace-nowrap ${
                  isActive
                    ? 'text-terracotta border-b-2 border-neo-border'
                    : 'text-foreground/80 hover:text-foreground'
                }`
              }
            >
              {t('navigation.resources')}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-xs font-bold transition-colors py-1 whitespace-nowrap ${
                  isActive
                    ? 'text-terracotta border-b-2 border-neo-border'
                    : 'text-foreground/80 hover:text-foreground'
                }`
              }
            >
              {t('navigation.about')}
            </NavLink>
          </nav>

          {/* Right: Actions Cluster in 1 Line (LOG IN + Outline Button + Controls) */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0 whitespace-nowrap">
            {user ? (
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <Link
                  to="/history"
                  className="text-xs font-bold text-foreground hover:text-terracotta transition-colors px-1.5 py-1 whitespace-nowrap"
                >
                  {t('navigation.history')}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 whitespace-nowrap"
                >
                  {t('navigation.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold text-foreground hover:text-terracotta transition-colors px-2 py-1 shrink-0 whitespace-nowrap"
              >
                {t('navigation.login')}
              </Link>
            )}

            {/* Clean Secondary Outline Button (Resolves Primary Button Competition) */}
            <Link to="/analyze" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-surface text-foreground border-2 border-neo-border shadow-neo-sm font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none whitespace-nowrap"
              >
                {t('navigation.verifyOffer')}
              </Button>
            </Link>

            {/* Language Switcher & Theme Toggle Cluster */}
            <div className="flex items-center gap-1.5 pl-2 border-l-2 border-neo-border/20 shrink-0 whitespace-nowrap">
              <LangSwitch size="sm" />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <ThemeToggle className="min-h-[44px] min-w-[44px] flex items-center justify-center" />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('navigation.menu')}
              aria-expanded={drawerOpen}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-btn text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Navigation Drawer */}
      <MobileNavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

export const Header = Navbar;
export default Navbar;
