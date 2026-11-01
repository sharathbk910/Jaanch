import React from 'react';
import { Marquee } from './Marquee.js';
import { ShieldCheck, Building2, PhoneCall, ExternalLink, Award, CheckCircle } from 'lucide-react';

interface PortalItem {
  name: string;
  authority: string;
  tag: string;
  url: string;
}

const PORTALS: PortalItem[] = [
  { name: 'MCA21 Registry', authority: 'Ministry of Corporate Affairs', tag: 'CIN Master', url: 'https://www.mca.gov.in' },
  { name: '1930 Cyber Helpline', authority: 'MHA Cyber Crime Coordination', tag: '24x7 Emergency', url: 'https://cybercrime.gov.in' },
  { name: 'EPFO UAN Directory', authority: 'Employees Provident Fund', tag: 'Employer Recon', url: 'https://www.epfindia.gov.in' },
  { name: 'AICTE Internship Portal', authority: 'Govt Technical Education', tag: 'Accredited', url: 'https://internship.aicte-india.org' },
  { name: 'DigiLocker Verification', authority: 'Digital India MeitY', tag: 'Tamper-Proof', url: 'https://www.digilocker.gov.in' },
  { name: 'National Scholarship Portal', authority: 'Govt of India', tag: 'Scholarship Auth', url: 'https://scholarships.gov.in' },
  { name: 'NCH 1915 Consumer Cell', authority: 'Department of Consumer Affairs', tag: 'Fee Refund', url: 'https://consumerhelpline.gov.in' },
];

export function TrustMarquee() {
  return (
    <div className="w-full py-6 border-y-2 border-neo-border bg-surface/50 overflow-hidden relative">
      <div className="max-w-editorial mx-auto px-4 mb-3 text-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-terracotta" aria-hidden="true" />
          <span>Real-Time Cross-Referencing Across National Directives</span>
        </span>
      </div>

      <Marquee speed={35} pauseOnHover={true} className="py-2">
        {PORTALS.map((portal) => (
          <a
            key={portal.name}
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-surface border-2 border-neo-border shadow-neo-sm px-4 py-2.5 hover:bg-neo-sky/30 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all group shrink-0"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-neo-sky border border-neo-border group-hover:bg-primary transition-colors" />
            <div className="text-left">
              <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-foreground">
                <span>{portal.name}</span>
                <ExternalLink size={11} className="text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {portal.authority}
              </div>
            </div>
            <span className="ml-2 font-mono text-[10px] font-bold uppercase bg-neo-yellow/40 border border-neo-border px-1.5 py-0.5 text-foreground">
              {portal.tag}
            </span>
          </a>
        ))}
      </Marquee>
    </div>
  );
}

export default TrustMarquee;

