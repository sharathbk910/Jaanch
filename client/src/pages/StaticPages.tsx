import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck, Lock, Building, GraduationCap, Briefcase, Phone, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';

export function ResourcesPage() {
  const verifiedPortals = [
    {
      name: 'Ministry of Corporate Affairs (MCA)',
      url: 'https://www.mca.gov.in',
      desc: 'Verify whether a private limited company or LLP is legally incorporated in India using Company Master Data.',
      icon: Building,
    },
    {
      name: 'National Career Service (NCS)',
      url: 'https://www.ncs.gov.in',
      desc: 'Ministry of Labour & Employment initiative connecting verified jobseekers with authentic Indian employers.',
      icon: Briefcase,
    },
    {
      name: 'National Scholarship Portal (NSP)',
      url: 'https://scholarships.gov.in',
      desc: 'Unified central portal for Government of India pre-matric and post-matric scholarship verification.',
      icon: GraduationCap,
    },
    {
      name: 'AICTE Internship Portal',
      url: 'https://internship.aicte-india.org',
      desc: 'Official All India Council for Technical Education portal offering vetted and legitimate internships for college students.',
      icon: ShieldCheck,
    },
    {
      name: 'University Grants Commission (UGC)',
      url: 'https://www.ugc.gov.in',
      desc: 'List of fake universities and recognized institutions published by the higher education apex regulatory body.',
      icon: GraduationCap,
    },
    {
      name: 'National Cybercrime Reporting Portal',
      url: 'https://cybercrime.gov.in',
      desc: 'Lodge formal cybercrime complaints online or dial toll-free 1930 immediately if money has been defrauded.',
      icon: Phone,
    },
  ];

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-xs text-terracotta font-semibold uppercase tracking-wider block mb-1">
          Government & Apex Directories
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Official Verification Resources
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Never rely on offer letters received via WhatsApp, Telegram, or Gmail. Cross-verify credentials against India’s authorized government databases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifiedPortals.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 bg-surface border border-border rounded-card hover:border-terracotta transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-muted-subtle/10 text-terracotta rounded-chip">
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <ExternalLink size={14} className="text-muted-foreground group-hover:text-terracotta transition-colors" />
                  </div>
                  <h2 className="text-sm font-bold text-foreground mb-1.5 group-hover:text-terracotta transition-colors">
                    {p.name}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="truncate">{p.url.replace('https://', '')}</span>
                  <span className="text-status-likely-genuine-fg font-semibold">Official .gov.in</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-xs text-terracotta font-semibold uppercase tracking-wider block mb-1">
          About Jaanch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Digital Trust & Safety for Indian Students
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <Card padding="lg">
            <h2 className="font-serif text-lg font-bold text-foreground mb-2">Our Mission</h2>
            <p>
              Every year, thousands of college students and fresh graduates in India lose their savings to predatory employment fraud. Fraudulent recruiters exploit hope and urgency by demanding upfront "laptop security deposits," "training certification fees," or "document processing charges."
            </p>
            <p className="mt-3">
              <strong>JAANCH</strong> was built from scratch as an open, free, and privacy-preserving public service. It empowers students with deterministic heuristics and threat intelligence before they transfer a single rupee or compromise private documents.
            </p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-surface border border-border rounded-card">
              <h3 className="font-bold text-foreground mb-1 text-sm">Deterministic Detection</h3>
              <p className="text-xs text-muted-foreground">
                We do not rely on generative AI hallucinations. Our core checks run on 8 strict, deterministic heuristic rules rooted in Indian law and employment standards.
              </p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-card">
              <h3 className="font-bold text-foreground mb-1 text-sm">Privacy by Architecture</h3>
              <p className="text-xs text-muted-foreground">
                Guest audits never touch a database. All sensitive PII (names, emails, phones) is sanitized on your device before analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-xs text-terracotta font-semibold uppercase tracking-wider block mb-1">
          Privacy Architecture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Privacy Policy & Data Protection
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <Card padding="lg">
            <div className="flex items-center gap-2 font-bold text-foreground text-base mb-3">
              <Lock size={18} className="text-terracotta" />
              <span>Zero Guest Storage Guarantee</span>
            </div>
            <p>
              When you use Jaanch without signing in, <strong>nothing is saved to our databases</strong>. Your submission is evaluated in memory, results are returned directly to your browser session, and the memory is discarded immediately.
            </p>
          </Card>

          <div className="p-6 bg-surface border border-border rounded-card space-y-4 text-xs sm:text-sm">
            <h2 className="font-bold text-foreground text-sm">Key Data Protections</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <strong>Client-Side PII Scrubbing:</strong> Phone numbers, personal email addresses, UPI handles, and Aadhaar-like numbers are redacted before heuristic execution.
              </li>
              <li>
                <strong>Account Privacy & RLS:</strong> For logged-in users, submission records are strictly sandboxed using PostgreSQL Row Level Security (RLS). Other users or moderators cannot read your private submissions.
              </li>
              <li>
                <strong>Complete Erasure:</strong> You can purge your entire history at any time with a single click in Settings.
              </li>
              <li>
                <strong>No Tracking or Ad Pixels:</strong> We do not run Google Analytics, Meta Pixel, or third-party behavioral trackers.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="max-w-md mx-auto">
        <span className="font-mono text-sm font-bold text-terracotta mb-2 block">
          404 / NOT FOUND
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Lost in Navigation
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-8">
          The safety resource or page you requested does not exist or has moved. Return to the main portal to audit an offer.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            <ArrowLeft size={16} className="mr-2" />
            <span>Return to Safety Portal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
