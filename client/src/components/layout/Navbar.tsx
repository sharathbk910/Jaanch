import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
      <header
        data-testid="app-header"
        className="sticky top-0 z-40 w-full h-[53px] bg-background border-b border-border flex items-center select-none"
      >
        <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark (Serif Terracotta) */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-btn"
          >
            <span className="font-serif text-xl font-bold tracking-tight text-terracotta">
              JAANCH.
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main Navigation">
            <NavLink
              to="/analyze"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive
                    ? 'text-foreground font-semibold border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {t('nav.checkOffer', 'Check Offer')}
            </NavLink>
            <NavLink
              to="/link-check"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive
                    ? 'text-foreground font-semibold border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {t('nav.linkInspector', 'Link Inspector')}
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive
                    ? 'text-foreground font-semibold border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {t('navigation.resources')}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-xs transition-colors py-1 ${
                  isActive
                    ? 'text-foreground font-semibold border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {t('navigation.about')}
            </NavLink>
          </nav>

          {/* Right Action Cluster: LangSwitch, ThemeToggle, Solid Black CTA, Auth */}
          <div className="hidden md:flex items-center space-x-3">
            <LangSwitch size="sm" />
            <ThemeToggle />

            {/* Solid Black CTA */}
            <Link to="/analyze">
              <Button variant="primary" size="sm">
                {t('navigation.verifyOffer')}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-border">
                <Link to="/history">
                  <Button variant="ghost" size="sm">
                    {t('navigation.history')}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-border">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('navigation.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="sm">
                    {t('navigation.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button (min-h-[44px], min-w-[44px]) */}
          <div className="flex md:hidden items-center space-x-1">
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
