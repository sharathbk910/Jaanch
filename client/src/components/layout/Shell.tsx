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
        <Outlet />
      </main>
      <Footer />
      <FeedbackPill />
    </div>
  );
}
