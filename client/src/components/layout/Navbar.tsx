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
      {/* Top Helpline Alert Bar (MotherDuck Orange Banner Style) */}
      <div className="w-full bg-terracotta text-white py-1.5 px-4 text-xs font-mono font-bold uppercase tracking-wider text-center border-b-2 border-neo-border select-none whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center z-50">
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:underline truncate"
        >
          <span className="truncate">{t('topBanner.helplineAlert')}</span>
          <span aria-hidden="true" className="shrink-0 font-bold">→</span>
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
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0 group py-1"
          >
            <img
              src="/logo-icon.png"
              alt="Jaanch AI – Digital Trust and Safety for Indian Students"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Jaanch<span className="text-terracotta">.</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 select-none">
                <span className="w-1.5 h-1.5 bg-terracotta shrink-0 rounded-[1px]" aria-hidden="true" />
                <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/75 whitespace-nowrap max-w-[130px] sm:max-w-none truncate">
                  {t('navigation.tagline')}
                </span>
              </div>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (Properly Spaced in 1 Line) */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-6 shrink-0 whitespace-nowrap" aria-label="Main Navigation">
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
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 whitespace-nowrap">
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

            {/* Blue Action Button (shown on large screens where space permits) */}
            <Link to="/analyze" className="hidden xl:inline-flex shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="bg-neo-sky text-foreground border-2 border-neo-border shadow-neo-sm font-bold uppercase tracking-wider text-xs px-3 py-1.5 hover:bg-neo-sky-light hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none whitespace-nowrap"
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
