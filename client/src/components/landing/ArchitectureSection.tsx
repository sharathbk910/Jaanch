import React, { useState } from 'react';
import { Minus, Plus, ShieldCheck, Database, Server, Cpu, CheckCircle2, User, Users, GraduationCap, Bot } from 'lucide-react';
import { DoodleCloud } from '../ui/DoodleCloud.js';

interface AccordionItem {
  id: string;
  title: string;
  description: string;
}

const ACCORDION_ITEMS: AccordionItem[] = [
  {
    id: 'user',
    title: 'A VERIFIER PER CANDIDATE',
    description:
      'Every person, campus placement drive, and recruiter interaction gets its own isolated verification sandbox — spun up in milliseconds on client compute.',
  },
  {
    id: 'agent',
    title: 'A FORENSIC ENGINE PER DOCUMENT',
    description:
      'Multi-pass heuristic inspection evaluating domain age, cryptographic signatures, fee extortion triggers, and OCR layout tampering in parallel.',
  },
  {
    id: 'zero-hallucination',
    title: 'ZERO HALLUCINATION GUARANTEE',
    description:
      'Strict deterministic rule engines make the core verdict. Generative AI is restricted to grounding and candidate advice — it can never alter or elevate status.',
  },
  {
    id: 'scale',
    title: 'SCALE INDEPENDENTLY ACROSS CAMPUSES',
    description:
      'Deployable across nationwide university placement cells, polytechnics, and corporate talent acquisition suites without central server bottlenecks.',
  },
];

export function ArchitectureSection() {
  const [activeId, setActiveId] = useState<string>('user');

  return (
    <section className="w-full py-16 sm:py-20 border-t-2 border-neo-border bg-neo-sky/40 relative overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds */}
      <DoodleCloud size={170} className="absolute right-10 top-6 opacity-80 hidden sm:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={120} className="absolute left-8 bottom-10 opacity-75 hidden md:block pointer-events-none select-none text-foreground" />
      <DoodleCloud size={85} className="absolute right-1/4 bottom-6 opacity-60 hidden lg:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading (Exact MotherDuck Typography) */}
        <div className="max-w-3xl mb-12">
          <h2 className="font-sans font-extrabold uppercase tracking-tight text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.08]">
            AN AGENT-FIRST ARCHITECTURE
          </h2>
          <p className="mt-3 text-sm sm:text-base text-foreground/80 font-medium leading-relaxed">
            Hypertenancy: an isolated verification instance for every candidate, university cell, and recruiter. Run fast, highly concurrent checks without resource contention or PII leakage.
          </p>
        </div>

        {/* Two-Column MotherDuck Architecture Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Accordion */}
          <div className="lg:col-span-5 space-y-4">
            {ACCORDION_ITEMS.map((item) => {
              const isOpen = activeId === item.id;
              return (
                <div
                  key={item.id}
                  className={`border-2 border-neo-border bg-surface transition-all ${
                    isOpen ? 'shadow-neo' : 'hover:shadow-neo-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(isOpen ? '' : item.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-sans font-extrabold uppercase tracking-tight text-xs sm:text-sm text-foreground group"
                    aria-expanded={isOpen}
                  >
                    <span>{item.title}</span>
                    <span className="w-6 h-6 border-2 border-neo-border bg-background flex items-center justify-center shrink-0 ml-3 text-foreground group-hover:bg-neo-yellow transition-colors">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal border-t border-neo-border/20 pt-3">
                      {item.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Architecture Graphic (MotherDuck Pipeline & Shared Storage) */}
          <div className="lg:col-span-7 bg-surface/90 border-2 border-neo-border shadow-neo-xl p-6 sm:p-8 relative">
            {/* Top Compute Nodes */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              {/* Node 1: YOU */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-neo-sky border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  YOU
                </span>
                <div className="mt-3 w-8 h-8 rounded-full bg-neo-yellow border-2 border-neo-border flex items-center justify-center text-foreground shadow-neo-sm">
                  <User size={16} />
                </div>
                <span className="mt-2 text-[9px] font-mono font-bold bg-foreground text-background px-1.5 py-0.5 uppercase">
                  PULSE
                </span>
              </div>

              {/* Node 2: CAMPUS */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-neo-peach border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  CAMPUS
                </span>
                <div className="mt-3 w-8 h-8 rounded-full bg-neo-yellow border-2 border-neo-border flex items-center justify-center text-foreground shadow-neo-sm">
                  <GraduationCap size={16} />
                </div>
                <span className="mt-2 text-[9px] font-mono font-bold bg-foreground text-background px-1.5 py-0.5 uppercase">
                  STANDARD
                </span>
              </div>

              {/* Node 3: HR CELL */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-neo-pink border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  HR CELL
                </span>
                <div className="mt-3 w-8 h-8 rounded-full bg-neo-yellow border-2 border-neo-border flex items-center justify-center text-foreground shadow-neo-sm">
                  <Users size={16} />
                </div>
                <span className="mt-2 text-[9px] font-mono font-bold bg-foreground text-background px-1.5 py-0.5 uppercase">
                  JUMBO
                </span>
              </div>

              {/* Node 4: AGENTS */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-neo-mint border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  AGENTS
                </span>
                <div className="mt-3 flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-neo-yellow border-2 border-neo-border flex items-center justify-center text-foreground">
                    <Bot size={12} />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-neo-sky border-2 border-neo-border flex items-center justify-center text-foreground">
                    <Cpu size={12} />
                  </div>
                </div>
                <span className="mt-2 text-[9px] font-mono font-bold bg-foreground text-background px-1.5 py-0.5 uppercase">
                  CLUSTER
                </span>
              </div>
            </div>

            {/* Connecting Circuit Pipes */}
            <div className="my-6 h-12 flex justify-around relative">
              <div className="w-1 bg-neo-sky border-x border-neo-border h-full" />
              <div className="w-1 bg-neo-peach border-x border-neo-border h-full" />
              <div className="w-1 bg-neo-pink border-x border-neo-border h-full" />
              <div className="w-1 bg-neo-mint border-x border-neo-border h-full" />
            </div>

            {/* Central Storage Platform Box */}
            <div className="bg-background border-2 border-neo-border shadow-neo p-4 text-center">
              <div className="inline-block bg-neo-sky/30 border border-neo-border px-3 py-1 font-mono text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                SHARED REGISTRIES & THREAT TELEMETRY
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono text-[10px] text-muted-foreground mt-2">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" /> MCA21 MASTER
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-terracotta" /> EPFO RECON
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-neo-sky" /> 1930 HELPLINE
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" /> AICTE VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArchitectureSection;
