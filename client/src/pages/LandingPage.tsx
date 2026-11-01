import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';

export function LandingPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto mb-16" aria-labelledby="hero-title">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-hairline rounded-pill text-[11px] font-mono text-muted mb-6">
          <ShieldCheck size={13} className="text-accent" aria-hidden="true" />
          <span>OFFICIAL PORTALS ARE ALWAYS 100% FREE</span>
        </div>
        <h1 id="hero-title" className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-primary leading-tight mb-4">
          Know it's real <br />
          <span className="text-accent">before you reply.</span>
        </h1>
        <p className="text-xs sm:text-sm text-body max-w-lg mx-auto mb-8 leading-relaxed">
          Verify job offers, internship selection letters, and scholarship messages. Fast, deterministic, and strictly confidential.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/analyze">
            <Button size="lg" className="w-full sm:w-auto">
              Check an Offer Now
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
          <Link to="/link-check">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Inspect a Recruiter Link
            </Button>
          </Link>
        </div>
      </section>

      {/* Facts Band Preview */}
      <section className="border-t border-hairline pt-12" aria-labelledby="facts-title">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md">
            <span className="font-mono text-xs text-muted mb-2 block">01 / DISQUALIFIER</span>
            <h2 className="font-serif text-base font-bold text-primary mb-1">
              Zero Upfront Fees
            </h2>
            <p className="text-xs text-body leading-relaxed">
              Legitimate recruiters from registered employers never charge registration, training, or laptop security fees.
            </p>
          </Card>
          <Card padding="md">
            <span className="font-mono text-xs text-muted mb-2 block">02 / CREDENTIALS</span>
            <h2 className="font-serif text-base font-bold text-primary mb-1">
              No Banking PINs
            </h2>
            <p className="text-xs text-body leading-relaxed">
              Never share bank OTPs or authorize debit requests. Real employers deposit money into accounts; they never withdraw.
            </p>
          </Card>
          <Card padding="md">
            <span className="font-mono text-xs text-muted mb-2 block">03 / VERIFIED DOMAINS</span>
            <h2 className="font-serif text-base font-bold text-primary mb-1">
              Check Company Emails
            </h2>
            <p className="text-xs text-body leading-relaxed">
              Corporate HR teams communicate via domain emails like @tcs.com or @infosys.com, never free Gmail addresses.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
