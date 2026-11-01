import type { Signal } from '../schemas/index.js';

export interface EmailHeaderParseResult {
  hasHeaders: boolean;
  spfStatus?: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none';
  dkimStatus?: 'pass' | 'fail' | 'neutral' | 'none';
  dmarcStatus?: 'pass' | 'fail' | 'neutral' | 'none';
  fromHeader?: string;
  replyToHeader?: string;
  isDomainMismatched?: boolean;
  signals: Signal[];
}

/**
 * Parses raw RFC 822 email headers provided by the user to evaluate
 * authentication signals (SPF, DKIM, DMARC) and From/Reply-To divergence.
 */
export function evaluateEmailHeaders(headersText?: string): EmailHeaderParseResult {
  if (!headersText || headersText.trim().length === 0) {
    return { hasHeaders: false, signals: [] };
  }

  const raw = headersText.toLowerCase();
  const signals: Signal[] = [];

  let spfStatus: EmailHeaderParseResult['spfStatus'] = undefined;
  let dkimStatus: EmailHeaderParseResult['dkimStatus'] = undefined;
  let dmarcStatus: EmailHeaderParseResult['dmarcStatus'] = undefined;

  // 1. SPF Inspection
  if (/spf=(?:fail|softfail)/i.test(raw) || /received-spf:\s*(?:fail|softfail)/i.test(raw)) {
    spfStatus = raw.includes('spf=softfail') ? 'softfail' : 'fail';
    const match = headersText.match(/(?:received-spf:[^\r\n]+|spf=(?:fail|softfail)[^\r\n;]*)/i);
    signals.push({
      id: 'SIG_EMAIL_SPF_FAILED',
      ruleId: 'RULE_EMAIL_SPF_FAILED',
      title: 'Sender Policy Framework (SPF) Validation Failed',
      severity: 'high',
      category: 'brand_impersonation',
      whyItMatters:
        'The sending mail server is not authorized by the claimed domain owner to send emails on their behalf, indicating spoofing.',
      evidence: match ? match[0].trim().slice(0, 160) : 'spf=fail detected in email headers',
    });
  } else if (/spf=pass/i.test(raw) || /received-spf:\s*pass/i.test(raw)) {
    spfStatus = 'pass';
  }

  // 2. DKIM Inspection
  if (/dkim=(?:fail|neutral)/i.test(raw)) {
    dkimStatus = raw.includes('dkim=fail') ? 'fail' : 'neutral';
    if (dkimStatus === 'fail') {
      const match = headersText.match(/dkim=fail[^\r\n;]*/i);
      signals.push({
        id: 'SIG_EMAIL_DKIM_FAILED',
        ruleId: 'RULE_EMAIL_DKIM_FAILED',
        title: 'Cryptographic DKIM Signature Verification Failed',
        severity: 'high',
        category: 'brand_impersonation',
        whyItMatters:
          'The cryptographic digital signature on the email could not be verified, suggesting the message was modified or forged.',
        evidence: match ? match[0].trim().slice(0, 160) : 'dkim=fail detected in email headers',
      });
    }
  } else if (/dkim=pass/i.test(raw)) {
    dkimStatus = 'pass';
  }

  // 3. DMARC Inspection
  if (/dmarc=fail/i.test(raw)) {
    dmarcStatus = 'fail';
    const match = headersText.match(/dmarc=fail[^\r\n;]*/i);
    signals.push({
      id: 'SIG_EMAIL_DMARC_FAILED',
      ruleId: 'RULE_EMAIL_DMARC_FAILED',
      title: 'Domain-based Message Authentication (DMARC) Failed',
      severity: 'critical',
      category: 'brand_impersonation',
      whyItMatters:
        'The email failed domain alignment authentication policies set by the sender domain, a strong sign of domain impersonation.',
      evidence: match ? match[0].trim().slice(0, 160) : 'dmarc=fail detected in email headers',
    });
  } else if (/dmarc=pass/i.test(raw)) {
    dmarcStatus = 'pass';
  }

  // 4. From vs Reply-To Mismatch
  const fromMatch = headersText.match(/(?:^|\n)from:\s*([^<\r\n]+<([^>]+)>|([^\r\n]+))/i);
  const replyToMatch = headersText.match(/(?:^|\n)reply-to:\s*([^<\r\n]+<([^>]+)>|([^\r\n]+))/i);

  let isDomainMismatched = false;
  if (fromMatch && replyToMatch) {
    const fromAddr = (fromMatch[2] || fromMatch[3] || '').trim().toLowerCase();
    const replyToAddr = (replyToMatch[2] || replyToMatch[3] || '').trim().toLowerCase();

    const fromDomain = fromAddr.split('@')[1];
    const replyToDomain = replyToAddr.split('@')[1];

    if (fromDomain && replyToDomain && fromDomain !== replyToDomain) {
      isDomainMismatched = true;
      signals.push({
        id: 'SIG_EMAIL_REPLY_TO_MISMATCH',
        ruleId: 'RULE_EMAIL_REPLY_TO_MISMATCH',
        title: 'Discrepancy Between Sender Domain and Reply Address',
        severity: 'medium',
        category: 'unverified_contact',
        whyItMatters:
          'Replies to this email will be directed to a different domain than the claimed sender, commonly used by scammers to intercept replies.',
        evidence: `From: ${fromDomain} vs Reply-To: ${replyToDomain}`.slice(0, 160),
      });
    }
  }

  return {
    hasHeaders: true,
    spfStatus,
    dkimStatus,
    dmarcStatus,
    fromHeader: fromMatch ? fromMatch[0].trim() : undefined,
    replyToHeader: replyToMatch ? replyToMatch[0].trim() : undefined,
    isDomainMismatched,
    signals,
  };
}
