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
        title="About Jaanch AI – Mission, Heuristic Audit Architecture & Trust Framework"
        description="Learn how Jaanch AI protects Indian college students and job seekers with 15 explainable heuristic rules, client-side privacy redaction, and community threat intelligence."
        keywords="about Jaanch AI, student scam prevention mission, explainable heuristic fraud detection, digital trust India"
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
