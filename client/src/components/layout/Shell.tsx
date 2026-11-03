import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { SkipLink } from './SkipLink.js';
import { FeedbackPill } from './FeedbackPill.js';

export function Shell() {
  return (
    <div className="min-h-screen bg-page flex flex-col antialiased selection:bg-accent-light selection:text-primary">
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <React.Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-neo-border border-t-terracotta rounded-full animate-spin" />
            </div>
          }
        >
          <Outlet />
        </React.Suspense>
      </main>
      <Footer />
      <FeedbackPill />
    </div>
  );
}

