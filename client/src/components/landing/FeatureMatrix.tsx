import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

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
    <section className="w-full py-12 border-t border-border bg-background">
      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How to Spot a Fake Student Offer
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Key differences between legitimate corporate hiring and fraudulent student traps in India.
          </p>
        </div>

        <div className="overflow-x-auto border border-border rounded-card bg-surface shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-subtle/5">
                <th className="py-3.5 px-4 font-semibold text-foreground w-1/4">Evaluation Factor</th>
                <th className="py-3.5 px-4 font-semibold text-status-likely-genuine-fg w-3/8 bg-status-likely-genuine-bg/30">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>Legitimate Offer</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold text-status-high-concern-fg w-3/8 bg-status-high-concern-bg/30">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={16} aria-hidden="true" />
                    <span>Scam Indicator</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MATRIX_DATA.map((row) => (
                <tr key={row.aspect} className="hover:bg-muted-subtle/5 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground align-top">
                    {row.aspect}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground align-top bg-status-likely-genuine-bg/10">
                    <div className="flex items-start gap-2">
                      <Check size={14} className="text-status-likely-genuine-fg mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{row.legitimate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground align-top bg-status-high-concern-bg/10">
                    <div className="flex items-start gap-2">
                      <X size={14} className="text-status-high-concern-fg mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{row.scam}</span>
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
