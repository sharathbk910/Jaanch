import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { DoodleCloud } from '../ui/DoodleCloud.js';

interface MatrixRow {
  aspect: string;
  legitimate: string;
  scam: string;
}

const MATRIX_DATA: MatrixRow[] = [
  {
    aspect: 'Upfront Money Demands',
    legitimate: '₹0 charged. Legitimate employers pay you; they never charge for training, uniforms, or laptop security.',
    scam: 'Demands ₹500–₹5,000 for "registration", "laptop security deposit", or "HR background check".',
  },
  {
    aspect: 'Banking Credentials & OTP',
    legitimate: 'Collects bank account number & IFSC only for salary credit. Never asks for OTP or UPI PIN.',
    scam: 'Demands 6-digit OTP, asks you to scan a UPI QR code to "receive stipend", or requires debit card PIN.',
  },
  {
    aspect: 'Recruiter Email Domain',
    legitimate: 'Always from verified corporate or official government domain (e.g., @tcs.com, @gov.in).',
    scam: 'Uses free webmail accounts: @gmail.com, @yahoo.com, or spoofed lookalike domains (e.g., @tcs-careers.in).',
  },
  {
    aspect: 'Selection Process',
    legitimate: 'Structured multi-round technical assessment, interview, and formal verification.',
    scam: 'Direct appointment letter issued over WhatsApp or Telegram without any technical assessment or interview.',
  },
  {
    aspect: 'Hiring Urgency & Coercion',
    legitimate: 'Provides reasonable acceptance deadlines (typically 3–14 business days).',
    scam: 'Aggressive urgency: "Offer expires in 2 hours. Pay now or legal action will be initiated against you."',
  },
];

export function FeatureMatrix() {
  return (
    <section className="w-full py-16 border-t-2 border-neo-border bg-background relative overflow-hidden">
      {/* Decorative MotherDuck Floating Cloud */}
      <DoodleCloud size={100} className="absolute right-12 top-6 opacity-60 hidden sm:block pointer-events-none select-none text-foreground" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            How to Spot a Fake Student Offer
          </h2>
        </div>

        <div className="overflow-x-auto border-2 border-neo-border bg-surface shadow-neo-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-neo-border bg-neo-yellow/30">
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-foreground w-1/4 border-r-2 border-neo-border">
                  Evaluation Factor
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-status-likely-genuine-fg w-3/8 bg-status-likely-genuine-bg/50 border-r-2 border-neo-border">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>Legitimate Offer</span>
                  </div>
                </th>
                <th className="py-4 px-4 font-bold uppercase tracking-wider text-status-high-concern-fg w-3/8 bg-status-high-concern-bg/50">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={16} aria-hidden="true" />
                    <span>Scam Indicator</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neo-border">
              {MATRIX_DATA.map((row) => (
                <tr key={row.aspect} className="hover:bg-muted-subtle/5 transition-colors">
                  <td className="py-4 px-4 font-bold text-foreground align-top border-r-2 border-neo-border">
                    {row.aspect}
                  </td>
                  <td className="py-4 px-4 text-foreground/90 align-top bg-status-likely-genuine-bg/20 border-r-2 border-neo-border">
                    <div className="flex items-start gap-2">
                      <div className="p-0.5 bg-status-likely-genuine-bg border border-status-likely-genuine-border mt-0.5 shrink-0">
                        <Check size={14} className="text-status-likely-genuine-fg" aria-hidden="true" />
                      </div>
                      <span className="leading-relaxed">{row.legitimate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground/90 align-top bg-status-high-concern-bg/20">
                    <div className="flex items-start gap-2">
                      <div className="p-0.5 bg-status-high-concern-bg border border-status-high-concern-border mt-0.5 shrink-0">
                        <X size={14} className="text-status-high-concern-fg" aria-hidden="true" />
                      </div>
                      <span className="leading-relaxed">{row.scam}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default FeatureMatrix;
