import React from 'react';
import { ArrowRight, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DoodleCloud } from '../ui/DoodleCloud.js';

interface IntegrationNode {
  name: string;
  category: string;
  tag: string;
}

const INTEGRATIONS: IntegrationNode[] = [
  { name: 'MCA21', category: 'Ministry of Corporate Affairs', tag: 'CIN Master' },
  { name: 'EPFO', category: 'Provident Fund Org', tag: 'UAN Verification' },
  { name: 'DigiLocker', category: 'National Digital Locker', tag: 'Credentials' },
  { name: 'AICTE', category: 'Technical Education Council', tag: 'Internship Portal' },
  { name: 'UGC', category: 'University Grants Commission', tag: 'College Portal' },
  { name: '1930 Cyber', category: 'National Cybercrime Portal', tag: 'Golden Hour' },
  { name: 'NCH 1915', category: 'Consumer Helpline', tag: 'Fee Protection' },
  { name: 'LinkedIn', category: 'Corporate Directory', tag: 'HR Authentication' },
];

export function IntegrationsRadar() {
  return (
    <section className="w-full py-16 sm:py-20 border-t-2 border-neo-border bg-background relative overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds */}
      <DoodleCloud size={150} className="absolute left-10 top-8 opacity-75 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={110} className="absolute right-12 top-16 opacity-70 hidden md:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="font-sans font-extrabold uppercase tracking-tight text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.08]">
            WORK WITH THE REGISTRIES YOU TRUST
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            Cross-check offers with the official authorities you trust, from central government registries to campus placement suites.
          </p>
          <div className="mt-4">
            <a
              href="https://www.mca.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary inline-flex items-center gap-1.5 group underline underline-offset-4"
            >
              <span>VIEW ALL INTEGRATIONS</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Semicircular Radial Radar (MotherDuck Concentric Dial) */}
        <div className="relative max-w-3xl mx-auto h-[320px] sm:h-[400px] overflow-hidden flex flex-col items-center justify-end pt-8">
          {/* Concentric Arcs */}
          <div className="absolute bottom-0 w-[640px] sm:w-[760px] h-[320px] sm:h-[380px] rounded-t-full border-2 border-neo-border/20 pointer-events-none" />
          <div className="absolute bottom-0 w-[480px] sm:w-[560px] h-[240px] sm:h-[280px] rounded-t-full border-2 border-neo-border/25 bg-surface/30 pointer-events-none" />
          <div className="absolute bottom-0 w-[300px] sm:w-[360px] h-[150px] sm:h-[180px] rounded-t-full border-2 border-neo-border/30 bg-surface/50 pointer-events-none" />

          {/* Orbiting Badges (Concentric Placement) */}
          <div className="absolute top-10 sm:top-12 flex items-center justify-center gap-4 sm:gap-6 z-20">
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-neo-sky rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">MCA21</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-neo-yellow rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">EPFO</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-neo-mint rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">DigiLocker</span>
            </div>
          </div>

          <div className="absolute top-28 sm:top-32 w-full max-w-xl flex items-center justify-between px-6 z-20">
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-neo-pink rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">AICTE</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-neo-blue rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">1930 Cyber</span>
            </div>
          </div>

          <div className="absolute top-48 sm:top-56 w-full max-w-2xl flex items-center justify-between px-10 z-20">
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-terracotta rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">UGC</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 bg-neo-sky-hover rounded-full border border-neo-border" />
              <span className="font-mono text-[11px] font-bold text-foreground">LinkedIn</span>
            </div>
          </div>

          {/* Central Radiant Sunburst Rising at Bottom */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Speech Bubble: "JAANCH VERIFIED!" */}
            <div className="mb-2 bg-surface border-2 border-neo-border shadow-neo px-4 py-1.5 font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground">
              JAANCH VERIFIED!
            </div>
            {/* Sunburst Dome */}
            <div className="w-40 h-20 rounded-t-full bg-neo-yellow border-t-2 border-x-2 border-neo-border shadow-neo flex items-end justify-center pb-2">
              <ShieldCheck size={32} className="text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IntegrationsRadar;

