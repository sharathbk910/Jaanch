import { describe, it, expect } from 'vitest';
import { evaluateEmailHeaders } from '../rules/emailHeaders.js';
import { analyzeOffer } from '../index.js';

describe('RFC 822 Email Header Analysis (F08)', () => {
  it('detects SPF failure in headers', () => {
    const rawHeaders = `Received-SPF: fail (google.com: domain of recruiter@spoofed-tcs.com does not designate 192.0.2.1 as permitted sender)
Authentication-Results: mx.google.com; spf=fail (google.com: domain of recruiter@spoofed-tcs.com does not designate 192.0.2.1 as permitted sender)`;

    const res = evaluateEmailHeaders(rawHeaders);
    expect(res.spfStatus).toBe('fail');
    expect(res.signals.some((s) => s.ruleId === 'RULE_EMAIL_SPF_FAILED')).toBe(true);
  });

  it('detects DKIM and DMARC failures with critical severity', () => {
    const rawHeaders = `Authentication-Results: mx.google.com;
      dkim=fail header.i=@legit-bank.com;
      dmarc=fail (p=reject sp=reject dis=reject) header.from=legit-bank.com`;

    const res = evaluateEmailHeaders(rawHeaders);
    expect(res.dkimStatus).toBe('fail');
    expect(res.dmarcStatus).toBe('fail');
    expect(res.signals.some((s) => s.ruleId === 'RULE_EMAIL_DKIM_FAILED')).toBe(true);
    expect(res.signals.some((s) => s.ruleId === 'RULE_EMAIL_DMARC_FAILED')).toBe(true);
  });

  it('detects From and Reply-To domain mismatch', () => {
    const rawHeaders = `From: "TCS Careers HR" <careers@tcs.com>
Reply-To: "Urgent Hiring Agent" <hr-contact@gmail.com>
Subject: Job Offer Letter`;

    const res = evaluateEmailHeaders(rawHeaders);
    expect(res.isDomainMismatched).toBe(true);
    expect(res.signals.some((s) => s.ruleId === 'RULE_EMAIL_REPLY_TO_MISMATCH')).toBe(true);
  });

  it('integrates seamlessly with analyzeOffer pipeline', () => {
    const res = analyzeOffer({
      text: 'Congratulations! You have been selected for Associate Software Engineer at TCS with competitive package.',
      domain: 'job',
      sender: {
        organization: 'TCS',
        headers: 'Authentication-Results: mx.google.com; dmarc=fail (p=reject)',
      },
    });

    expect(res.signals.some((s) => s.ruleId === 'RULE_EMAIL_DMARC_FAILED')).toBe(true);
    expect(res.status).toBe('HIGH_CONCERN');
  });
});

