import React from 'react';
import { ArrowRight, Shield, Award, Users, CheckCircle, Clock } from 'lucide-react';
import { DoodleCloud } from '../ui/DoodleCloud.js';

export function CommunityProofSection() {
  return (
    <section className="w-full py-16 sm:py-20 border-t-2 border-neo-border bg-neo-sky/40 relative overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds */}
      <DoodleCloud size={160} className="absolute right-12 top-4 opacity-80 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={110} className="absolute left-6 bottom-6 opacity-75 hidden md:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-sans font-extrabold uppercase tracking-tight text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.08]">
            CAMPUSES & RECRUITERS ON JAANCH
          </h2>
          <p className="mt-3 text-sm sm:text-base text-foreground/80 font-medium leading-relaxed">
            Campus placement drives, corporate internships, and candidate authentication — protected by Jaanch.
          </p>
        </div>

        {/* MotherDuck Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {/* Featured Pale Pink Card (together.ai Style with Big Neo Shadow) */}
          <div className="md:col-span-2 lg:col-span-2 bg-neo-pink border-2 border-neo-border shadow-neo-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-surface border-2 border-neo-border flex items-center justify-center font-bold text-foreground text-xs shadow-neo-sm">
                  JC
                </div>
                <span className="font-sans font-extrabold text-lg text-foreground tracking-tight">
                  Placement Consortium India
                </span>
              </div>
              <p className="font-sans text-base sm:text-xl font-bold text-foreground leading-snug">
                “The Jaanch deterministic engine combo is fantastic. It has been transformative for protecting our graduating batch from fake appointment letters and registration deposit traps.”
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-neo-border/20 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:underline cursor-pointer flex items-center gap-1.5 group">
                READ CASE STUDY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase bg-surface border border-neo-border px-2 py-0.5">
                VERIFIED STUDY
              </span>
            </div>
          </div>

          {/* Metric Card (FinQore Style: 8H -> 8M) */}
          <div className="bg-surface border-2 border-neo-border shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-terracotta" />
                <span className="font-sans font-bold text-sm text-foreground">Turnaround Time</span>
              </div>
              <div className="font-sans font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight my-2">
                24H → 3S
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
                Offer letter verification runtime after switching from manual HR telephone cross-checks to Jaanch.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neo-border/20">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:underline cursor-pointer flex items-center gap-1.5 group">
                READ CASE STUDY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* White Card 1 (GOODSHIP Style) */}
          <div className="bg-surface border-2 border-neo-border shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-neo-sky-hover" />
                <span className="font-sans font-bold text-sm text-foreground">Campus Shield</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                An automated offer letter analyst answering student authenticity questions in real time with zero PII retention.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neo-border/20">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:underline cursor-pointer flex items-center gap-1.5 group">
                READ CASE STUDY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* White Card 2 (DO Style) */}
          <div className="bg-surface border-2 border-neo-border shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award size={18} className="text-emerald-600" />
                <span className="font-sans font-bold text-sm text-foreground">Open Defense</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                National scale candidate fraud defense protecting engineering, arts, and polytechnic job seekers across India.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neo-border/20">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:underline cursor-pointer flex items-center gap-1.5 group">
                READ CASE STUDY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* White Card 3 (AheadComputing Style) */}
          <div className="bg-surface border-2 border-neo-border shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-terracotta" />
                <span className="font-sans font-bold text-sm text-foreground">Threat Sentinel</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                An agent-first fraud intelligence network built on isolated per-document verification passes and 1930 integration.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neo-border/20">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:underline cursor-pointer flex items-center gap-1.5 group">
                READ CASE STUDY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CommunityProofSection;
