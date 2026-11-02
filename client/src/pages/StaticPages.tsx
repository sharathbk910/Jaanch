import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck, Lock, Building, GraduationCap, Briefcase, Phone, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { useLanguage } from '../i18n/LanguageContext.js';
import { SEOHead } from '../components/seo/SEOHead.js';

export function ResourcesPage() {
  const { dictionary } = useLanguage();
  const s = dictionary.staticPages;

  const verifiedPortals = [
    {
      name: s.portals.mcaName,
      url: 'https://www.mca.gov.in',
      desc: s.portals.mcaDesc,
      icon: Building,
    },
    {
      name: s.portals.ncsName,
      url: 'https://www.ncs.gov.in',
      desc: s.portals.ncsDesc,
      icon: Briefcase,
    },
    {
      name: s.portals.nspName,
      url: 'https://scholarships.gov.in',
      desc: s.portals.nspDesc,
      icon: GraduationCap,
    },
    {
      name: s.portals.aicteName,
      url: 'https://internship.aicte-india.org',
      desc: s.portals.aicteDesc,
      icon: ShieldCheck,
    },
    {
      name: s.portals.ugcName,
      url: 'https://www.ugc.gov.in',
      desc: s.portals.ugcDesc,
      icon: GraduationCap,
    },
    {
      name: s.portals.cybercrimeName,
      url: 'https://cybercrime.gov.in',
      desc: s.portals.cybercrimeDesc,
      icon: Phone,
    },
  ];

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead
        canonicalPath="/resources"
        title="Official Verification Portals & 1930 Helpline Resources | Jaanch AI"
        description="Verify employers and internships on official Indian government portals: MCA company master data, NCS job listings, AICTE internship portal, and National Cyber Crime Helpline 1930."
        keywords="MCA company verification, AICTE internship check, National Career Service portal, 1930 cyber crime number India, report internship scam"
      />
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-xs text-terracotta font-semibold uppercase tracking-wider block mb-1">
          {s.resourcesBadge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {s.resourcesTitle}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {s.resourcesSubtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifiedPortals.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.url}
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
                  <span className="text-status-likely-genuine-fg font-semibold">{s.officialBadge}</span>
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
  const { dictionary } = useLanguage();
  const s = dictionary.staticPages;

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead
        canonicalPath="/about"
        title="How to Detect Internship Scams & Verify Job Offers | Jaanch"
        description="Comprehensive guide on how to identify fake internships, detect employment scams in India, and verify offer letters using Jaanch's 15 heuristic rules."
        keywords="how to identify fake internships, internship scam detector India, fake job offer detector, verify internship offer online, detect internship fraud India, common internship fraud warning signs"
      />
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-xs text-terracotta font-semibold uppercase tracking-wider block mb-1">
          {s.aboutBadge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {s.aboutTitle}
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <Card padding="lg">
            <h2 className="font-serif text-lg font-bold text-foreground mb-2">{s.aboutMissionTitle}</h2>
            <p>
              {s.aboutMissionP1}
            </p>
            <p className="mt-3">
              <strong>JAANCH</strong> {s.aboutMissionP2.replace('JAANCH ', '')}
            </p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-surface border border-border rounded-card">
              <h3 className="font-bold text-foreground mb-1 text-sm">{s.aboutDetTitle}</h3>
              <p className="text-xs text-muted-foreground">
                {s.aboutDetDesc}
              </p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-card">
              <h3 className="font-bold text-foreground mb-1 text-sm">{s.aboutPrivTitle}</h3>
              <p className="text-xs text-muted-foreground">
                {s.aboutPrivDesc}
              </p>
            </div>
          </div>

          {/* Dedicated SEO Educational Content Guide */}
          <Card padding="lg" className="space-y-6">
            <div className="border-b border-border pb-4">
              <span className="font-mono text-xs text-terracotta font-bold uppercase tracking-wider block mb-1">
                Student Defense Handbook
              </span>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                How to Identify Fake Internships & Detect Job Scams in India
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                A practical guide to evaluating offer letters, spotting recruiter red flags, and avoiding advance-fee traps.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-base text-foreground">
                1. Common Internship Fraud Warning Signs in India
              </h3>
              <ul className="space-y-2.5 text-xs text-muted-foreground list-disc list-inside">
                <li>
                  <strong className="text-foreground">Upfront Fees or Laptop Security Deposits:</strong> Legitimate employers never ask students to pay for onboarding, laptop courier charges, document verification, or gate passes. Demanding money is a 100% scam signal.
                </li>
                <li>
                  <strong className="text-foreground">Free Webmail or Lookalike Domains:</strong> Unofficial recruiters contact candidates from free webmail addresses (e.g. <code>hr.tcs.careers@gmail.com</code>) or typosquatted domains (e.g. <code>@micros0ft.org</code>, <code>@infosys-careers.net</code>).
                </li>
                <li>
                  <strong className="text-foreground">Communication Exclusively via Messaging Apps:</strong> Conducting entire hiring processes over Telegram, WhatsApp channels, or SMS without an official video interview or corporate email trail.
                </li>
                <li>
                  <strong className="text-foreground">Immediate Selection Without Assessment:</strong> Receiving an appointment letter within hours of applying, without technical evaluation, portfolio review, or structured interviews.
                </li>
                <li>
                  <strong className="text-foreground">Coercive 24-Hour Deadlines:</strong> Artificial urgency demanding immediate fee transfer or banking details within 24 hours to "reserve" an allotted internship slot.
                </li>
              </ul>
            </div>

            <div className="space-y-4 pt-2 border-t border-border/60">
              <h3 className="font-bold text-base text-foreground">
                2. Step-by-Step: How to Verify Internship Offers Online
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-background border border-border rounded-md">
                  <h4 className="font-bold text-foreground mb-1">Step 1: Check MCA21 Registration</h4>
                  <p className="text-muted-foreground">Verify the company's Corporate Identification Number (CIN) on the official Ministry of Corporate Affairs portal (mca.gov.in).</p>
                </div>
                <div className="p-3 bg-background border border-border rounded-md">
                  <h4 className="font-bold text-foreground mb-1">Step 2: AICTE & NCS Portals</h4>
                  <p className="text-muted-foreground">Cross-reference whether the internship is registered on the AICTE Internship Portal or National Career Service (NCS).</p>
                </div>
                <div className="p-3 bg-background border border-border rounded-md">
                  <h4 className="font-bold text-foreground mb-1">Step 3: WHOIS Domain Age</h4>
                  <p className="text-muted-foreground">Inspect the recruiter's web domain age. Fraudulent websites are usually registered less than 60 days before outreach.</p>
                </div>
                <div className="p-3 bg-background border border-border rounded-md">
                  <h4 className="font-bold text-foreground mb-1">Step 4: Analyze with Jaanch</h4>
                  <p className="text-muted-foreground">Paste the offer text or upload the letter into Jaanch to run an instant heuristic scan with zero data storage.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
              <h3 className="font-bold text-base text-foreground">
                3. How Jaanch Helps Students Stay Safe
              </h3>
              <p className="text-muted-foreground">
                Jaanch acts as an automated, privacy-first internship scam detector. By redacting your personal details (Aadhaar, phone numbers, bank details) on your local machine, our 15 deterministic heuristic rules evaluate language patterns, domain reputations, and fee traps without exposing your private information.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  const { dictionary } = useLanguage();
  const s = dictionary.staticPages;

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead
        canonicalPath="/privacy"
        title="Privacy Policy & Client-Side PII Redaction Architecture | Jaanch AI"
        description="Learn how Jaanch AI safeguards student data with client-side regex masking and local WebAssembly OCR. Zero raw user submissions or unmasked PII are shared."
        keywords="Jaanch AI privacy policy, client-side data protection, Aadhaar masking, private OCR document parsing"
      />
      <div className="max-w-3xl mx-auto">
        <span className="font-mono text-xs text-terracotta font-semibold uppercase tracking-wider block mb-1">
          {s.privacyBadge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {s.privacyTitle}
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <Card padding="lg">
            <div className="flex items-center gap-2 font-bold text-foreground text-base mb-3">
              <Lock size={18} className="text-terracotta" />
              <span>{s.privacyCardTitle}</span>
            </div>
            <p>
              {s.privacyCardDesc}
            </p>
          </Card>

          <div className="p-6 bg-surface border border-border rounded-card space-y-4 text-xs sm:text-sm">
            <h2 className="font-bold text-foreground text-sm">{s.privacyKeyTitle}</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>
                <strong>{s.privacyItem1Title}:</strong> {s.privacyItem1Desc}
              </li>
              <li>
                <strong>{s.privacyItem2Title}:</strong> {s.privacyItem2Desc}
              </li>
              <li>
                <strong>{s.privacyItem3Title}:</strong> {s.privacyItem3Desc}
              </li>
              <li>
                <strong>{s.privacyItem4Title}:</strong> {s.privacyItem4Desc}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const { dictionary } = useLanguage();
  const s = dictionary.staticPages;

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <SEOHead
        noIndex={true}
        title="404 – Page Not Found | Jaanch AI"
        description="The page you requested could not be found."
      />
      <div className="max-w-md mx-auto">
        <span className="font-mono text-sm font-bold text-terracotta mb-2 block">
          {s.notFoundBadge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {s.notFoundTitle}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-8">
          {s.notFoundDesc}
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            <ArrowLeft size={16} className="mr-2" />
            <span>{s.notFoundReturn}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
